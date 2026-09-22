# Task: Create the `hms-pom/pom.xml` parent

**Phase:** [Phase 1 — Scaffold the module skeleton](../../phases/phase-1-scaffold-module.md)
**Status:** Done

Create `hms-pom/pom.xml`:

- `groupId=com.hms`, `artifactId=hms-parent`, `version=1.0.0`, `packaging=pom`
- `<modules>hms-jar, hms-webb</modules>`
- `<properties>`: Java 21, `spring-boot.version=4.1.1`, `jjwt.version=0.12.6`,
  `springdoc-openapi.version=2.6.0`, plus Postgres driver and Lombok versions — copied from `paul`'s
  current `hms-jar/pom.xml` (post-move path), which already confirms Spring Boot 4.1.1 / Java 21 / jjwt
  0.12.6 / springdoc 2.6.0.
- `<dependencyManagement>` imports `spring-boot-starter-parent` as a BOM (`<scope>import</scope>`,
  `<type>pom</type>`) rather than using it as `<parent>`, plus manages jjwt/springdoc/postgresql/lombok
  versions directly.
- `<pluginManagement>` centralizes the `spring-boot-maven-plugin` version.

Use the `architecture/gsn-creating-a-new-pom-structure` branch's `hms-pom/pom.xml` as the direct
template — already read in full during planning; same coordinates apply here.
