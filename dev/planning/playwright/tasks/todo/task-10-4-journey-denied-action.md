# Task: Test: Journey 4 — a denied action, end to end

**Phase:** [Phase 10 — Full User Journeys (Cross-Module)](../../phases/phase-10-full-user-journeys.md)
**Depends on:** [task-10-3-journey-admin-setup](./task-10-3-journey-admin-setup.md)
**Status:** Not started

- Log in as a role known (from Phase 9's captured data) to lack a
  specific permission — e.g. `doc-testuser` attempting to create a
  billing invoice.
- Confirm the *entire* experience of being denied is reasonable: the
  action isn't offered, and if reached anyway (direct URL), the user
  gets a clear message, not a broken page or a silent no-op.
