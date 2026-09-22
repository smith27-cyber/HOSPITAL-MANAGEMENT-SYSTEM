# Task: Test: route guard blocks unauthenticated access

**Phase:** [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md)
**Depends on:** [task-1-4-logout](./task-1-4-logout.md)
**Status:** Not started

Directly navigating to a protected route (e.g. `/patients`) with no
session redirects to `/login`, not a blank page or a console error.
