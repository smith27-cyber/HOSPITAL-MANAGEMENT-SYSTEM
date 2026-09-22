# Task: Add spring-boot-maven-plugin to `hms-webb`

**Phase:** [Phase 1 — Scaffold the Spring Boot module](../phases/phase-1-scaffold-module.md)
**Depends on:** [phase1-task1-convert-packaging](./phase1-task1-convert-packaging.md)
**Status:** Not started

Add the plugin to `hms-webb/pom.xml`'s `<build><plugins>`:

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
</plugin>
```

No version needed — it's already managed in `pluginManagement` at the
parent (`hms-parent`) level. This is what makes `mvn spring-boot:run` and
building an executable jar work for this module.
