# Phase 3 — Retire all frontend-serving code from `hms-jar`

**Plan:** [hms-webb-morph-plan.md](../hms-webb-morph-plan.md)
**Depends on:** [Phase 2](./phase-2-angular-output-wiring.md)
**Status:** Not started

Covers both pieces found to violate the hard constraint that `hms-jar`
must carry zero Angular-awareness: the manually-copied static build *and*
`AngularForwardController.java` (SPA-routing forward logic that belongs in
`hms-webb` instead).

## Tasks

1. [`hms-jar` never serves static files — policy confirmed](../tasks/verify/phase3-task1-confirm-dependency.md)
2. [Remove all frontend-serving code from `hms-jar`](../tasks/todo/phase3-task2-remove-stale-static.md) — waits on `hms-webb` working, not on further confirmation
3. [Gitignore `hms-webb`'s generated static output](../tasks/todo/phase3-task3-gitignore-webb-static.md)
