# Task: Test: login with valid credentials — done

**Phase:** [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md)
**Depends on:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md) (auth fixtures)
**Status:** Done — `dev/testing/playwright/tests/auth/login.spec.ts`

Confirmed: redirects to `/dashboard`; nav renders. Confirmed a **doc
bug** while checking where the JWT is stored: `SECURITY.md` said
`localStorage`, but `AuthService` actually uses `sessionStorage` — this
was the exact mismatch that made
[task-0-4](./task-0-4-decide-auth-reuse.md)'s original `storageState()`
design silently fail. Fixed `SECURITY.md` to say `sessionStorage`.
