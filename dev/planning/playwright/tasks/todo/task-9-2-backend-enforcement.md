# Task: Test: backend enforcement, not just UI hiding

**Phase:** [Phase 9 — RBAC & Error/Validation UX (Cross-Cutting)](../../phases/phase-9-rbac-and-error-handling.md)
**Depends on:** [task-9-1-nav-ui-visibility](./task-9-1-nav-ui-visibility.md)
**Status:** Not started

For at least one case per role, confirm the restriction is enforced
**server-side**, not just hidden in the UI — e.g. as `test_doctor`,
attempt the billing-create action directly (bypassing the hidden
button, e.g. via direct navigation to `/billing/register` or a crafted
request) and confirm it's actually rejected (403), not just invisible.
A hidden button with an unprotected endpoint behind it is a real
security gap this suite should be able to catch.
