# Task: Test: login with valid credentials

**Phase:** [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md)
**Depends on:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md) (auth fixtures)
**Status:** Not started

Submit a seeded test account's credentials, confirm redirect to
`/dashboard` (or wherever the post-login route actually is — confirm,
don't assume), confirm the JWT is stored (check `localStorage`, per
`SECURITY.md`'s documented flow) and the nav menu renders.
