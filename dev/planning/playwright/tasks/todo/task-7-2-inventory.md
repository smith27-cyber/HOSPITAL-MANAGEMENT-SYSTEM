# Task: Test: inventory — list, register, stock adjust, reorder alerts

**Phase:** [Phase 7 — Billing & Inventory](../../phases/phase-7-billing-inventory.md)
**Depends on:** [task-7-1-billing](./task-7-1-billing.md)
**Status:** Not started

- List, register a new item, edit it.
- Stock management view — adjust stock up/down and confirm the current
  stock number updates correctly (`API_DESIGN.md` documents a
  `PATCH .../stock` with an `operation: "add"|"reduce"` — confirm the UI
  exposes both directions, not just adding).
- Reorder alerts — an item at/below reorder level is flagged visibly in
  the list or a dedicated view.
- "Last Updated" reflects the most recent stock change, not a stale
  creation timestamp.
