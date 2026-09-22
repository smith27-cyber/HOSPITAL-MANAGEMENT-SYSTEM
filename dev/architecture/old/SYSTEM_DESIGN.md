# HMS System Design — As-Built

**Last Updated:** 2026-09-23

---

## High-level shape

Two Spring Boot processes, one Maven reactor (`hms-pom/`):

- **`hms-pom/hms-jar/`** — the Backend API. Spring Boot 4.1.1 / Java 21, package root `com.hms.backend`
  (unchanged by the pom migration — only the module/directory path moved). Serves `/api/**` only, port
  8081. No frontend awareness at all: no static resources, no CORS configuration, no SPA-forwarding
  controller.
- **`hms-pom/hms-webb/`** — the Web module. A separate, minimal Spring Boot app (`com.hms.webb`, port
  8080) that does two things: serves the compiled Angular bundle as static content (with SPA-fallback
  routing) and forwards `/api/**` to `hms-jar`. Has no entities, repositories, or business logic.
  Contains the Angular project at `hms-webb/angular/`.

There is no API gateway, message queue, cache layer, or separate auth server. See
[WEBB_MODULE.md](./WEBB_MODULE.md) for full detail on `hms-webb`'s two classes
(`SpaWebConfig`, `WebApiForwardController`) and why this split lets `hms-jar` have zero CORS
configuration.

## Deployment model (dual, both real)

1. **Standalone dev serving**: `ng serve` (`npm start` in `hms-webb/angular/`) runs the Angular dev
   server on its own port (4200). `hms-webb/angular/proxy.conf.json` forwards `/api/**` to
   `http://localhost:8081` (`hms-jar`'s actual port). Frontend code calls relative `/api/...` paths so
   this works transparently, and this mode never touches `hms-webb`'s Java side or its `static/` output.
2. **Packaged serving**: `angular.json`'s `build.options.outputPath` is set to
   `{"base": "../src/main/resources/static", "browser": ""}` (relative to `hms-webb/angular/`) — `ng
   build` compiles the Angular app **directly into `hms-webb`'s static resources folder**
   (`hms-pom/hms-webb/src/main/resources/static/`, gitignored). Running `hms-webb`
   (`mvn -pl hms-webb spring-boot:run`) then serves that bundle on port 8080, with `SpaWebConfig` handling
   client-side-route fallback to `index.html` (works for every route automatically, no hardcoded list)
   and `WebApiForwardController` forwarding `/api/**` to `hms-jar`. No hot-reload in this mode — a fresh
   `ng build` requires restarting `hms-webb`.

The formerly-stray build artifacts at the repository root (`index.html`, `main-V6MMLPDK.js`,
`styles-4KNJEDFK.css`) and the git-tracked static bundle that used to live inside `hms-jar` have both
been removed — see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) for the resolved entries.

## Request lifecycle (authenticated API call)

```
Client (Angular)
  → Authorization: Bearer <jwt> attached by auth.interceptor.ts (functional HttpInterceptorFn)
  → Spring Security filter chain:
      1. JwtAuthenticationFilter   — validates JWT, sets SecurityContext (roles as ROLE_*, permissions as raw authorities)
      2. TenantContextFilter       — re-parses the JWT, sets ThreadLocal tenant ID via TenantContext
      3. ModuleAccessFilter        — checks the resolved tenant is entitled to the module the path maps to
  → Controller (@PreAuthorize("hasAuthority('X')") per endpoint)
  → Service (tenant-scoped via TenantContext.requireTenantId())
  → Repository (findAllByTenant_Id / findByIdAndTenant_Id derived methods)
  → PostgreSQL
```

See [SECURITY.md](./SECURITY.md) for full detail on each filter, and [DATA_FLOW.md](./DATA_FLOW.md) for
concrete end-to-end flows (login, tenant provisioning, billing).

## The two "sides" of the application

- **Tenant-facing HMS** (`MainLayout` in the frontend, `authGuard` only): patients, doctors, departments,
  appointments, consultations, pharmacy, laboratory, admissions, billing, inventory, reports, dashboard,
  hospital/system settings, user management. Backed by the flat `controller/service/repository/entity/dto`
  packages plus `auth/` (users) and `settings/` (system preferences).
- **Platform/SaaS administration** ("Olives Tech", `PlatformLayout` in the frontend, `authGuard` +
  `platformGuard`): managing tenants, subscription plans, per-tenant module toggles, and platform-wide
  users. Backed by the `platform/` and `tenant/` packages. A tenant's actual module access is driven by
  whichever `Plan` its active `Subscription` references (see [DATA_FLOW.md](./DATA_FLOW.md)).

`audit/` (the `AuditLog` entity and its service/controller/repository) exists only on the backend — there
is **no frontend UI for it at all** (confirmed: the only frontend reference to "audit" is the unused
`PLATFORM_AUDIT_VIEW` permission string in `platform.guard.ts`). Its endpoints are also currently
unreachable regardless, because `AUDIT_LOG_VIEW` — the permission `AuditLogController` actually checks —
is never seeded by any RBAC initializer. See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md).

## Multi-tenancy & module entitlement, in one paragraph

Every tenant-scoped table has a `tenant_id` foreign key; isolation is enforced **manually**, per query, by
using tenant-scoped repository methods (`findAllByTenant_Id`, etc.) — there is no Hibernate-level
`@Filter`/`@TenantId` safety net, so a developer who forgets to call the tenant-scoped finder would leak
cross-tenant data. Module entitlement is a separate, additional layer on top: `PlatformModule` is the
catalog of installable modules, `TenantModule` is the per-tenant enabled/disabled row, and
`ModuleAccessFilter` checks path-prefix → module-code → `TenantModule.enabled` on every request (except a
hard-coded skip list and `ROLE_SUPER_ADMIN`). Full detail in [DATA_FLOW.md](./DATA_FLOW.md) and
[SECURITY.md](./SECURITY.md).
