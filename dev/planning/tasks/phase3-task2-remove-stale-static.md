# Task: Remove the stale static copy from `hms-jar`

**Phase:** [Phase 3 — Retire the stale manual copy in `hms-jar`](../phases/phase-3-retire-stale-copy.md)
**Depends on:** [phase3-task1-confirm-dependency](./phase3-task1-confirm-dependency.md) — do not do this until that's answered
**Status:** Not started, blocked

Once confirmed safe, remove `hms-jar/src/main/resources/static/*` (the
manually-copied Angular build and its committed files) via `git rm`, since
`hms-webb` now serves the built app on its own.
