# Task: Confirm the seeded admin login (confirmed)

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [task-0-7-scaffold-suite-layout](./task-0-7-scaffold-suite-layout.md)
**Status:** Confirmed from source — `admin` / `admin123`, role `ADMIN`

Verified directly against `RbacDataInitializer.java`: if no `admin` user
exists yet, it's seeded with username `admin`, password `admin123`,
role `ADMIN`. There is **no** seeded `SUPER_ADMIN` login — `SUPER_ADMIN`
exists only as a `Role` entity with its own permission set; no `User` is
ever created with it. Any reference elsewhere in this plan to an
"admin/SUPER_ADMIN account" means `admin`/`admin123` (`ADMIN`) only.

Needed for the Settings/user-management tests in
[Phase 8](../../phases/phase-8-reports-settings.md) and the RBAC
comparison tests in
[Phase 9](../../phases/phase-9-rbac-and-error-handling.md).
