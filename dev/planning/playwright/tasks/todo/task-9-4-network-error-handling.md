# Task: Test: network/API error handling

**Phase:** [Phase 9 — RBAC & Error/Validation UX (Cross-Cutting)](../../phases/phase-9-rbac-and-error-handling.md)
**Depends on:** [task-9-3-form-validation-ux](./task-9-3-form-validation-ux.md)
**Status:** Not started

- Simulate a backend error (e.g. via Playwright's route interception,
  returning a 500 for one request) and confirm the UI shows a
  reasonable error state rather than an infinite spinner or a blank
  screen.
- Simulate a 401 (expired/invalid token) mid-session and confirm the
  user is redirected to login rather than stuck on a broken page.
