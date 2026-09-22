# Task: Test: billing — create, totals, payments, edit, list

**Phase:** [Phase 7 — Billing & Inventory](../../phases/phase-7-billing-inventory.md)
**Depends on:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md), [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md), [Phase 4 — Appointments & Consultations](../../phases/phase-4-appointments-consultations.md) (invoices originate from consultations)
**Status:** Not started

- Create an invoice from a completed consultation with multiple billing
  items — confirm the **subtotal/discount/tax/total calculation is
  correct** (`DATA_FLOW.md` documents the exact formula:
  `(subtotal - discount) + tax` — assert the displayed total actually
  matches that arithmetic, not just that a number appears).
- Invoice number generation — confirm one is assigned and looks
  well-formed (`API_DESIGN.md`'s example: `INV-2026-0200`).
- Record a payment against an invoice — confirm the invoice's status
  transitions (e.g. `pending` → `paid` once fully paid), and a
  **partial payment** leaves it in an intermediate state rather than
  incorrectly marking it fully paid.
- Billing details view shows all items, all payments made, and the
  running total correctly.
- Edit an invoice (if editing after creation is allowed) — confirm
  what's actually editable (line items? Only before payment?) rather
  than assuming full editability.
- List/search invoices by patient, by status.
