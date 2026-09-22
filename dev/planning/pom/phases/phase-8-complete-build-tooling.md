# Phase 8 — Complete the multi-module build tooling

**Plan:** [../../hms-pom-migration-plan.md](../../hms-pom-migration-plan.md)
**Depends on:** Phases 1–7 complete and verified
**Status:** Done

Two structural gaps left over from the migration, found while continuing development past Phase 7:

1. **Maven wrapper is in the wrong place.** `mvnw`/`mvnw.cmd`/`.mvn/` only exist under `hms-jar/` (a
   leftover from when it was a standalone project) — not at the `hms-pom/` reactor root. Anyone without
   Maven installed globally can't run `./mvnw -pl hms-jar,hms-webb ...` from the root, which defeats the
   point of a multi-module wrapper.
2. **`hms-webb` has zero test infrastructure.** No `spring-boot-starter-test` dependency, no `src/test/`
   directory at all — unlike `hms-jar`, which at least has the default Spring Boot context-load smoke
   test.

## Tasks

1. [Move the Maven wrapper to the reactor root](../tasks/verify/task8-1-move-maven-wrapper-to-root.md) — Done
2. [Add test infrastructure to hms-webb](../tasks/verify/task8-2-add-hms-webb-test-infrastructure.md) — Done
3. [Verify the wrapper and the new test](../tasks/verify/task8-3-verify-wrapper-and-test.md) — Done
