# Task: Decide the auth-reuse / storageState fixture setup

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [task-0-3-decide-test-isolation](./task-0-3-decide-test-isolation.md)
**Status:** Not started

Don't log in via the UI in every single test. Use Playwright's
`storageState` to log in once per seeded role and reuse the
authenticated session. Set up one fixture per seeded role (see
`playwright-plan.md`'s account list: `test_doctor`, `test_nurse`,
`test_receptionist`, `test_pharmacist`, `test_labtech`,
`test_accountant`, `test_records`, `test_manager`), plus the
admin/`SUPER_ADMIN` fixture once
[task-0-8-confirm-admin-login](./task-0-8-confirm-admin-login.md)
resolves the actual seeded admin login.
