# Task: Verify the wrapper and the new test

**Phase:** [Phase 8 — Complete the multi-module build tooling](../../phases/phase-8-complete-build-tooling.md)
**Depends on:** task8-1, task8-2
**Status:** Done

From `hms-pom/`:
- `./mvnw -pl hms-jar,hms-webb compile` — confirm the relocated wrapper builds both modules with no
  Maven installation required beyond the wrapper itself.
- `./mvnw -pl hms-webb test` — confirm `HmsWebbApplicationTests` passes (context loads standalone, no DB
  needed).
- Confirm `hms-jar`'s own tests still pass unaffected: `./mvnw -pl hms-jar test`.
