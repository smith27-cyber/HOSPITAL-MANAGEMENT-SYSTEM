# Phase 4 — Appointments & Consultations

**Plan:** [playwright-plan.md](../playwright-plan.md)
**Depends on:** [Phase 0](./phase-0-foundation.md), [Phase 1](./phase-1-auth-and-shell.md), [Phase 2](./phase-2-patients.md) (needs patients), [Phase 3](./phase-3-doctors-departments.md) (needs doctors)
**Status:** Not started

The first genuinely **stateful workflow** in this plan — an appointment
has a status lifecycle (scheduled → completed/cancelled) and links
forward into a consultation. This is where "user flow" testing starts to
matter more than "does the form work."

## Scope

**Appointments:** `AppointmentListComponent`,
`AppointmentRegisterComponent`, `AppointmentQueueComponent`,
`AppointmentDetailsComponent`. Routes: `/appointments`,
`/appointments/register`, `/appointments/queue`, `/appointments/:id`,
`/appointments/:id/edit`, `/appointments/:id/consultation`. Fields:
Patient, Doctor, Date/Time, Status, Notes.

**Consultations:** `ConsultationListComponent`,
`ConsultationFormComponent`, `ConsultationProfileComponent`. Routes:
`/consultations`, `/consultations/register`, `/consultations/:id`,
`/consultations/:id/edit`. Fields: Patient, Doctor, Appointment,
Consultation Notes, Diagnosis, Prescriptions, Date/Time.

## Test Scenarios

### Appointments
- [ ] Schedule a new appointment for an existing patient + doctor,
      confirm it appears in the list and the queue.
- [ ] **Conflict checking** — `API_DESIGN.md` documents a 409 "Doctor is
      not available at this time" response; confirm the UI surfaces this
      to the user rather than failing silently or showing a generic error.
- [ ] Queue view — shows waiting appointments in the right order/state;
      confirm what "queue position" and "wait time" actually reflect.
- [ ] Update appointment status (scheduled → completed / cancelled) and
      confirm it's reflected in the list and queue immediately.
- [ ] Edit an appointment (reschedule) — confirm conflict checking still
      applies.
- [ ] From an appointment's details, follow the link to
      `/appointments/:id/consultation` and confirm it either opens an
      existing consultation or starts creating a new one, consistently.

### Consultations
- [ ] Create a consultation **from an appointment** (the realistic flow,
      not just navigating to `/consultations/register` directly) —
      confirm the appointment/patient/doctor context carries over
      correctly instead of being re-entered.
- [ ] Enter diagnosis, notes, and add prescription(s) inline (per
      `DATA_FLOW.md`'s documented consultation-creates-prescription
      transaction) — confirm the created prescription actually shows up
      in the Pharmacy module afterward ([Phase 6](./phase-6-pharmacy-laboratory.md)
      cross-check, not duplicated here).
- [ ] View consultation profile — all entered data renders, linked
      appointment/patient/doctor are correct and navigable.
- [ ] Edit consultation notes/diagnosis after creation.
- [ ] List and search consultations.

### Lifecycle integrity
- [ ] Completing a consultation updates the originating appointment's
      status (if that's how it's wired) — confirm actual behavior rather
      than assume.
