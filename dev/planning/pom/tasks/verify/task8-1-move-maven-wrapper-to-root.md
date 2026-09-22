# Task: Move the Maven wrapper to the reactor root

**Phase:** [Phase 8 — Complete the multi-module build tooling](../../phases/phase-8-complete-build-tooling.md)
**Status:** Done

`git mv hms-pom/hms-jar/mvnw hms-pom/mvnw`, same for `mvnw.cmd` and the `.mvn/` directory
(`hms-pom/hms-jar/.mvn` → `hms-pom/.mvn`). This is a plain relocation — `maven-wrapper.properties`
inside `.mvn/wrapper/` needs no edits, since it just pins a Maven distribution URL/version, unrelated to
which module invokes it.

After the move, `./mvnw` from `hms-pom/` should work exactly like a system-installed `mvn` would for any
of the commands already used throughout this migration (`./mvnw -pl hms-jar spring-boot:run`, etc.).

Also move `hms-jar/.gitattributes` to `hms-pom/.gitattributes` — its two lines (`/mvnw text eol=lf`,
`*.cmd text eol=crlf`) are entirely about the wrapper scripts, not `hms-jar` itself, and `/mvnw` is
path-anchored to the directory the `.gitattributes` file lives in.

**Found while verifying**: `mvnw` was tracked in git as mode `100644` (not executable) even before this
move — a pre-existing packaging quirk, not something the move caused. Fixed with
`git update-index --chmod=+x hms-pom/mvnw` so `./mvnw` actually runs after a fresh clone instead of
requiring `bash mvnw` or a manual `chmod`.
