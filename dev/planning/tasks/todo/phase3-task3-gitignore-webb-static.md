# Task: Gitignore `hms-webb`'s generated static output

**Phase:** [Phase 3 — Retire the stale manual copy in `hms-jar`](../../phases/phase-3-retire-stale-copy.md)
**Depends on:** [phase2-task2-verify-build-output](./phase2-task2-verify-build-output.md)
**Status:** Not started

Add `hms-webb/src/main/resources/static/` to `.gitignore` — it's generated
by `ng build`, same treatment `hms-webb/angular/dist/` already gets, and
shouldn't be committed (that's exactly the mistake being undone in
[phase3-task2](./phase3-task2-remove-stale-static.md)).

Decide whether the empty directory needs a `.gitkeep` placeholder so it
exists before the first build, or whether that's unnecessary since `ng
build` creates it on demand.
