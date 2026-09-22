# Task: Test: per-role nav/UI visibility vs. captured permissions

**Phase:** [Phase 9 — RBAC & Error/Validation UX (Cross-Cutting)](../../phases/phase-9-rbac-and-error-handling.md)
**Depends on:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md); benefits from Phases 1-8 existing first, since it reuses their page interactions rather than inventing new ones
**Status:** Not started

For each of the 8 seeded roles, log in and record which nav items are
visible/hidden, and which action buttons (create/edit/delete) are
present/absent on each module's list page. Compare against that role's
actual captured permission set (see the phase doc's real captured
`test_doctor` permission list, and capture the other 7 roles' actual
permission lists the same way — a real login call, not inference from
the role name) — a visible "Create Invoice" button for a role without
any `BILLING_*` permission is a bug, not a variant.
