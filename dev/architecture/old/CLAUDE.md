# Provenance

This doc set was originally generated on 2026-09-23 by reading `hms-backend/` and `hms-frontend/`
directly on branch `paul` (code at `9f5abdb`, docs added at `ff68a3d`). It does not cover
`dev/planning/` or `dev/testing/` — see [README.md](./README.md) for why this directory exists
alongside `dev/architecture/20260922/`.

**Refreshed the same day** after `dev/planning/hms-pom-migration-plan.md` was executed and
live-verified against `paul`: `hms-backend`/`hms-frontend` moved to `hms-pom/hms-jar`/
`hms-pom/hms-webb/angular`, CORS removed entirely, `AngularForwardController` retired in favor of
`hms-webb`'s `SpaWebConfig`/`WebApiForwardController`. Every file in this directory was checked for
stale path/CORS references as part of that refresh (Phase 7 of the pom migration plan) rather than left
to drift — see `dev/planning/pom/phases/phase-7-refresh-architecture-docs.md`.

The project-root `CLAUDE.md` describes a documentation-drift history for the `dev` branch and is not
applicable to `paul`: `paul`'s own root `CLAUDE.md` was still the original, unresolved 2026-09-03 audit
as of this doc set's original writing. Do not treat the root `CLAUDE.md` as authoritative for this branch
without checking which branch is actually checked out.

Keeping multiple copies of a "this log is authoritative" pointer file across branches is itself a source
of drift (see `dev/architecture/20260922/CLAUDE.md` for a prior instance of exactly this problem). If
`paul` merges with `dev` or with the `architecture/gsn-creating-a-new-pom-structure` branch, this whole
directory should be re-verified against the merged code, not assumed to still be accurate.
