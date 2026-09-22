# Phase 2 — Wire Angular's build output directly into `static/`

**Plan:** [hms-webb-morph-plan.md](../hms-webb-morph-plan.md)
**Depends on:** [Phase 1](./phase-1-scaffold-module.md)
**Status:** Done — all 6 tasks, including full end-to-end live
verification

## Tasks

1. [Set Angular's `outputPath` to write into `static/`](../tasks/verify/phase2-task1-set-output-path.md) — Done
2. [Verify `ng build` output lands at the static root](../tasks/verify/phase2-task2-verify-build-output.md) — Done
3. [Verify `hms-webb` serves the built app](../tasks/verify/phase2-task3-verify-serving.md) — Done
4. [Verify client-side routing survives a hard refresh](../tasks/verify/phase2-task4-verify-routing.md) — Done, `SpaWebConfig` added and verified
5. [Add a Web API layer in `hms-webb` that forwards to the Backend API](../tasks/verify/phase2-task5-add-reverse-proxy.md) — Done, `WebApiForwardController` added and verified end-to-end
6. [Verify a real API call succeeds through `hms-webb`](../tasks/verify/phase2-task6-verify-api-call.md) — Done, full end-to-end with real login/JWT/data
