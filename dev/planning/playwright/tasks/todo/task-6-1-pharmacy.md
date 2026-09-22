# Task: Test: pharmacy — queue, fulfillment, stock, dashboard

**Phase:** [Phase 6 — Pharmacy & Laboratory](../../phases/phase-6-pharmacy-laboratory.md)
**Depends on:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md), [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md), [Phase 4 — Appointments & Consultations](../../phases/phase-4-appointments-consultations.md) (prescriptions/lab requests originate from consultations)
**Status:** Not started

- A prescription created via a consultation
  ([Phase 4](../../phases/phase-4-appointments-consultations.md))
  appears in the pharmacy queue — this is the real cross-module check,
  not just "does `/pharmacy/queue` render."
- Prescription details view shows the correct medications/dosages
  entered during the consultation.
- Fulfillment flow — whatever action marks a prescription as
  filled/dispensed, confirm it moves out of the queue and the
  patient/consultation can see it's been fulfilled.
- Stock management — view current stock, and confirm stock
  **decrements when a prescription is fulfilled** (a real cross-cutting
  behavior worth specifically checking, not assuming).
- Low-stock / reorder-alert indicators (if present) show correctly when
  stock is near/below reorder level.
- Dashboard summary numbers match the queue/stock reality.
