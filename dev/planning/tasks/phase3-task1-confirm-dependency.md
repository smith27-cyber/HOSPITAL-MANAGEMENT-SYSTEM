# Task: Confirm nothing depends on `hms-jar`'s stale static content

**Phase:** [Phase 3 — Retire the stale manual copy in `hms-jar`](../phases/phase-3-retire-stale-copy.md)
**Depends on:** [phase2-task3-verify-serving](../tasks/phase2-task3-verify-serving.md)
**Status:** Not started — this is a question to ask, not a code change

`hms-jar/src/main/resources/static/*` currently holds a manually-copied
Angular build, and it's **git-tracked**, not gitignored — meaning someone
committed it on purpose at some point. Before removing it:

- Check whether any deployed/running environment currently relies on
  `hms-jar` serving the frontend (e.g. a prod deploy that only runs the
  backend jar and expects it to also serve the UI).
- Ask the person who added it, or check commit history / deploy scripts,
  rather than assuming it's dead weight.

Do not delete anything in this task — it's purely the confirmation step
that unblocks [phase3-task2](./phase3-task2-remove-stale-static.md).
