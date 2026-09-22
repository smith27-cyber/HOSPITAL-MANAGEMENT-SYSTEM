# Task: Test: appointments — schedule, conflicts, queue, status, consultation link

**Phase:** [Phase 4 — Appointments & Consultations](../../phases/phase-4-appointments-consultations.md)
**Depends on:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md), [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md), [Phase 2 — Patients Module](../../phases/phase-2-patients.md) (needs patients), [Phase 3 — Doctors & Departments](../../phases/phase-3-doctors-departments.md) (needs doctors)
**Status:** Not started

- Schedule a new appointment for an existing patient + doctor, confirm
  it appears in the list and the queue.
- **Conflict checking** — `API_DESIGN.md` documents a 409 "Doctor is not
  available at this time" response; confirm the UI surfaces this to the
  user rather than failing silently or showing a generic error.
- Queue view — shows waiting appointments in the right order/state;
  confirm what "queue position" and "wait time" actually reflect.
- Update appointment status (scheduled → completed / cancelled) and
  confirm it's reflected in the list and queue immediately.
- Edit an appointment (reschedule) — confirm conflict checking still
  applies.
- From an appointment's details, follow the link to
  `/appointments/:id/consultation` and confirm it either opens an
  existing consultation or starts creating a new one, consistently.
