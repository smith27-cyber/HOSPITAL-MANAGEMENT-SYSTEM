# Phase 1 — Scaffold the Spring Boot module

**Plan:** [hms-webb-morph-plan.md](../hms-webb-morph-plan.md)
**Status:** Not started

- [ ] `hms-webb/pom.xml`: `packaging: pom` → `packaging: jar`
- [ ] Add `spring-boot-starter-webmvc` (matches the starter name already
      used in `hms-jar` for this Spring Boot 4.x setup) + `spring-boot-devtools`
      (runtime, optional)
- [ ] Add `spring-boot-maven-plugin` to `<build><plugins>`
- [ ] Add main class `com.hms.webb.HmsWebbApplication`
- [ ] Add `src/main/resources/application.properties` — needs at minimum
      `spring.application.name` and `server.port` (see
      [Phase 4](./phase-4-cross-cutting-config.md), port isn't finalized yet)
- [ ] Verify `mvn -pl hms-webb spring-boot:run` boots cleanly with no
      static content yet (should just be an empty Whitelabel error page —
      that's expected before [Phase 2](./phase-2-angular-output-wiring.md))
