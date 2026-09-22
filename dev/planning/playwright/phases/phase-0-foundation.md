# Phase 0 — Foundation & Test Infrastructure

**Plan:** [playwright-plan.md](../playwright-plan.md)
**Depends on:** nothing — this blocks everything else
**Status:** Not started

Decisions and scaffolding needed before any real test scenario can be
written. Getting these wrong means rewriting every test later, so they're
called out explicitly rather than assumed.

## Open decisions (need answers, not just code)

- [x] **Base URL — decided: `ng serve` (4200) only.** This is a UI test
      suite for the Angular app (`hms-pom/hms-webb/angular`) — it shoots
      solely against `http://localhost:4200`, using `ng serve`'s own
      `proxy.conf.json` to reach the real `hms-jar` API on `:8081`. The
      packaged `hms-webb` module (8080) is not a test target, and there's
      no dual-target parametrization. See
      [task-0-1-decide-base-url](../tasks/todo/task-0-1-decide-base-url.md).
- [x] **Test data strategy — decided: UI-only, no API or DB seeding.**
      All test data, including prerequisite/reference data (a department
      before you can register a doctor into it, a patient before an
      appointment, etc.), is created by driving the real UI — never a
      direct API call, never a direct DB insert. Kept strictly top-down:
      any backend code exercised only via seeding would look "covered"
      without a real user action ever proving it reachable, hiding the
      dead-code signal this suite is meant to surface. See
      [task-0-2-decide-test-data-strategy](../tasks/todo/task-0-2-decide-test-data-strategy.md).
- [x] **Test isolation — decided: one shared `unique()` helper.** A
      shared helper prefixes the current test's own task ID (e.g.
      `task-3-1`) onto the label, then appends an 8-character
      `crypto.randomUUID()` suffix, for any field with a uniqueness
      constraint (patient email, department name, doctor license
      number, etc.) — e.g. `unique('Cardiology', testInfo)` →
      `"task-3-1-Cardiology-a3f9c2d1"`. The task-ID prefix makes any row
      found in Postgres traceable back to the exact test that created
      it. Used everywhere, no per-phase variants. See
      [task-0-3-decide-test-isolation](../tasks/todo/task-0-3-decide-test-isolation.md).
- [x] **Auth reuse — done: one setup project, sessionStorage
      capture/replay, via dev-login.** A single `auth.setup.ts`
      establishes 10 identities once — 9 via the no-password `POST
      /api/auth/dev-login` (`thor`/`SUPER_ADMIN` plus 8 `*-testuser`
      accounts, one per RBAC role) and `admin`/`admin123` via the real
      form (no dev-login account exists for plain `ADMIN`). **Not**
      Playwright's built-in `storageState()` — verified live that it
      silently captures nothing, since this app's session lives in
      `sessionStorage`, which `storageState()` doesn't cover. Fixed
      with a custom `captureSession`/`restoreSession` pair in
      `fixtures/auth.ts`. Runs once per full suite run via Playwright's
      `dependencies` mechanism, not once per test; verified end-to-end
      (fresh context + restored session reaches `/dashboard`
      authenticated, never touching `/login`). See
      [task-0-4-decide-auth-reuse](../tasks/todo/task-0-4-decide-auth-reuse.md).
- [x] **Coverage tooling — decided: drop instrument-serve.js.** Read
      directly, not assumed usable: it hardcodes port 4200 (collides
      with the decided `ng serve` target), has zero `/api/**` proxying
      to `hms-jar` (every API call would 404), and serves a stale
      prebuilt `dist/hms-frontend/browser/` path with no live reload.
      Dropping `hms-pom/hms-webb/angular/instrument-serve.js`,
      `dev/testing/playwright/.nycrc.json`,
      `dev/testing/playwright/merge-coverage.js`; using Playwright's
      built-in `page.coverage` (V8) instead when frontend coverage is
      wanted. Backend (`hms-jar`) coverage — the actual dead-code
      signal this plan cares about — isn't set up by this decision;
      flagged as a separate, still-open gap. See
      [task-0-5-decide-coverage-tooling](../tasks/todo/task-0-5-decide-coverage-tooling.md).
- [x] **CI — decided: Postgres in Docker, everything else as plain
      processes on the same runner.** `hms-jar` must run as a plain
      process alongside `ng serve`, never its own container — dev-login
      ([task-0-4](../tasks/todo/task-0-4-decide-auth-reuse.md)) requires
      a loopback caller, which breaks across separate Docker containers'
      bridge network. Two Playwright `webServer` entries manage
      `hms-jar` (with `HMS_DEV_LOGIN_ENABLED=true`) and `ng serve`;
      headless in CI, `retries: 2` in CI / `0` locally,
      `trace: 'on-first-retry'`. See
      [task-0-6-decide-ci](../tasks/todo/task-0-6-decide-ci.md).

## Scaffolding tasks

- [x] Scaffolded the foundation pieces of `dev/testing/playwright/`:
      `playwright.config.ts` (base URL, two `webServer` entries,
      setup/chromium projects, CI settings), `fixtures/auth.ts`
      (identity lists + session capture/replay), `tests/auth.setup.ts`
      (10 logins, verified live end-to-end). Removed the dead coverage
      tooling per [task-0-5](../tasks/todo/task-0-5-decide-coverage-tooling.md).
      Per-module `tests/*`/`pages/*` deliberately **not** scaffolded
      ahead of need — each phase builds its own when it starts. See
      [task-0-7-scaffold-suite-layout](../tasks/todo/task-0-7-scaffold-suite-layout.md).
- [x] Confirmed the seeded admin login from `RbacDataInitializer.java`:
      `admin`/`admin123`, role `ADMIN`. No `SUPER_ADMIN` login exists —
      that role has no `User` seeded against it. Needed for the
      Settings/user-management tests in
      [Phase 8](./phase-8-reports-settings.md) and the RBAC comparison
      tests in [Phase 9](./phase-9-rbac-and-error-handling.md). See
      [task-0-8-confirm-admin-login](../tasks/todo/task-0-8-confirm-admin-login.md).
- [ ] Update `dev/testing/playwright/README.md` to describe the new
      structure once it exists (it currently documents the
      single-smoke-test setup being replaced).
