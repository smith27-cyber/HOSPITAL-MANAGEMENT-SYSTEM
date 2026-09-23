# Task: Test: logout — done

**Phase:** [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md)
**Depends on:** [task-1-3-login-input-validation](./task-1-3-login-input-validation.md)
**Status:** Done — `dev/testing/playwright/tests/auth/login.spec.ts`

Confirmed: logout clears `sessionStorage` and redirects to `/login`
using `router.navigate(['/login'], { replaceUrl: true })`, so the
dashboard's history entry is replaced, not just covered — confirmed
back-navigation after logout does not show stale authenticated
content.
