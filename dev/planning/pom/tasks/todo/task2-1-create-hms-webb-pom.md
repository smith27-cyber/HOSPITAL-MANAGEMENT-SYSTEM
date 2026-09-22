# Task: Create `hms-webb/pom.xml`

**Phase:** [Phase 2 — Create the hms-webb Spring Boot module](../../phases/phase-2-create-hms-webb-module.md)
**Depends on:** Phase 1 (parent pom must exist)
**Status:** Not started

Create `hms-pom/hms-webb/pom.xml`:

- `<parent>` = `com.hms:hms-parent:1.0.0`, `relativePath=../pom.xml`
- `<artifactId>hms-webb</artifactId>`, `<packaging>jar</packaging>`
- Dependencies: `spring-boot-starter-webmvc` (note: this exact starter name — Spring Boot 4.x renamed it
  from `spring-boot-starter-web`, and `hms-jar` already uses this name too) and `spring-boot-devtools`
  (`runtime`, `optional`).
- Explicitly **no** JPA/database/security dependencies — this module only serves static files and
  forwards `/api/**`.
- `spring-boot-maven-plugin` in `<build><plugins>`, no version pinned (inherited from the parent's
  `pluginManagement`).

Template: `architecture/gsn-creating-a-new-pom-structure`'s `hms-pom/hms-webb/pom.xml`.
