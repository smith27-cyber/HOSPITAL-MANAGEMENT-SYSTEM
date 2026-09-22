# Phase 5 — Admissions

**Plan:** [playwright-plan.md](../playwright-plan.md)
**Depends on:** [Phase 0](./phase-0-foundation.md), [Phase 1](./phase-1-auth-and-shell.md), [Phase 2](./phase-2-patients.md), [Phase 3](./phase-3-doctors-departments.md)
**Status:** Not started

The most state-machine-heavy module in the app — an admission moves
through `ADMITTED → DISCHARGED | TRANSFERRED | CANCELLED`
(`Admission.AdmissionStatus`, confirmed from the entity itself, not
guessed), plus ward/bed transfers within the `ADMITTED` state. This
deserves more scenario coverage than a typical CRUD module.

## Scope

`AdmissionListComponent`, `AdmissionRegisterComponent`,
`AdmissionEditComponent`, `AdmissionDetailsComponent`. Routes:
`/admissions`, `/admissions/register`, `/admissions/:id`,
`/admissions/:id/edit`. Fields: Patient, Doctor, Department, Ward
(`GENERAL`/`PRIVATE`/`PEDIATRIC`/`MATERNITY`/`SURGICAL`/`ICU`/`EMERGENCY`/`OTHER`),
Bed Number, Admission Type
(`EMERGENCY`/`ROUTINE`/`REFERRAL`/`SURGICAL`/`MATERNITY`/`OTHER`), Status,
Reason, Diagnosis, Notes, Admission/Expected-Discharge/Discharge dates.

## Test Scenarios

### Admit (Register)
- [ ] Admit an existing patient — select doctor, department, ward, bed
      number, admission type, reason. Confirm it appears in the list with
      status `ADMITTED`.
- [ ] Required-field validation (ward and admission type are non-nullable
      per the entity — confirm the UI enforces this before submit).
- [ ] A patient who already has an **active admission** — confirm what
      the UI does (the backend has a dedicated
      `GET /admissions/patient/{patientId}/active` endpoint specifically
      for checking this; confirm the UI actually uses it to warn/block,
      or if it currently doesn't, note that as a finding, not an
      assumption).

### List & Filtering
- [ ] List shows all admissions; filter/view by status, by ward, by
      doctor, by department — these all have dedicated backend endpoints
      (`/admissions/status/{status}`, `/admissions/ward/{ward}/active`,
      `/admissions/doctor/{doctorId}`, `/admissions/department/{departmentId}`)
      so the UI likely has corresponding filter controls; confirm each one
      actually works, don't assume they're all wired up equally.

### Transfer
- [ ] Transfer an active admission to a different ward/bed — confirm the
      change reflects immediately in the list and in ward-based views.
- [ ] Transfer history (if shown anywhere) reflects the change.

### Discharge
- [ ] Discharge an active admission — status becomes `DISCHARGED`,
      discharge date is set, and it drops out of "active" views (queue,
      ward views) while still appearing in the full list/history.

### Cancel
- [ ] Cancel an admission (distinct from discharge — check the UI
      actually distinguishes these two actions clearly, since they're
      easy to confuse) — status becomes `CANCELLED`.

### Statistics
- [ ] If the dashboard or admissions module surfaces the statistics
      endpoints (`count`, `active`, `discharged`, `transferred`,
      `cancelled`), confirm the numbers shown actually match reality
      after the above scenarios run (a good way to catch a UI showing
      stale/cached counts).
