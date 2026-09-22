# Task: Test: admissions — list and filtering

**Phase:** [Phase 5 — Admissions](../../phases/phase-5-admissions.md)
**Depends on:** [task-5-1-admit](./task-5-1-admit.md)
**Status:** Not started

List shows all admissions; filter/view by status, by ward, by doctor,
by department — these all have dedicated backend endpoints
(`/admissions/status/{status}`, `/admissions/ward/{ward}/active`,
`/admissions/doctor/{doctorId}`,
`/admissions/department/{departmentId}`) so the UI likely has
corresponding filter controls; confirm each one actually works, don't
assume they're all wired up equally.
