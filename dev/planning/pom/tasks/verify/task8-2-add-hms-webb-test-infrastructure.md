# Task: Add test infrastructure to `hms-webb`

**Phase:** [Phase 8 — Complete the multi-module build tooling](../../phases/phase-8-complete-build-tooling.md)
**Status:** Done

- Add `spring-boot-starter-webmvc-test` (scope `test`) to `hms-pom/hms-webb/pom.xml` — matching
  `hms-jar`'s established convention of the Boot 4 "split" test starters (per its own dependency on
  `spring-boot-starter-webmvc`) rather than the classic all-in-one `spring-boot-starter-test`.
- Add `hms-pom/hms-webb/src/test/java/com/hms/webb/HmsWebbApplicationTests.java` — the same
  `@SpringBootTest` context-load smoke test pattern `hms-jar` already has
  (`HmsBackendApplicationTests.java`). Since `hms-webb` has no JPA/DB dependency, this test needs no
  Testcontainers/embedded-DB setup — it should boot standalone.
