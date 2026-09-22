# Phase 10 — Full User Journeys (Cross-Module)

**Plan:** [playwright-plan.md](../playwright-plan.md)
**Depends on:** Phases 2–8 (chains together interactions already tested individually)
**Status:** Not started

Everything before this phase tests one module at a time. This phase tests
the thing a real hospital user actually does: a single continuous task
that crosses many modules. If every individual module test passes but
these fail, that's the most valuable kind of finding this whole suite can
produce — it means the parts work but the seams don't.

## Journeys

### Journey 1 — Outpatient visit, start to finish
- [ ] Register a new patient (or use an existing one).
- [ ] Schedule an appointment with a doctor.
- [ ] Complete the appointment via a consultation: enter diagnosis, add a
      prescription.
- [ ] Confirm the prescription appears in the Pharmacy queue and can be
      fulfilled there.
- [ ] Confirm the consultation generates (or allows generating) a billing
      invoice with the correct items/total.
- [ ] Record a payment against that invoice and confirm it's marked paid.
- [ ] **Assert at the end:** the patient's profile shows this appointment,
      this consultation, and this invoice all correctly linked — not just
      that each individual step succeeded in isolation.

### Journey 2 — Inpatient stay, start to finish
- [ ] Admit a patient (ward/bed assignment).
- [ ] Create a consultation during the stay.
- [ ] Submit a lab request from that consultation, then enter/view
      results.
- [ ] Transfer the patient to a different ward.
- [ ] Discharge the patient.
- [ ] Generate and pay a billing invoice covering the stay.
- [ ] **Assert at the end:** the admission's final status is
      `DISCHARGED`, its history shows the transfer, and the patient's
      profile reflects the complete stay.

### Journey 3 — Administrative setup
- [ ] Log in as the confirmed admin/manager account.
- [ ] Create a new user with a specific role.
- [ ] Log out, log in as that new user, and confirm their actual
      permissions match what was assigned (reuses
      [Phase 9](./phase-9-rbac-and-error-handling.md)'s permission-capture
      approach).
- [ ] Update hospital settings (name/address) and confirm the change is
      visible somewhere else in the app that displays it (if anywhere
      does — confirm, don't assume a specific location).

### Journey 4 — A denied action, end to end
- [ ] Log in as a role known (from [Phase 9](./phase-9-rbac-and-error-handling.md)'s
      captured data) to lack a specific permission — e.g. `doc-testuser`
      attempting to create a billing invoice.
- [ ] Confirm the *entire* experience of being denied is reasonable: the
      action isn't offered, and if reached anyway (direct URL), the user
      gets a clear message, not a broken page or a silent no-op.

## Notes

These journeys are intentionally the last phase — they're the most
expensive to write and the most brittle to maintain (longest tests, most
steps that can drift when the app changes), so they should be built once
the individual module tests they lean on already exist and are stable.
