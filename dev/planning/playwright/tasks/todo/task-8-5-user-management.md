# Task: Test: user management (RBAC administration)

**Phase:** [Phase 8 — Reports & Settings](../../phases/phase-8-reports-settings.md)
**Depends on:** [task-8-4-profile-settings](./task-8-4-profile-settings.md)
**Status:** Not started

Requires the confirmed admin/manager account from
[task-0-8-confirm-admin-login](./task-0-8-confirm-admin-login.md).
- List users, create a new user with a specific role, confirm they can
  immediately log in with that role's actual permissions — a genuine
  end-to-end check, not just "the create form submitted."
- Edit a user's role/status; deactivate a user and confirm they can no
  longer log in.
- Change a user's password (if exposed here) and confirm the old
  password stops working.
- Access this page as a non-manager role and confirm it's
  blocked/hidden — the `UserController`'s
  `@PreAuthorize("hasAuthority('SETTINGS_USER_MANAGE')")` is a real,
  specific permission to test against, not a generic "some roles can't
  see this." 
