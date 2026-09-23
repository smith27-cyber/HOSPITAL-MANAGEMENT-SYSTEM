# Task: Test: expired/invalid JWT handling — confirmed real gap, deferred

**Phase:** [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md)
**Depends on:** [task-1-7-nav-role-visibility-smoke](./task-1-7-nav-role-visibility-smoke.md)
**Status:** Confirmed real gap — not silently skipped, but the fix is
deferred to [task-9-5](./task-9-5-global-exception-handler-gap.md)'s
scope, not implemented here

Not hard to test at all — forcing an invalid token was trivial (write
a garbage string to `sessionStorage.hms_token` via `addInitScript`,
same mechanism as `restoreSession`). The result, confirmed live: **the
app does not redirect to login.** It renders the full authenticated
shell (nav, header, "Welcome back, Dev Login Doctor") on an essentially
empty `/dashboard`, while every API call fails with `403` visible only
in the browser console — exactly the "silent failure" this task warned
about, not a hypothetical.

**No fix implemented here, deliberately.** The real fix is a global
HTTP error interceptor that catches an auth-failure response and
redirects to `/login`, clearing the stale session — but there's
currently no way for the frontend to distinguish "your token is
invalid, please re-login" from "you lack permission for this resource"
apart from status code, and both currently come back as an
indistinguishable bare `403` (no global backend exception handler —
`KNOWN_ISSUES.md` P1, same root cause as
[task-1-2](./task-1-2-login-invalid.md)'s finding). Fixing this
properly means fixing the backend's error shape first
([task-9-5](./task-9-5-global-exception-handler-gap.md)) so a 401
(auth failure) can be told apart from a 403 (permission failure) —
that's a cross-cutting security change affecting every HTTP call in
the app, not a Phase 1 test-writing task.
