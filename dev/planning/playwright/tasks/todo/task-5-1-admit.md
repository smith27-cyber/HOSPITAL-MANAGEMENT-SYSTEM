# Task: Test: admissions — admit (register)

**Phase:** [Phase 5 — Admissions](../../phases/phase-5-admissions.md)
**Depends on:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md), [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md), [Phase 2 — Patients Module](../../phases/phase-2-patients.md), [Phase 3 — Doctors & Departments](../../phases/phase-3-doctors-departments.md)
**Status:** Not started

- Admit an existing patient — select doctor, department, ward, bed
  number, admission type, reason. Confirm it appears in the list with
  status `ADMITTED`.
- Required-field validation (ward and admission type are non-nullable
  per the `Admission` entity — confirm the UI enforces this before
  submit).
- A patient who already has an **active admission** — confirm what the
  UI does. The backend has a dedicated
  `GET /admissions/patient/{patientId}/active` endpoint specifically for
  checking this; confirm the UI actually uses it to warn/block, or if it
  currently doesn't, note that as a finding, not an assumption.
