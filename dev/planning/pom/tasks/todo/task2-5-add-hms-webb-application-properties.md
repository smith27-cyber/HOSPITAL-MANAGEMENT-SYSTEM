# Task: Add `hms-webb`'s `application.properties`

**Phase:** [Phase 2 — Create the hms-webb Spring Boot module](../../phases/phase-2-create-hms-webb-module.md)
**Status:** Not started

Create `hms-pom/hms-webb/src/main/resources/application.properties`:

```properties
spring.application.name=hms-webb
server.address=0.0.0.0
server.port=8080
```

Port `8080` is Spring Boot's conventional default, deliberately free since `hms-jar` already moved off
it to `8081`. Full port map: `hms-jar` = 8081, `hms-webb` = 8080, `ng serve` = 4200 (unchanged CLI
default).
