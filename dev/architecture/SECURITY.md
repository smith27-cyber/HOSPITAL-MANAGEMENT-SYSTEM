# HMS Security & Authentication

**Version:** 1.2
**Last Updated:** 2026-09-23

---

## Authentication

- **JWT**, HMAC-signed (`io.jsonwebtoken` 0.12.6), 8-hour expiry (`hms.jwt.expiration=28800000`).
- Secret (`hms.jwt.secret`) and the Postgres password are **plaintext in `application.properties`** —
  not read from an environment variable or secrets manager. A real hardening gap.
- `JwtService.generateToken(User, roles, permissions)` embeds `userId`, `username`, `tenantId`,
  `tenantCode`, `tenantName`, `fullName`, legacy `role`, `roles`, `permissions` as claims.
- **No self-service registration.** New tenant users are created only via `POST /api/users` (an existing
  admin, `SETTINGS_USER_MANAGE`) or `POST /api/tenants/{id}/admin` (platform-only, `TENANT_ADMIN_CREATE`,
  always assigns role `ADMIN`). SUPER_ADMIN and RBAC test accounts are created only by
  `RbacDataInitializer` at boot. **There is no logout endpoint** — JWT is stateless; the client just
  discards the token from `sessionStorage`.
- `AuthService.login` deliberately returns the same generic error for "user not found" and "wrong
  password" (`"Invalid username or password"`) to avoid leaking account existence.

## Authorization (RBAC)

RBAC did not exist in earlier drafts of this document — this whole section postdates the branch it was
originally written against.

- `Role` ↔ `Permission` many-to-many (join `role_permissions`); `User` ↔ `Role` many-to-many (join
  `user_roles`), plus a **legacy single-string `role` column** kept in parallel "during the RBAC
  migration" and still synchronized on every create/update.
- All `@PreAuthorize` checks use `hasAuthority('PERMISSION_CODE')`, never `hasRole(...)` — matching the
  raw, unprefixed permission-code `GrantedAuthority` strings added by `JwtAuthenticationFilter` (roles
  are separately added with a `ROLE_` prefix but nothing in the codebase currently checks `hasRole`).
- **`RbacDataInitializer`** seeds ~60 permissions and 10 roles (`SUPER_ADMIN`, `ADMIN`, `DOCTOR`, `NURSE`,
  `RECEPTIONIST`, `PHARMACIST`, `LABORATORY_TECHNICIAN`, `ACCOUNTANT`, `RECORDS_OFFICER`,
  `HOSPITAL_MANAGER`) at every boot, idempotently. `SUPER_ADMIN` gets every permission; `ADMIN` gets every
  permission except `TENANT_*` (tenant lifecycle is platform-only); the other 8 roles get hand-picked
  subsets. It also seeds hardcoded test accounts per role (`test_doctor`/`doctor123`, etc.) and guarantees
  `admin`/`admin123` and `superadmin`/`superadmin123` exist — **seeded passwords are never rotated**.
- **`PlatformPermissionInitializer`** (`@Order(110)`) seeds 5 more permissions afterward:
  `PLATFORM_MODULE_MANAGE`, `PLATFORM_PLAN_MANAGE`, `PLATFORM_SUBSCRIPTION_MANAGE`,
  `PLATFORM_REPORT_VIEW`, `PLATFORM_AUDIT_VIEW`.
- **`AUDIT_LOG_VIEW` is now seeded** (added to `RbacDataInitializer`'s definitions — `SUPER_ADMIN`/`ADMIN`
  get it automatically, same as every other permission). It's still a string distinct from
  `PLATFORM_AUDIT_VIEW` (seeded separately by `PlatformPermissionInitializer`, checked nowhere) — the two
  were never meant to be the same thing, `PLATFORM_AUDIT_VIEW` just happened to look like a typo of it.
  Live-verified: `admin` now gets `200` from `GET /api/audit-logs`. See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md).
