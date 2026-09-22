# Task: Test: form validation UX (cross-module patterns)

**Phase:** [Phase 9 — RBAC & Error/Validation UX (Cross-Cutting)](../../phases/phase-9-rbac-and-error-handling.md)
**Depends on:** [task-9-2-backend-enforcement](./task-9-2-backend-enforcement.md)
**Status:** Not started

- Required-field indicators are visually consistent across modules
  (spot-check 3-4 modules, don't repeat this in every phase).
- Server-side validation errors surfaced by the API (e.g. the
  documented 400 "Email already exists," 409 "Doctor is not available
  at this time") are displayed to the user somewhere sensible, not
  swallowed or shown as a generic error.
