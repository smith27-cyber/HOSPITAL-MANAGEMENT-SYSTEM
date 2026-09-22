# Phase 7 — Billing & Inventory

**Plan:** [plan.md](../plan.md)
**Depends on:** [Phase 0](./phase-0-foundation.md), [Phase 1](./phase-1-auth-and-shell.md), [Phase 4](./phase-4-appointments-consultations.md) (invoices originate from consultations)
**Status:** Not started

## Scope

**Billing:** `BillingListComponent`, `BillingRegisterComponent`,
`BillingEditComponent`, `BillingDetailsComponent`. Routes: `/billing`,
`/billing/register`, `/billing/:id`, `/billing/:id/edit`. Fields:
Patient, Consultation, Invoice Date, Total, Payment Status, Items,
Payments Made.

**Inventory:** `InventoryListComponent`, `InventoryRegisterComponent`,
`InventoryStockComponent`, `InventoryEditComponent`,
`InventoryDetailsComponent`. Routes: `/inventory`, `/inventory/register`,
`/inventory/stock`, `/inventory/:id`, `/inventory/:id/edit`. Fields: Item
Name, Category, Current Stock, Reorder Level, Unit Cost, Supplier, Last
Updated.

## Test Scenarios

### Billing
- [ ] Create an invoice from a completed consultation with multiple
      billing items — confirm the **subtotal/discount/tax/total
      calculation is correct** (`DATA_FLOW.md` documents the exact
      formula: `(subtotal - discount) + tax` — assert the displayed total
      actually matches that arithmetic, not just that a number appears).
- [ ] Invoice number generation — confirm one is assigned and looks
      well-formed (`API_DESIGN.md`'s example: `INV-2026-0200`).
- [ ] Record a payment against an invoice — confirm the invoice's status
      transitions (e.g. `pending` → `paid` once fully paid), and a
      **partial payment** leaves it in an intermediate state rather than
      incorrectly marking it fully paid.
- [ ] Billing details view shows all items, all payments made, and the
      running total correctly.
- [ ] Edit an invoice (if editing after creation is allowed) — confirm
      what's actually editable (line items? Only before payment?) rather
      than assuming full editability.
- [ ] List/search invoices by patient, by status.

### Inventory
- [ ] List, register a new item, edit it.
- [ ] Stock management view — adjust stock up/down and confirm the
      current stock number updates correctly (`API_DESIGN.md` documents a
      `PATCH .../stock` with an `operation: "add"|"reduce"` — confirm the
      UI exposes both directions, not just adding).
- [ ] Reorder alerts — an item at/below reorder level is flagged visibly
      in the list or a dedicated view.
- [ ] "Last Updated" reflects the most recent stock change, not a stale
      creation timestamp.
