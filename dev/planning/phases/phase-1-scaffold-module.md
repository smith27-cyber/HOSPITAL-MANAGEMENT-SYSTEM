# Phase 1 — Scaffold the Spring Boot module

**Plan:** [hms-webb-morph-plan.md](../hms-webb-morph-plan.md)
**Status:** Not started

## Tasks

1. [Convert `hms-webb` packaging to jar](../tasks/phase1-task1-convert-packaging.md)
2. [Add Spring Boot dependencies](../tasks/phase1-task2-add-dependencies.md)
3. [Add spring-boot-maven-plugin](../tasks/phase1-task3-add-maven-plugin.md)
4. [Add `HmsWebbApplication` main class](../tasks/phase1-task4-add-main-class.md)
5. [Add `application.properties`](../tasks/phase1-task5-add-application-properties.md) — port `8080`, resolved
6. [Verify `hms-webb` boots cleanly](../tasks/phase1-task6-verify-boot.md)
7. [Add a dev-server proxy for `ng serve`](../tasks/phase1-task7-add-ng-serve-proxy.md) — independent of `hms-webb`, fixes today's dev workflow, keeps relative API URLs as-is