- **Controllers with zero `@PreAuthorize` annotations** (reachable by any authenticated user regardless
  of role): `ReceiptController`, `SystemPreferencesController`, `TenantModuleController`. `HealthController`
  has none by design (`permitAll`).

## Tenant isolation

Multi-tenancy did not exist in earlier drafts of this document either — see
[DATA_FLOW.md](./DATA_FLOW.md) for the full request-level walkthrough.

- `tenant/context/TenantContext` — a `ThreadLocal<Long>` wrapper (`setTenantId`, `getTenantId`,
  `requireTenantId` — throws if unset, `clear`).
- `TenantContextFilter` (second in the chain) independently re-parses the same bearer JWT, extracts
  `tenantId`, and populates `TenantContext`; always clears it in a `finally` block to prevent leakage
  across pooled threads.
- **Isolation is entirely manual** — every tenant-scoped service calls
  `TenantContext.requireTenantId()`/`getTenantId()`, and every repository query used is one of the
  `findAllByTenant_Id`/`findByIdAndTenant_Id` derived methods. There is **no Hibernate-level
  `@Filter`/`@TenantId` mechanism** as a safety net — a developer who writes or calls a non-tenant-scoped
  finder would leak cross-tenant data with no automatic guard.

## Module entitlement

- `platform/filter/ModuleAccessFilter` (third in the chain): skips `/api/auth/`, `/api/health`,
  `/api/platform/`, `/api/tenants`, `/swagger-ui`, `/v3/api-docs` outright, then does longest-prefix
  matching against a hard-coded route→`ModuleCode` map for the rest. If the resolved tenant's
  `TenantModule.enabled` is `false`, returns HTTP 403 with `{"error":"MODULE_NOT_ENABLED", ...}`.
  `ROLE_SUPER_ADMIN` always bypasses this check.
- **Gap:** `/api/audit-logs`, `/api/users`, `/api/receipts`, `/api/tenant/modules` are in neither the
  route map nor the explicit skip list — module gating is silently a no-op for these four paths.

## CORS

**Blocked entirely — no configuration.** As part of the `hms-jar`/`hms-webb` pom migration, the global
`CorsConfigurationSource` bean, the `.cors(...)` registration, and all 20 `@CrossOrigin` annotations (19
controllers using `http://localhost:4200`, plus `ConsultationController`'s wildcard
`@CrossOrigin(origins="*")`, which had been the one real gap — wide open to any origin, not just
redundant boilerplate) were removed from `SecurityConfig` and every controller.

This is safe because the browser now never makes a cross-origin request to `hms-jar` at all: `ng serve`'s
dev proxy and `hms-webb`'s `WebApiForwardController` both forward `/api/**` to `hms-jar` server-side, so
from the browser's perspective whichever of those it's talking to *is* the API. See
[WEBB_MODULE.md](./WEBB_MODULE.md) for the mechanism.

Live-verified: `curl -H "Origin: http://evil.example" -i http://localhost:8081/api/departments` → `403`
with no `Access-Control-Allow-Origin` header in the response, confirming CORS is closed at the source,
not just unused.

## Filter chain order

`JwtAuthenticationFilter` → `TenantContextFilter` → `ModuleAccessFilter` → Controller. CSRF is disabled
(stateless JWT API, no cookies). Session management is `STATELESS`.

## Exception handling and information leakage

No `@ControllerAdvice`/`@ExceptionHandler` exists anywhere (see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)) —
uncaught exceptions fall through to Spring Boot's default `/error` handler (`permitAll()`, unauthenticated
reachable), which by default can include stack-trace-adjacent detail depending on Boot's error properties.
This was not independently verified against `application.properties`'s `server.error.*` settings (none are
set, so Boot defaults apply).

## Related Documentation

- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) — where these filters sit in the overall request lifecycle
- [DATA_FLOW.md](./DATA_FLOW.md) — concrete flow walkthroughs (login, tenant resolution, module gating)
- [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md) — `SecurityConfig` and related config classes
- [API_DESIGN.md](./API_DESIGN.md) — per-endpoint permission requirements
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — module-gating gap, missing exception handler, and other open items
