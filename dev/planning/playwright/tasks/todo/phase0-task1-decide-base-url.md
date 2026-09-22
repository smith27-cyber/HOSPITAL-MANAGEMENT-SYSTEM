# Task: Decide the base URL strategy (ng serve vs hms-webb)

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** nothing — this blocks everything else
**Status:** Not started

Decide whether the suite runs against `ng serve` (port 4200, faster local
iteration) or `hms-webb` (port 8080, the real packaged deployment shape —
see `dev/architecture/20260922/WEBB_MODULE.md`), or both.

Recommendation from the plan: parametrize via an env var (e.g.
`PLAYWRIGHT_BASE_URL`) so the same suite runs against either target, and
make sure CI runs it against `hms-webb` at least once, since that's what
a real user actually gets.
