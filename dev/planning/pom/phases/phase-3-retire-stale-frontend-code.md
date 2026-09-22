# Phase 3 — Retire frontend-serving code from `hms-jar`

**Plan:** [../../hms-pom-migration-plan.md](../../hms-pom-migration-plan.md)
**Depends on:** Phase 2 (hms-webb must be able to take over static serving first)
**Status:** Done

## Tasks

1. [Remove the stale static build from `hms-jar`](../tasks/verify/task3-1-remove-static-from-hms-jar.md) — Done
2. [Remove `AngularForwardController`](../tasks/verify/task3-2-remove-angular-forward-controller.md) — Done
3. [Confirm nothing else references it](../tasks/verify/task3-3-grep-confirm-no-references.md) — Done
4. [Verify `hms-jar` compiles](../tasks/verify/task3-4-verify-hms-jar-compiles.md) — Done
