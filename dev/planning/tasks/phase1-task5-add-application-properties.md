# Task: Add `application.properties` for `hms-webb`

**Phase:** [Phase 1 — Scaffold the Spring Boot module](../phases/phase-1-scaffold-module.md)
**Depends on:** [phase1-task1-convert-packaging](./phase1-task1-convert-packaging.md)
**Blocked on decision:** [phase4-task1-choose-port](./phase4-task1-choose-port.md) — port isn't confirmed yet

Create `hms-webb/src/main/resources/application.properties` with at
minimum:

```properties
spring.application.name=hms-webb
server.address=0.0.0.0
server.port=<TBD — see phase4-task1>
```

Don't hardcode `8082` until [Phase 4](../phases/phase-4-cross-cutting-config.md)'s
port decision is actually made — this task is blocked on that answer, not
free to guess ahead of it.
