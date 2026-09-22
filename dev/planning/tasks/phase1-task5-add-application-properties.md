# Task: Add `application.properties` for `hms-webb`

**Phase:** [Phase 1 — Scaffold the Spring Boot module](../phases/phase-1-scaffold-module.md)
**Depends on:** [phase1-task1-convert-packaging](./phase1-task1-convert-packaging.md)
**Status:** Not started — unblocked, port resolved in [phase4-task1](./phase4-task1-choose-port.md)

Create `hms-webb/src/main/resources/application.properties` with at
minimum:

```properties
spring.application.name=hms-webb
server.address=0.0.0.0
server.port=8080
```
