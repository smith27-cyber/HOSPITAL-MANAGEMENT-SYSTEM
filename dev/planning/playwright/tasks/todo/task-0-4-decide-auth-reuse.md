# Task: Auth-reuse / session fixture setup (implemented & verified)

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [task-0-3-decide-test-isolation](./task-0-3-decide-test-isolation.md)
**Status:** Done — implemented in `dev/testing/playwright/tests/auth.setup.ts` +
`dev/testing/playwright/fixtures/auth.ts`, verified live end-to-end

## Correction: not Playwright's built-in `storageState`

The original plan here was `page.context().storageState({ path: ... })`,
Playwright's standard session-reuse mechanism. **That doesn't work for
this app.** Verified live: `storageState()` only captures cookies and
`localStorage`, but `AuthService` stores the session (`hms_token`,
`hms_user`) in `sessionStorage` — `storageState()` produces an empty
`{cookies: [], origins: []}` for every identity, silently. Every login
in `auth.setup.ts` "passed" under that design, because the test only
checked that login redirected to `/dashboard` — it never checked that
the *saved* file was actually reusable. It wasn't.

Fixed with a `sessionStorage`-specific capture/replay pair in
`fixtures/auth.ts` instead of the native API:
- `captureSession(page, identity)` — after login, reads
  `JSON.stringify(sessionStorage)` from the page and writes it to
  `.auth/<identity>.json`.
- `restoreSession(context, identity)` — reads that file and calls
  `context.addInitScript(...)` to write those same keys into
  `sessionStorage` **before** any of the app's own scripts run, so
  `AuthService` finds a valid token immediately on page load.

Verified end-to-end, not just unit-tested: a brand-new browser context
with only a restored session, navigating straight to `/dashboard` (never
touching `/login`), lands there fully authenticated — nav menu, "Welcome
back, Dev Login Doctor", and Billing/Inventory correctly absent for the
`DOCTOR` role.

Don't log in via the UI in every single test. Use Playwright's
recommended "setup project" pattern — and use the dev-login feature
(added after this decision was first made) instead of the real
username/password form, since it was built for exactly this:

- One `auth.setup.ts` file with one test per identity:
  - **9 via dev-login** — `thor` (`SUPER_ADMIN`) and the 8 `*-testuser`
    accounts (`doc-testuser` DOCTOR, `nurse-testuser` NURSE,
    `rec-testuser` RECEPTIONIST, `pharm-testuser` PHARMACIST,
    `lab-testuser` LABORATORY_TECHNICIAN, `acct-testuser` ACCOUNTANT,
    `records-testuser` RECORDS_OFFICER, `mgr-testuser`
    HOSPITAL_MANAGER) — one `POST /api/auth/dev-login` call each, no
    password needed. Requires `hms.dev-login.enabled=true` on whatever
    `hms-jar` instance the suite runs against.
  - **1 via the real form** — `admin` (per
    [task-0-8-confirm-admin-login](./task-0-8-confirm-admin-login.md):
    `admin`/`admin123`, role `ADMIN`). `ADMIN` has no dev-login account
    (only `SUPER_ADMIN`/`thor` does — they are different roles, not
    interchangeable), so `admin` still logs in through the real
    username/password form.
  - 10 identities, 10 tests total.
- Each test still drives the real UI (a dev-login button click is still
  a real UI action, consistent with
  [task-0-2](./task-0-2-decide-test-data-strategy.md)'s UI-only rule —
  neither path creates persistent data, so there's nothing to seed
  either way) and calls `captureSession(page, identity)` (see above)
  instead of the native `storageState()`.
- This setup project runs once at the start of the suite (Playwright's
  `dependencies` mechanism), not once per test — 10 logins total per
  full run, not one per test.
- Each spec calls `restoreSession(context, identity)` for whatever
  identity it needs — once for specs that only ever need one role, or
  in a loop across all 10 identities for
  [Phase 9](../../phases/phase-9-rbac-and-error-handling.md)'s
  comparison tests.
- The original password-based `test_doctor`/`test_nurse`/etc. accounts
  (`RbacDataInitializer.java`) still exist and are unaffected — this
  suite just doesn't use them for auth setup anymore. The permission
  set documented for `test_doctor` in
  [Phase 9](../../phases/phase-9-rbac-and-error-handling.md) is
  identical for `doc-testuser` (same `DOCTOR` role) — verified live
  when dev-login was built, not assumed.
