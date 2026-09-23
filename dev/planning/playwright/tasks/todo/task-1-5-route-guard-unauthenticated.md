# Task: Test: route guard blocks unauthenticated access — done

**Phase:** [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md)
**Depends on:** [task-1-4-logout](./task-1-4-logout.md)
**Status:** Done — `dev/testing/playwright/tests/auth/login.spec.ts`

Confirmed: navigating directly to `/patients` with no session redirects
to `/login` (`authGuard`), not a blank page.
