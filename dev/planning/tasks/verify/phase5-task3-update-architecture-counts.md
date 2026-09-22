# Task: Update architecture doc counts for the new module

**Phase:** [Phase 5 — Documentation catch-up](../../phases/phase-5-documentation-catchup.md)
**Depends on:** [phase5-task1-promote-proposal-doc](../verify/phase5-task1-promote-proposal-doc.md)
**Status:** Done — largely covered as part of `phase5-task1`'s promotion,
not a separate pass:

- `SYSTEM_DESIGN.md` now states the two-Spring-Boot-process reality and
  cross-references `WEBB_MODULE.md`.
- `WEBB_MODULE.md` (new) documents `hms-webb`'s 2 classes
  (`SpaWebConfig`, `WebApiForwardController`) — it has no
  entities/repositories/services, so it doesn't add rows to
  `BACKEND_COMPONENTS.md`'s entity/repository/service tables, only its own
  dedicated file.
- `hms-jar`'s controller count corrected 18 → 17 in `old/README.md`'s Key
  Statistics (the 18th was `AngularForwardController`, removed in Phase 3
  — not a `hms-webb`-introduced change, but the same pass caught it).
- `FRONTEND_COMPONENTS.md` (Angular's 13 modules, 15 services) is
  unaffected — `hms-webb` didn't change anything on the Angular side.
