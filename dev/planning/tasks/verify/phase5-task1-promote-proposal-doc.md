# Task: Promote POM_STRUCTURE.md from proposal to current state

**Phase:** [Phase 5 — Documentation catch-up](../../phases/phase-5-documentation-catchup.md)
**Depends on:** all of Phase 1–4's tasks being actually done and verified
**Status:** Done, proceeding despite one open item (see below)

Note on the dependency: `phase2-task6` (a full end-to-end API call
through `hms-webb` against a live `hms-jar` + Postgres) is still blocked
on Docker/Postgres access, not on any remaining doubt about the
mechanism — the forwarding is verified correct, just not exercised
against a live backend. Proceeded with promotion on that basis rather
than waiting indefinitely on infrastructure this environment doesn't
have; the gap is tracked in `KNOWN_ISSUES.md` (P2), not hidden.

`dev/architecture/future/POM_STRUCTURE.md` no longer exists as a single
file — its content was distributed across the concern-based `old/` docs
rather than dropped in as one large file, matching how the rest of `old/`
is organized:
- [WEBB_MODULE.md](../../../architecture/old/WEBB_MODULE.md) (new) —
  `hms-webb`'s structure, `SpaWebConfig`, `WebApiForwardController`, the
  `ng build` → `static/` mechanism
- [SECURITY.md](../../../architecture/old/SECURITY.md) — CORS, now resolved
  (blocked entirely)
- [SYSTEM_DESIGN.md](../../../architecture/old/SYSTEM_DESIGN.md) — the
  two-Spring-Boot-process reality
- [OPERATIONS.md](../../../architecture/old/OPERATIONS.md) — updated
  deployment diagram
- [KNOWN_ISSUES.md](../../../architecture/old/KNOWN_ISSUES.md) — CORS issue
  resolved; the still-open end-to-end verification tracked as P2
- [STATUS_OVERVIEW.md](../../../architecture/old/STATUS_OVERVIEW.md) and
  [README.md](../../../architecture/old/README.md) — counts and navigation
  updated
