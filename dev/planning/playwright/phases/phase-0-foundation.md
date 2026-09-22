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
- [x] **Auth reuse — decided: one setup project, storageState per
      identity, via dev-login.** A single `auth.setup.ts` establishes
      10 identities once — 9 via the no-password `POST
      /api/auth/dev-login` (`thor`/`SUPER_ADMIN` plus 8 `*-testuser`
      accounts, one per RBAC role) and `admin`/`admin123` via the real
      form (no dev-login account exists for plain `ADMIN`) — and saves
      each session's `storageState` to its own file; a shared fixture
      loads the right file per spec. Runs once per full suite run via
      Playwright's `dependencies` mechanism, not once per test. See
      [task-0-4-decide-auth-reuse](../tasks/todo/task-0-4-decide-auth-reuse.md).
- [ ] **What happens to the existing coverage-instrumentation tooling
      (`dev/testing/playwright/instrument-serve.js`-adjacent setup in
      `hms-pom/hms-webb/angular/instrument-serve.js`, `.nycrc.json`,
      `merge-coverage.js`)?** The current test's *content* is replaced,
      but this instrumentation infrastructure is arguably still valuable
      for the new suite (coverage of what the E2E tests actually
      exercise). Decide: keep and reconnect it to the new suite, or drop
      it in favor of Playwright's own built-in coverage APIs (V8
      coverage), which are more standard for this Playwright version and
      don't require a custom instrumented server.
- [ ] **CI considerations.** Headless run, retry-on-failure count,
      screenshot/trace-on-failure artifacts, and whether `hms-jar` +
      Postgres get spun up automatically in CI (via the project's
      `docker-compose.yml`) or assumed already running.

## Scaffolding tasks

- [ ] Replace `dev/testing/playwright/`'s single-purpose structure with a
      real suite layout — a `tests/` folder organized by feature module
      (matching the phases in this plan), a `fixtures/` folder for the
      per-role auth fixtures, and a `pages/` (or similar) folder for a
      Page Object Model per feature module if that pattern is adopted
      (recommended, given 13 modules with repeated list/create/edit/detail
      shapes — a shared base page object for that shape avoids massive
      duplication).
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
