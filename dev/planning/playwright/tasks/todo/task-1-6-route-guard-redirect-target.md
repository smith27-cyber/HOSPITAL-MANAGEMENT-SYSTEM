# Task: Test: route guard post-login redirect target — done

**Phase:** [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md)
**Depends on:** [task-1-5-route-guard-unauthenticated](./task-1-5-route-guard-unauthenticated.md)
**Status:** Done — `dev/testing/playwright/tests/auth/login.spec.ts`

Confirmed from source (`auth.guard.ts`): the guard does **not** support
"redirect back to where you were going" — it always returns
`router.createUrlTree(['/login'])` with no query params. Test pins
this actual behavior (`http://localhost:4200/login` exactly), so a
future change to add return-url support is a deliberate, visible
change to this test, not a silent regression.
