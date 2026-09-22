# Phase 8 — Reports & Settings

**Plan:** [plan.md](../plan.md)
**Depends on:** [Phase 0](./phase-0-foundation.md), [Phase 1](./phase-1-auth-and-shell.md)
**Status:** Not started

## Scope

**Reports:** `ReportComponent`. Route: `/reports`. Types: patient
statistics, appointment analytics, financial reports, department
performance, doctor performance.

**Settings:** `HospitalSettingsComponent` (**backend-backed** — real
persistence via `GET/PUT /api/settings/hospital`,
`POST /api/settings/hospital/reset`), `SystemPreferencesComponent`
(**frontend-only**, no backend persistence),
`NotificationSettingsComponent` (**frontend-only**),
`ProfileSettingsComponent`, `UserManagementComponent` (RBAC
administration). Routes: `/settings/hospital`, `/settings/system`,
`/settings/notifications`, `/settings/profile`, `/settings/users`.

## Test Scenarios

### Reports
- [ ] Each report type listed above actually renders something (not a
      blank page or perpetual loading state) — confirm which report types
      are genuinely implemented vs. placeholders, since `COMPONENTS.md`'s
      description of this module is one of the thinner ones in the
      codebase.
- [ ] If reports take filters (date range, department, doctor), confirm
      changing a filter actually changes the displayed data, not just the
      control's own state.

### Hospital Settings (real backend persistence — test this like any
other data-backed feature)
- [ ] Load current settings, confirm they match what's actually in the
      database (or a known seeded value).
- [ ] Update a setting (name, address, operating hours), save, **reload
      the page**, and confirm the change persisted — this is the
      meaningful test here, since it's backed by a real `PUT` endpoint,
      not a fake save.
- [ ] Reset to defaults (`POST .../reset`) and confirm the UI reflects
      the reset values.
- [ ] Permission check: only a role with `SETTINGS_HOSPITAL_UPDATE`
      should be able to save changes — a role without it should see the
      form as read-only or get a rejected request (cross-check with
      [Phase 9](./phase-9-rbac-and-error-handling.md), not duplicated in
      depth here).

### System Preferences & Notification Settings (frontend-only — test
this like a feature with a known, documented limitation, not like a bug)
- [ ] Change a setting, **reload the page**, and confirm the *actual*
      behavior: per `STATUS_OVERVIEW.md`/`FEATURE_COMPLETENESS.md`, these
      have no backend persistence, so the expected result is that the
      change does **not** survive a reload. Write the test to assert the
      documented reality, and flag it clearly as testing a known
      limitation — if it turns out these settings *do* persist (e.g. via
      `localStorage`), that's a documentation-vs-reality mismatch worth
      reporting back, not silently accepting either way.

### Profile Settings
- [ ] Update the logged-in user's own profile info, confirm it's
      reflected (e.g. in the nav/header if the name is shown there).

### User Management (RBAC administration)
- [ ] Requires the confirmed admin/manager account from
      [Phase 0](./phase-0-foundation.md). List users, create a new user
      with a specific role, confirm they can immediately log in with that
      role's actual permissions (a genuine end-to-end check, not just
      "the create form submitted").
- [ ] Edit a user's role/status; deactivate a user and confirm they can no
      longer log in.
- [ ] Change a user's password (if exposed here) and confirm the old
      password stops working.
- [ ] Access this page as a non-manager role and confirm it's
      blocked/hidden — the `UserController`'s
      `@PreAuthorize("hasAuthority('SETTINGS_USER_MANAGE')")` is a real,
      specific permission to test against, not a generic "some roles
      can't see this."
