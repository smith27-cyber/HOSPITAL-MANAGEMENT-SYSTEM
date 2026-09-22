# Phase 3 — Retire the stale manual copy in `hms-jar`

**Plan:** [hms-webb-morph-plan.md](../hms-webb-morph-plan.md)
**Depends on:** [Phase 2](./phase-2-angular-output-wiring.md)
**Status:** Not started

## Tasks

1. [Confirm nothing depends on `hms-jar`'s stale static content](../tasks/phase3-task1-confirm-dependency.md) — ask before deleting
2. [Remove the stale static copy from `hms-jar`](../tasks/phase3-task2-remove-stale-static.md) — blocked on task 1
3. [Gitignore `hms-webb`'s generated static output](../tasks/phase3-task3-gitignore-webb-static.md)
