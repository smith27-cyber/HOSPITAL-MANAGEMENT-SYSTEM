# Task: Update remaining path references

**Phase:** [Phase 7 — Refresh dev/architecture/old for the new module layout](../../phases/phase-7-refresh-architecture-docs.md)
**Status:** Done

Sweep the remaining flagged files for leftover `hms-backend`/`hms-frontend` mentions and fix:

- `README.md` (the one inside `dev/architecture/old/`, not the project root) — Quick Start / structure
  references.
- `STATUS_OVERVIEW.md` — any path mentions in the summary tables.
- `TESTING_STATUS.md` — path mentions; note `testing/playwright/playwright.config.ts` needed **no**
  change (it already targets `http://localhost:4200`, i.e. `ng serve`, which is unaffected by the pom
  move).
- `FEATURE_COMPLETENESS.md` — path mentions, if any.
- `CLAUDE.md` (the one inside `dev/architecture/old/`) — its provenance note should mention this doc set
  was refreshed again post-pom-migration, with the date and branch/commit.
