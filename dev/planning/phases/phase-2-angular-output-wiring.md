# Phase 2 — Wire Angular's build output directly into `static/`

**Plan:** [hms-webb-morph-plan.md](../hms-webb-morph-plan.md)
**Depends on:** [Phase 1](./phase-1-scaffold-module.md)
**Status:** Not started

## Tasks

1. [Set Angular's `outputPath` to write into `static/`](../tasks/phase2-task1-set-output-path.md)
2. [Verify `ng build` output lands at the static root](../tasks/phase2-task2-verify-build-output.md)
3. [Verify `hms-webb` serves the built app](../tasks/phase2-task3-verify-serving.md)
4. [Verify client-side routing survives a hard refresh](../tasks/phase2-task4-verify-routing.md) — likely to surface a real decision
5. [Add a Web API layer in `hms-webb` that forwards to the Backend API](../tasks/phase2-task5-add-reverse-proxy.md) — required because Angular's services use relative `/api/...` URLs; no refactoring of `hms-jar`'s controllers or Angular services needed
6. [Verify a real API call succeeds through `hms-webb`](../tasks/phase2-task6-verify-api-call.md)
