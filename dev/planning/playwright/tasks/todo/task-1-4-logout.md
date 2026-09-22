# Task: Test: logout

**Phase:** [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md)
**Depends on:** [task-1-3-login-input-validation](./task-1-3-login-input-validation.md)
**Status:** Not started

Logout clears the stored token and redirects to `/login`; a subsequent
back-navigation to a protected route doesn't show stale authenticated
content.
