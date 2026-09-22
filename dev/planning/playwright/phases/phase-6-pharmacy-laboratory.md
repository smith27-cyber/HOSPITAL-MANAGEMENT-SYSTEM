# Phase 6 — Pharmacy & Laboratory

**Plan:** [playwright-plan.md](../playwright-plan.md)
**Depends on:** [Phase 0](./phase-0-foundation.md), [Phase 1](./phase-1-auth-and-shell.md), [Phase 4](./phase-4-appointments-consultations.md) (prescriptions/lab requests originate from consultations)
**Status:** Not started

Both modules are queue-driven order-fulfillment workflows (a prescription
or lab request is created elsewhere, then processed here) — grouped
together for that shared shape.

## Scope

**Pharmacy:** `PharmacyDashboardComponent`, `PharmacyQueueComponent`,
`PharmacyStockComponent`, `PharmacyPrescriptionComponent`. Routes:
`/pharmacy`, `/pharmacy/queue`, `/pharmacy/stock`,
`/pharmacy/prescriptions/:id`.

**Laboratory:** `LaboratoryListComponent`, `LaboratoryRegisterComponent`,
`LaboratoryRequestListComponent`, `LaboratoryRequestFormComponent`,
`LaboratoryRequestDetailsComponent`. Routes: `/laboratory`,
`/laboratory/register`, `/laboratory/:id`, `/laboratory/requests`,
`/laboratory/requests/register`, `/laboratory/requests/:id`.

## Test Scenarios

### Pharmacy
- [ ] A prescription created via a consultation ([Phase 4](./phase-4-appointments-consultations.md))
      appears in the pharmacy queue — this is the real cross-module
      check, not just "does `/pharmacy/queue` render."
- [ ] Prescription details view shows the correct medications/dosages
      entered during the consultation.
- [ ] Fulfillment flow — whatever action marks a prescription as
      filled/dispensed, confirm it moves out of the queue and the
      patient/consultation can see it's been fulfilled.
- [ ] Stock management — view current stock, and confirm stock
      **decrements when a prescription is fulfilled** (a real
      cross-cutting behavior worth specifically checking, not assuming).
- [ ] Low-stock / reorder-alert indicators (if present) show correctly
      when stock is near/below reorder level.
- [ ] Dashboard summary numbers match the queue/stock reality.

### Laboratory
- [ ] Test catalog — list existing tests, register a new test (name,
      type, cost), confirm it's selectable when submitting a request
      afterward.
- [ ] Submit a lab request for a patient (optionally linked to a
      consultation, per `API_DESIGN.md`'s documented
      `consultationId` field) with one or more tests selected.
- [ ] Request list — filter by status; a submitted request should show as
      pending/submitted.
- [ ] Enter/view results on a request — confirm the UI for entering
      results exists and works (this is the actual clinical value of the
      module — don't skip it for being harder to script than a simple
      form).
- [ ] Completed request shows results correctly formatted, with reference
      ranges if the UI displays them (per `API_DESIGN.md`'s example
      payload).
- [ ] From a patient's profile or a consultation, confirm a link to
      related lab requests exists and works, if the app provides one.
