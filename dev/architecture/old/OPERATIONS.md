# HMS Operations — As-Built

**Last Updated:** 2026-09-23

## Running locally

1. **Database**: `docker-compose up -d` (root `docker-compose.yml`) — Postgres 15, `hms_database`/
   `hms_user`, port 5432, with a healthcheck.
2. **Backend API (`hms-jar`)**: `cd hms-pom && mvn -pl hms-jar spring-boot:run` (or via IDE) — Spring
   Boot 4.1.1, Java 21, listens on `0.0.0.0:8081`. Schema is created/updated automatically at boot
   (`ddl-auto=update`, no migration step needed). `RbacDataInitializer`, `PlatformDataInitializer`
   (`@Order(100)`), and `PlatformPermissionInitializer` (`@Order(110)`) all run automatically and are
   idempotent (get-or-create), so repeated restarts are safe.
3. **Frontend, dev loop**: `cd hms-pom/hms-webb/angular && npm start` (`ng serve`) — proxies `/api/**` to
   `localhost:8081` via `proxy.conf.json`. Never touches `hms-webb`'s Java side.
4. **Frontend, packaged (`hms-webb`)**: `cd hms-pom/hms-webb/angular && npm run build` (`ng build`)
   writes directly into `hms-pom/hms-webb/src/main/resources/static` (gitignored); then
   `cd .. && mvn spring-boot:run` — `hms-webb` serves the built bundle on port 8080 and forwards
   `/api/**` to `hms-jar` on 8081. No hot-reload in this mode — a fresh `ng build` requires restarting
   `hms-webb`.

## Configuration

Backend config is split across two modules, each with its own `application.properties`: `hms-jar`'s
(DB, JWT, Swagger — see below) and `hms-webb`'s (just `server.port=8080`). Neither module has
`application-{profile}.properties` files, so there is currently **no dev/staging/prod profile
separation**; `hms-jar`'s single file (with plaintext DB password and JWT secret) is used everywhere.

Key properties: `server.port=8081`, `spring.datasource.url=jdbc:postgresql://localhost:5432/hms_database`,
`spring.jpa.hibernate.ddl-auto=update`, `hms.jwt.secret`/`hms.jwt.expiration` (8h), `springdoc.*`
(Swagger paths).

## API documentation

Swagger UI at `/swagger-ui.html`, OpenAPI JSON at `/api-docs` (both `springdoc-openapi-starter-webmvc-ui`
2.6.0). The bearer-auth scheme is registered globally (`@SecurityScheme` in `OpenApiConfig`) but no
controller applies `@SecurityRequirement` per-endpoint, so authorizing in the Swagger UI requires manually
clicking "Authorize" rather than endpoints being pre-annotated.

## CI/CD

**No CI pipeline exists for this application.** `.github/` in this repo contains only
`.github/modernize/java-upgrade/` (a Java-upgrade tooling scaffold with PowerShell/bash hook scripts),
not a build/test/deploy workflow for HMS itself. There is no `.github/workflows/*.yml` running tests,
linting, or builds on push/PR. Builds and tests are entirely manual (`mvnw`, `ng test`, `ng build`).

## Logging & observability

`logging.level.org.springframework.web=INFO`, `logging.level.org.hibernate.SQL=INFO`,
`spring.jpa.show-sql=true` — SQL statements are logged. No structured logging, no APM/tracing
integration, no external log aggregation configured. `permissionGuard` on the frontend also logs
extensive debug info to the browser console on every route check, unconditionally (no dev/prod gate) —
see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md).

## Backups / disaster recovery

Not addressed anywhere in the codebase or config — no backup scripts, no documented restore procedure.
This is expected for a project at this stage but is a gap if the app is ever deployed with real tenant
data.
