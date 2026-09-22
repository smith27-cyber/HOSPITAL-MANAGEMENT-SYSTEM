# Task: Test: expired/invalid JWT handling (if feasible)

**Phase:** [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md)
**Depends on:** [task-1-7-nav-role-visibility-smoke](./task-1-7-nav-role-visibility-smoke.md)
**Status:** Not started

An expired/invalid JWT on a protected request should result in a
redirect to login, not a silent failure or an infinite spinner. May
need a way to force an expired token (e.g. a fixture with a pre-expired
one). Flag as possibly-hard-to-test rather than skip silently if it
turns out to be impractical.
