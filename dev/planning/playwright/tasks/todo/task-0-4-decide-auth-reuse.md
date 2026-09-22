# Task: Auth-reuse / storageState fixture setup (decided)

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [task-0-3-decide-test-isolation](./task-0-3-decide-test-isolation.md)
**Status:** Decided — one Playwright setup project, storageState per role

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
  either way) and saves
  `page.context().storageState({ path: 'playwright/.auth/<identity>.json' })`.
- This setup project runs once at the start of the suite (Playwright's
  `dependencies` mechanism), not once per test — 10 logins total per
  full run, not one per test.
- A shared fixture loads the right file for whatever a given spec
  needs: `test.use({ storageState: authFile('doc-testuser') })` for
  specs that only ever need one role, or a role-parameterized fixture
  for [Phase 9](../../phases/phase-9-rbac-and-error-handling.md)'s
  tests that loop across all 10 identities in one spec.
- The original password-based `test_doctor`/`test_nurse`/etc. accounts
  (`RbacDataInitializer.java`) still exist and are unaffected — this
  suite just doesn't use them for auth setup anymore. The permission
  set documented for `test_doctor` in
  [Phase 9](../../phases/phase-9-rbac-and-error-handling.md) is
  identical for `doc-testuser` (same `DOCTOR` role) — verified live
  when dev-login was built, not assumed.
