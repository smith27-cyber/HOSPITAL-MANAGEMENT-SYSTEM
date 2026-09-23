# Task: Test: login with empty/malformed input — done

**Phase:** [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md)
**Depends on:** [task-1-2-login-invalid](./task-1-2-login-invalid.md)
**Status:** Done — `dev/testing/playwright/tests/auth/login.spec.ts`

Confirmed: client-side `required` + template-driven `loginForm.invalid`
keeps the submit button disabled until both fields are filled — no
network call happens on an empty/partial submit.
