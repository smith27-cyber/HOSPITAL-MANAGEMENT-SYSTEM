# Task: Update `OPERATIONS.md`

**Phase:** [Phase 7 — Refresh dev/architecture/old for the new module layout](../../phases/phase-7-refresh-architecture-docs.md)
**Status:** Done

Update the "Running locally" instructions to match the new layout and the root `README.md`'s updated
Quick Start:

- Backend: `cd hms-pom && mvn -pl hms-jar spring-boot:run` (was `cd hms-backend && ./mvnw spring-boot:run`).
- Frontend dev loop: `cd hms-pom/hms-webb/angular && npm start`.
- Frontend packaged path (new, didn't exist before): `ng build` then `mvn -pl hms-webb spring-boot:run`,
  noting no hot-reload in packaged mode.
- Note there is now no `application-{profile}.properties` gap specific to two modules — both `hms-jar`
  and `hms-webb` each have their own single `application.properties`, same lack of profile separation as
  before, just duplicated across two modules now.
