# Phase 2 — Wire Angular's build output directly into `static/`

**Plan:** [hms-webb-morph-plan.md](../hms-webb-morph-plan.md)
**Depends on:** [Phase 1](./phase-1-scaffold-module.md)
**Status:** Done, except task 6's end-to-end verification (same
Docker/Postgres limitation as Phase 1's task 7)

## Tasks

1. [Set Angular's `outputPath` to write into `static/`](../tasks/verify/phase2-task1-set-output-path.md) — Done
2. [Verify `ng build` output lands at the static root](../tasks/verify/phase2-task2-verify-build-output.md) — Done
3. [Verify `hms-webb` serves the built app](../tasks/verify/phase2-task3-verify-serving.md) — Done
4. [Verify client-side routing survives a hard refresh](../tasks/verify/phase2-task4-verify-routing.md) — Done, `SpaWebConfig` added and verified
5. [Add a Web API layer in `hms-webb` that forwards to the Backend API](../tasks/verify/phase2-task5-add-reverse-proxy.md) — Done, `WebApiForwardController` added and verified (mechanism proven, real backend response still pending)
6. [Verify a real API call succeeds through `hms-webb`](../tasks/todo/phase2-task6-verify-api-call.md) — Blocked, needs `hms-jar` + Postgres running
