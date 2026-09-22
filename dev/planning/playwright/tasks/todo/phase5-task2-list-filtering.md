# Task: Test: admissions — list and filtering

**Phase:** [Phase 5 — Admissions](../../phases/phase-5-admissions.md)
**Depends on:** [phase5-task1-admit](./phase5-task1-admit.md)
**Status:** Not started

List shows all admissions; filter/view by status, by ward, by doctor,
by department — these all have dedicated backend endpoints
(`/admissions/status/{status}`, `/admissions/ward/{ward}/active`,
`/admissions/doctor/{doctorId}`,
`/admissions/department/{departmentId}`) so the UI likely has
corresponding filter controls; confirm each one actually works, don't
assume they're all wired up equally.
