# Task: Add Spring Boot dependencies to `hms-webb`

**Phase:** [Phase 1 — Scaffold the Spring Boot module](../../phases/phase-1-scaffold-module.md)
**Depends on:** [phase1-task1-convert-packaging](./phase1-task1-convert-packaging.md)
**Status:** Done

Add to `hms-webb/pom.xml`:
- `spring-boot-starter-webmvc` — matches the starter name already used in
  `hms-jar` for this Spring Boot 4.x setup (not the older `spring-boot-starter-web`
  name). This is what gives the module an embedded Tomcat and static
  resource serving.
- `spring-boot-devtools` (`runtime`, `optional`) — for hot-reload during
  local development, matching `hms-jar`'s existing setup.

No database, JPA, or security dependencies needed — this module only
serves static files.
