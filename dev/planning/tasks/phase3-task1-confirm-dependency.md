# Task: `hms-jar` never serves static files — policy confirmed

**Phase:** [Phase 3 — Retire all frontend-serving code from `hms-jar`](../phases/phase-3-retire-stale-copy.md)
**Depends on:** [phase2-task3-verify-serving](../tasks/phase2-task3-verify-serving.md)
**Status:** Resolved — settled policy, not a case-by-case question

## Decision

"`hms-jar` should NEVER serve static files — that is `hms-webb`'s job."
This is absolute, not conditional on checking whether anything currently
depends on the two violations already found:

- `hms-jar/src/main/resources/static/*` — a manually-copied Angular build,
  **git-tracked**, not gitignored.
- `hms-jar/src/main/java/com/hms/backend/config/AngularForwardController.java`
  — forwards Angular app routes to `/index.html`, the same SPA-routing
  problem [phase2-task4](../tasks/phase2-task4-verify-routing.md) flags
  for `hms-webb` — except solved in the wrong module.

Both get removed in [phase3-task2](./phase3-task2-remove-stale-static.md),
once `hms-webb` is verified serving correctly
([phase2-task3](../tasks/phase2-task3-verify-serving.md)) — sequenced so
the fallback isn't removed before its replacement exists, not because the
removal itself is still in question.
