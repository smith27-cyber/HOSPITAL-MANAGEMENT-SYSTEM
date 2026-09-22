# Task: Remove the stale static build from `hms-jar`

**Phase:** [Phase 3 — Retire frontend-serving code from hms-jar](../../phases/phase-3-retire-stale-frontend-code.md)
**Depends on:** Phase 2 (hms-webb must exist to take over static serving)
**Status:** Done

`git rm -r hms-pom/hms-jar/src/main/resources/static` — removes the 92 currently git-tracked Angular
build files. Static serving is now `hms-webb`'s job exclusively; `hms-jar` should never serve static
content (hard constraint carried over from the reference plan).
