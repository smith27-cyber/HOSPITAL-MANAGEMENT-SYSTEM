# Task: Test: Journey 1 — outpatient visit, start to finish

**Phase:** [Phase 10 — Full User Journeys (Cross-Module)](../../phases/phase-10-full-user-journeys.md)
**Depends on:** Phases 2-8 (chains together interactions already tested individually)
**Status:** Not started

- Register a new patient (or use an existing one).
- Schedule an appointment with a doctor.
- Complete the appointment via a consultation: enter diagnosis, add a
  prescription.
- Confirm the prescription appears in the Pharmacy queue and can be
  fulfilled there.
- Confirm the consultation generates (or allows generating) a billing
  invoice with the correct items/total.
- Record a payment against that invoice and confirm it's marked paid.
- **Assert at the end:** the patient's profile shows this appointment,
  this consultation, and this invoice all correctly linked — not just
  that each individual step succeeded in isolation.
