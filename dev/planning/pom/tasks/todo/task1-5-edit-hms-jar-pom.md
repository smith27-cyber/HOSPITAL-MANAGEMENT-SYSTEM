# Task: Adapt `hms-jar/pom.xml` to the new parent

**Phase:** [Phase 1 — Scaffold the module skeleton](../../phases/phase-1-scaffold-module.md)
**Depends on:** [task1-4-create-parent-pom](./task1-4-create-parent-pom.md)
**Status:** Not started

In `hms-pom/hms-jar/pom.xml`:

- Replace the `<parent>` block (currently `spring-boot-starter-parent`) with
  `com.hms:hms-parent:1.0.0`, `relativePath=../pom.xml`.
- Change `<artifactId>` from `hms-backend` to `hms-jar`.
- Drop version tags on dependencies now managed by the parent's `dependencyManagement` (jjwt, springdoc,
  postgresql, lombok) to avoid duplicate/conflicting version declarations.
- **Do not** change the Java package (`com.hms.backend` stays exactly as-is) or the main class name
  (`HmsBackendApplication`) — only the Maven module identity changes, not the code identity. This matches
  what the reference branch did: its `hms-jar` still has `package com.hms.backend;` and
  `<mainClass>com.hms.backend.HmsBackendApplication</mainClass>` in the `spring-boot-maven-plugin` config.
