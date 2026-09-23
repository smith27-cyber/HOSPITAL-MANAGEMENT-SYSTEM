# Task: Test: login with invalid credentials — done

**Phase:** [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md)
**Depends on:** [task-1-1-login-valid](./task-1-1-login-valid.md)
**Status:** Done — `dev/testing/playwright/tests/auth/login.spec.ts`

Found and fixed a **real app bug**: the error message never appeared
at all. `login()`'s HTTP error callback set `errorMessage` but never
triggered change detection (same root cause as the dev-login-buttons
bug from [task-0-7](./task-0-7-scaffold-suite-layout.md) — fetch-based
`HttpClient` isn't reliably zone-patched here). Fixed with
`ChangeDetectorRef.detectChanges()` in `login.ts`.

Also confirmed a second, **not fixed here**, issue: the backend
returns `403`, not `401`, for a wrong password (`AuthService.login()`'s
generic exception, no global exception handler —
`KNOWN_ISSUES.md` P1 / [task-9-5](./task-9-5-global-exception-handler-gap.md)).
The frontend's 403 branch shows "Access denied. Please contact the
administrator." — technically an error is shown (this task's literal
requirement), but the message is misleading for a simple typo'd
password. The test asserts the current, real message; fixing the
message properly means fixing the backend's status code first, which
is task-9-5's job, not this one's.
