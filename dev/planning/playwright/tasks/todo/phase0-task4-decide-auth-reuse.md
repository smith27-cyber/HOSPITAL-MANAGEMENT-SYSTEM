# Task: Decide the auth-reuse / storageState fixture setup

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [phase0-task3-decide-test-isolation](./phase0-task3-decide-test-isolation.md)
**Status:** Not started

Don't log in via the UI in every single test. Use Playwright's
`storageState` to log in once per seeded role and reuse the
authenticated session. Set up one fixture per seeded role (see
`plan.md`'s account list: `test_doctor`, `test_nurse`,
`test_receptionist`, `test_pharmacist`, `test_labtech`,
`test_accountant`, `test_records`, `test_manager`), plus the
admin/`SUPER_ADMIN` fixture once
[phase0-task8-confirm-admin-login](./phase0-task8-confirm-admin-login.md)
resolves the actual seeded admin login.
