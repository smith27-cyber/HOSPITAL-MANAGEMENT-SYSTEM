# Task: Convert `hms-webb` packaging to jar

**Phase:** [Phase 1 — Scaffold the Spring Boot module](../../phases/phase-1-scaffold-module.md)
**Status:** Done

Change `hms-webb/pom.xml`: `<packaging>pom</packaging>` → `<packaging>jar</packaging>`.

This is the switch that turns `hms-webb` from an inert organizational
container into something Maven will actually compile and package.
