# Task: Verify `hms-jar` compiles without the removed files

**Phase:** [Phase 3 — Retire frontend-serving code from hms-jar](../../phases/phase-3-retire-stale-frontend-code.md)
**Depends on:** All prior Phase 3 tasks
**Status:** Done

From `hms-pom/`: `mvn -pl hms-jar compile`. Expect `BUILD SUCCESS` with no references to the deleted
`static/` resources or `AngularForwardController`. Also spot-check `hms-jar/target/classes/static/` is
absent (no stale compiled leftovers from a previous build).
