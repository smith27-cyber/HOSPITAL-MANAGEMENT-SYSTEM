# Phase 3 — Retire all frontend-serving code from `hms-jar`

**Plan:** [hms-webb-morph-plan.md](../hms-webb-morph-plan.md)
**Depends on:** [Phase 2](./phase-2-angular-output-wiring.md)
**Status:** Done

Covers both pieces found to violate the hard constraint that `hms-jar`
must carry zero Angular-awareness: the manually-copied static build *and*
`AngularForwardController.java` (SPA-routing forward logic that belongs in
`hms-webb` instead). Both removed; `hms-jar` compiles cleanly without
them (105 source files, `BUILD SUCCESS`).

## Tasks

1. [`hms-jar` never serves static files — policy confirmed](../tasks/verify/phase3-task1-confirm-dependency.md) — Done
2. [Remove all frontend-serving code from `hms-jar`](../tasks/verify/phase3-task2-remove-stale-static.md) — Done
3. [Gitignore `hms-webb`'s generated static output](../tasks/verify/phase3-task3-gitignore-webb-static.md) — Done
