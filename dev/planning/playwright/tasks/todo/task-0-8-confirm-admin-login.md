# Task: Confirm the seeded ADMIN/SUPER_ADMIN login

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [task-0-7-scaffold-suite-layout](./task-0-7-scaffold-suite-layout.md)
**Status:** Not started

`RbacDataInitializer.java` references an `ADMIN`/`SUPER_ADMIN` role, but
the exact seeded login for it wasn't confirmed while writing the test
plan. Needed for the Settings/user-management tests in
[Phase 8](../../phases/phase-8-reports-settings.md) and
the RBAC comparison tests in
[Phase 9](../../phases/phase-9-rbac-and-error-handling.md).

Verify directly against `RbacDataInitializer.java` and a real login
call — don't assume a username/password pattern from the other 8
accounts.
