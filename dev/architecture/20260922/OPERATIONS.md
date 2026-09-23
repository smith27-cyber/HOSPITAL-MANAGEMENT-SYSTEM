# HMS Operations — Running, Error Handling, Performance, Monitoring, Deployment

**Version:** 1.2
**Last Updated:** 2026-09-23

---

## Running locally

1. **Database**: `docker-compose up -d` (root `docker-compose.yml`) — Postgres 15, `hms_database`/
   `hms_user`, port 5432, with a healthcheck.
2. **Backend API (`hms-jar`)**: `cd hms-pom && ./mvnw -pl hms-jar spring-boot:run` — Spring Boot 4.1.1,
   Java 21, listens on `0.0.0.0:8081`. Schema is created/updated automatically at boot
   (`ddl-auto=update`). `RbacDataInitializer`, `PlatformDataInitializer` (`@Order(100)`), and
   `PlatformPermissionInitializer` (`@Order(110)`) all run automatically and are idempotent, so repeated
   restarts are safe.
3. **Frontend, dev loop**: `cd hms-pom/hms-webb/angular && npm start` (`ng serve`) — proxies `/api/**` to
   `localhost:8081` via `proxy.conf.json`. Never touches `hms-webb`'s Java side or its `static/` output.
4. **Frontend, packaged (`hms-webb`)**: `cd hms-pom/hms-webb/angular && npm run build` (writes into
   `../src/main/resources/static`, gitignored), then `cd .. && ./mvnw spring-boot:run` — `hms-webb` serves
   the bundle on 8080 and forwards `/api/**` to `hms-jar`. No hot-reload in this mode.

Backend config: `hms-jar`'s `application.properties` (DB, JWT, Swagger) has no
`application-{profile}.properties` — the same file, with plaintext DB password and JWT secret, is used
everywhere. `hms-webb`'s own `application.properties` only sets `server.port=8080`.

## CI/CD

**No CI pipeline exists for this application.** `.github/` in this repo contains only
`.github/modernize/java-upgrade/` (a Java-upgrade tooling scaffold), not a build/test/deploy workflow for
HMS itself. Builds and tests are entirely manual (`./mvnw test`, `ng test`, `ng build`).

## Backups / disaster recovery

Not addressed anywhere in the codebase or config — no backup scripts, no documented restore procedure.
Fine for a project at this stage, a real gap once deployed with actual tenant data.

---

## Error Handling Architecture

### Frontend Error Handling

1. **Interceptor Level** - Catch HTTP errors
2. **Service Level** - Handle API errors
3. **Component Level** - Display user messages
4. **Global Handler** - Catch unhandled errors

### Backend Error Handling

1. **Controller Level** - Catch validation errors
2. **Service Level** - Business rule violations
3. **Repository Level** - Database errors
4. **Global Handler** - Format all errors consistently

**⚠️ Not implemented.** This describes the *intended* pattern only. There
is no `@ExceptionHandler`/`@ControllerAdvice` anywhere in the backend —
see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) (P1). The structure below is the
target shape, not current behavior.

### Error Response Structure (intended)

```java
{
  "timestamp": "2026-09-03T10:00:00Z",
  "status": 400,
  "error": "Validation Error",
  "message": "Email already exists",
  "path": "/api/patients"
}
```

---

## Performance Optimization Strategy

### Frontend

- Lazy load feature routes
- OnPush change detection
- Unsubscribe from observables
- Minimize bundle size

### Backend

- Connection pooling
- Query result caching
- Lazy load relationships
- Pagination for large datasets

### Database

- Index optimization
- Query plan analysis
- Connection limits
- Backup/recovery strategy

See [STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md)'s Performance Status for
what's actually been done vs. planned.

---

## Monitoring & Logging

### Implemented

- Basic Spring Boot logging
- HTTP request logging
- Error stack traces
- User action logging (basic)

### Recommended Additions

- Application performance monitoring (APM)
- Distributed tracing
- Database query logging
- Frontend error tracking
- User behavior analytics

---

## Deployment Architecture

```
Developer Machine
    ↓
GitHub Repository
    ↓
CI/CD Pipeline (Optional)
    ↓
Build Artifacts
    ↓
Production Environment
    ├── hms-webb (Spring Boot JAR, port 8080 — serves Angular + Web API)
    ├── hms-jar (Spring Boot JAR, port 8081 — Backend API)
    └── Database (PostgreSQL instance)
```

**Updated:** this now reflects `hms-webb`'s actual role — two Spring Boot
processes, not one JAR plus static files on a separate web server. See
[WEBB_MODULE.md](./WEBB_MODULE.md) for how they fit together.

---

## Related Documentation

- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — error handling gap, other open issues
- [STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md) — current performance/deployment status
- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) — overall architecture
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) — scalability considerations
