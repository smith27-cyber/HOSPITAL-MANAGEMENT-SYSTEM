# Phase 1 — Scaffold the Spring Boot module

**Plan:** [hms-webb-morph-plan.md](../hms-webb-morph-plan.md)
**Status:** Done, except task 7's end-to-end verification (blocked on
Docker/Postgres access not available in this environment)

## Tasks

1. [Convert `hms-webb` packaging to jar](../tasks/verify/phase1-task1-convert-packaging.md) — Done
2. [Add Spring Boot dependencies](../tasks/verify/phase1-task2-add-dependencies.md) — Done
3. [Add spring-boot-maven-plugin](../tasks/verify/phase1-task3-add-maven-plugin.md) — Done
4. [Add `HmsWebbApplication` main class](../tasks/verify/phase1-task4-add-main-class.md) — Done
5. [Add `application.properties`](../tasks/verify/phase1-task5-add-application-properties.md) — Done, port `8080`
6. [Verify `hms-webb` boots cleanly](../tasks/verify/phase1-task6-verify-boot.md) — Done, verified with a real `mvn spring-boot:run` + `curl`
7. [Add a dev-server proxy for `ng serve`](../tasks/verify/phase1-task7-add-ng-serve-proxy.md) — config written and JSON-validated; **real-request verification still pending** (needs `hms-jar` + Postgres running, not available here)
