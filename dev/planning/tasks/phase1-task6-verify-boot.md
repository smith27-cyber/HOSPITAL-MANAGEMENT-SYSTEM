# Task: Verify `hms-webb` boots cleanly

**Phase:** [Phase 1 — Scaffold the Spring Boot module](../phases/phase-1-scaffold-module.md)
**Depends on:** [phase1-task2-add-dependencies](./phase1-task2-add-dependencies.md), [phase1-task3-add-maven-plugin](./phase1-task3-add-maven-plugin.md), [phase1-task4-add-main-class](./phase1-task4-add-main-class.md), [phase1-task5-add-application-properties](./phase1-task5-add-application-properties.md)
**Status:** Not started

Run `mvn -pl hms-webb spring-boot:run` (from `hms-pom/`) and confirm it
boots without errors. At this point there's no static content yet, so
hitting the root URL should show Spring Boot's default Whitelabel error
page — that's the expected, correct result before
[Phase 2](../phases/phase-2-angular-output-wiring.md) adds real content.

This is the checkpoint that proves the module itself is wired correctly,
independent of whether Angular's output is hooked up yet.
