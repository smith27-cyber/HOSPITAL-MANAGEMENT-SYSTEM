# Task: Test: consultations — create from appointment, diagnosis/prescriptions, profile, edit

**Phase:** [Phase 4 — Appointments & Consultations](../../phases/phase-4-appointments-consultations.md)
**Depends on:** [phase4-task1-appointments](./phase4-task1-appointments.md)
**Status:** Not started

- Create a consultation **from an appointment** (the realistic flow, not
  just navigating to `/consultations/register` directly) — confirm the
  appointment/patient/doctor context carries over correctly instead of
  being re-entered.
- Enter diagnosis, notes, and add prescription(s) inline (per
  `DATA_FLOW.md`'s documented consultation-creates-prescription
  transaction) — confirm the created prescription actually shows up in
  the Pharmacy module afterward
  ([Phase 6](../../phases/phase-6-pharmacy-laboratory.md)
  cross-check, not duplicated here).
- View consultation profile — all entered data renders, linked
  appointment/patient/doctor are correct and navigable.
- Edit consultation notes/diagnosis after creation.
- List and search consultations.
