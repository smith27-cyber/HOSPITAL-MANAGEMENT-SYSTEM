# Task: Test: hospital settings — real backend persistence

**Phase:** [Phase 8 — Reports & Settings](../../phases/phase-8-reports-settings.md)
**Depends on:** [task-8-1-reports](./task-8-1-reports.md)
**Status:** Not started

`HospitalSettingsComponent` is backend-backed (`GET/PUT
/api/settings/hospital`, `POST /api/settings/hospital/reset`) — test it
like any other data-backed feature:
- Load current settings, confirm they match what's actually in the
  database (or a known seeded value).
- Update a setting (name, address, operating hours), save, **reload the
  page**, and confirm the change persisted — this is the meaningful test
  here, since it's backed by a real `PUT` endpoint, not a fake save.
- Reset to defaults (`POST .../reset`) and confirm the UI reflects the
  reset values.
- Permission check: only a role with `SETTINGS_HOSPITAL_UPDATE` should
  be able to save changes — a role without it should see the form as
  read-only or get a rejected request (cross-check with
  [Phase 9](../../phases/phase-9-rbac-and-error-handling.md),
  not duplicated in depth here).
