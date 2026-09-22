# Phase 4 — Cross-cutting config decisions (need answers, not just code)

**Plan:** [hms-webb-morph-plan.md](../hms-webb-morph-plan.md)
**Depends on:** [Phase 1](./phase-1-scaffold-module.md)
**Status:** Not started — these are decisions, not implementation tasks

## Tasks

1. [Decide `hms-webb`'s port](../tasks/verify/phase4-task1-choose-port.md)
2. [Block CORS on `hms-jar` entirely](../tasks/todo/phase4-task2-resolve-cors.md) — decision made: both dev (`ng serve` proxy) and packaged (`hms-webb`'s Web API layer) keep the browser same-origin, so `hms-jar`'s Backend API never needs to allow any cross-origin caller
3. [Document the dev-vs-packaged frontend workflow](../tasks/todo/phase4-task3-document-dev-workflow.md)
