# Task: Auth-reuse / storageState fixture setup (decided)

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [task-0-3-decide-test-isolation](./task-0-3-decide-test-isolation.md)
**Status:** Decided — one Playwright setup project, storageState per role

Don't log in via the UI in every single test. Use Playwright's
recommended "setup project" pattern:

- One `auth.setup.ts` file with one test per seeded identity — the 8
  RBAC test accounts (`test_doctor`, `test_nurse`, `test_receptionist`,
  `test_pharmacist`, `test_labtech`, `test_accountant`, `test_records`,
  `test_manager`) plus `admin` (per
  [task-0-8-confirm-admin-login](./task-0-8-confirm-admin-login.md):
  `admin`/`admin123`, role `ADMIN` — there is no seeded `SUPER_ADMIN`
  login, only the `Role` exists with no `User`). 9 identities, 9 tests.
- Each of those 9 tests logs in through the real UI (this is itself a
  UI flow, consistent with
  [task-0-2](./task-0-2-decide-test-data-strategy.md)'s UI-only rule —
  it creates no persistent data, so there's nothing to seed) and saves
  `page.context().storageState({ path: 'playwright/.auth/<role>.json' })`.
- This setup project runs once at the start of the suite (Playwright's
  `dependencies` mechanism), not once per test — 9 logins total per
  full run, not one per test.
- A shared fixture loads the right file for whatever a given spec
  needs: `test.use({ storageState: authFile('test_doctor') })` for
  specs that only ever need one role, or a role-parameterized fixture
  for [Phase 9](../../phases/phase-9-rbac-and-error-handling.md)'s
  tests that loop across all 9 identities in one spec.
