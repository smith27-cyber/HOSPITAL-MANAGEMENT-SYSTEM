# Phase 0 — Foundation & Test Infrastructure

**Plan:** [plan.md](../plan.md)
**Depends on:** nothing — this blocks everything else
**Status:** Not started

Decisions and scaffolding needed before any real test scenario can be
written. Getting these wrong means rewriting every test later, so they're
called out explicitly rather than assumed.

## Open decisions (need answers, not just code)

- [ ] **Base URL: `ng serve` (4200) vs `hms-webb` (8080), or both?**
      `ng serve` is faster to iterate against locally; `hms-webb` matches
      what a real user actually gets in the packaged path (see
      `dev/architecture/20260922/WEBB_MODULE.md`). Recommend: parametrize via
      env var (`PLAYWRIGHT_BASE_URL` or similar) so the same suite runs
      against either, and CI runs it against `hms-webb` at least once
      since that's the real deployment shape.
- [ ] **Test data strategy.** Many flows need existing reference data
      (a department before you can register a doctor into it, a patient
      before an appointment, etc.). Decide: seed via direct API calls in a
      `beforeAll`/fixture (fast, but bypasses the UI you're supposed to be
      testing for *setup* — acceptable, since the UI under test is the
      *subject*, not the setup) vs. create everything through the UI in
      each test (slower, more brittle, but tests the create-flows too as a
      side effect). Recommend: API-seeded seed data for prerequisites,
      UI-driven for the thing actually being tested.
- [ ] **Test isolation.** The app persists real state in Postgres — tests
      running in parallel (or repeatedly) will collide on names/unique
      fields (e.g. patient email, department name) unless test data is
      uniquified (e.g. a timestamp or UUID suffix per test run). Decide
      the convention now, use it everywhere.
- [ ] **Auth reuse.** Don't log in via the UI in every single test —
      Playwright's `storageState` lets you log in once per role and reuse
      the authenticated session. Set up one fixture per seeded role (see
      `plan.md`'s account list), plus resolve the admin/`SUPER_ADMIN`
      account question before writing an admin fixture.
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
- [ ] Confirm the exact seeded `ADMIN`/`SUPER_ADMIN` login (referenced in
      `RbacDataInitializer.java` but not confirmed while writing this
      plan) — needed for the Settings/user-management tests in
      [Phase 8](./phase-8-reports-settings.md) and the RBAC comparison
      tests in [Phase 9](./phase-9-rbac-and-error-handling.md).
- [ ] Update `dev/testing/playwright/README.md` to describe the new
      structure once it exists (it currently documents the
      single-smoke-test setup being replaced).
