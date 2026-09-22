# hms-jar / hms-webb Migration — Status on This Branch

**Last Updated:** 2026-09-23

## Summary: not applied here

`dev/planning/hms-webb-morph-plan.md` and `dev/planning/phases/phase-1..5-*.md` (added to `paul` in the
same commit as this doc set, `ff68a3d`) describe a plan to restructure the project from
`hms-backend`/`hms-frontend` into an `hms-pom/hms-jar` + `hms-pom/hms-webb/angular` Maven multi-module
layout, with the frontend renamed to `hms-webb` and CORS removed entirely in favor of same-origin
serving. Commit messages referencing "Phase 3/4/5 complete" for this migration exist in this repository's
reflog, but **they belong to a different branch**
(`architecture/gsn-creating-a-new-pom-structure`), not to `paul`.

**Verified directly**: `paul`'s actual working tree, right now, still uses the original
`hms-backend`/`hms-frontend` layout described throughout the rest of this doc set. There is no
`hms-pom/`, `hms-jar/`, or `hms-webb/` directory anywhere in `paul`. `dev/architecture/20260922/` (the
sibling directory, copied into `paul` in the same commit as this file) documents the *target* state of
that migration as it existed on the other branch — it is aspirational/proposed relative to `paul`, not a
description of `paul`'s current code. See [README.md](./README.md) for the full provenance explanation.

## What this means practically

- Every path, package name, and endpoint documented elsewhere in this `old/` doc set
  (`hms-backend/src/main/java/com/hms/backend/...`, `hms-frontend/src/app/...`) is what actually exists
  and runs on `paul` today.
- Anything in `dev/architecture/20260922/` that references `hms-jar`, `hms-webb`, or "CORS blocked
  entirely" describes the other branch's design, not this one. `paul` still has CORS configured via
  `SecurityConfig` + per-controller `@CrossOrigin` (see [SECURITY.md](./SECURITY.md)), because it still
  serves the frontend as a separate build artifact copied into `static/`, not as a same-origin Maven
  submodule.
- If `paul` is later merged with the `architecture/gsn-creating-a-new-pom-structure` branch (or with
  `dev`, which itself has an unmerged, unresolved attempt at bringing in a `hms-pom/hms-jar`/`hms-webb`
  restructuring — see that branch's own history), this entire doc set will need re-verification, since
  package paths, module boundaries, and possibly the CORS/security model would all change at once.

## Recommendation

Treat `dev/architecture/20260922/` as a design proposal / migration target, not as current-state
documentation, until `paul` (or whichever branch is authoritative going forward) actually contains an
`hms-jar`/`hms-webb` directory structure. Until then, this `old/` directory is the accurate one for
`paul`.
