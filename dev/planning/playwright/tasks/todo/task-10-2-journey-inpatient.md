# Task: Test: Journey 2 — inpatient stay, start to finish

**Phase:** [Phase 10 — Full User Journeys (Cross-Module)](../../phases/phase-10-full-user-journeys.md)
**Depends on:** [task-10-1-journey-outpatient](./task-10-1-journey-outpatient.md)
**Status:** Not started

- Admit a patient (ward/bed assignment).
- Create a consultation during the stay.
- Submit a lab request from that consultation, then enter/view results.
- Transfer the patient to a different ward.
- Discharge the patient.
- Generate and pay a billing invoice covering the stay.
- **Assert at the end:** the admission's final status is `DISCHARGED`,
  its history shows the transfer, and the patient's profile reflects
  the complete stay.
