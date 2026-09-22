# HMS System Design — As-Built

**Last Updated:** 2026-09-23

---

## High-level shape

Two applications, one deployable artifact:

- **`hms-backend/`** — Spring Boot 4.1.1 / Java 21 / Maven, package root `com.hms.backend`. Serves the
  REST API under `/api/**`, and in production also serves the compiled Angular bundle as static content.
- **`hms-frontend/`** — Angular 22, 100% standalone components (no `NgModule` anywhere in `src/app`).

There is no API gateway, message queue, cache layer, or separate auth server — a single Spring Boot
process does everything: REST API, static asset serving, and SPA fallback routing.

## Deployment model (dual, both real)

1. **Standalone dev serving**: `ng serve` (`npm start` in `hms-frontend/`) runs the Angular dev server on
   its own port. `hms-frontend/proxy.conf.json` forwards `/api/**` to `http://localhost:8081` (the
   backend's actual port per `application.properties`). Frontend code calls relative `/api/...` paths so
   this works transparently.
2. **Bundled production serving**: `angular.json`'s `build.options.outputPath` is set to
   `{"base": "../hms-backend/src/main/resources/static", "browser": ""}` — `ng build` compiles the
   Angular app **directly into the Spring Boot module's static resources folder**, not into
   `hms-frontend/dist`. A built bundle already exists there (`index.html`, hashed `chunk-*.js`,
   `main-ZRC3TWN4.js`, `styles-IFUDU7FW.css`). `com.hms.backend.config.AngularForwardController` forwards
   a whitelist of Angular client routes (`/`, `/login`, `/dashboard`, every feature root + `/**`,
   `/platform/**`) to `forward:/index.html` so Angular's client-side router can take over — the standard
   SPA-fallback pattern.

**Stray artifacts**: `index.html`, `main-V6MMLPDK.js`, and `styles-4KNJEDFK.css` also exist directly at
the repository root (not inside `hms-frontend/` or `hms-backend/.../static/`), with different content
hashes than the ones actually served from `static/`. These look like an accidental or superseded build
output left at the wrong location — see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md).

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
