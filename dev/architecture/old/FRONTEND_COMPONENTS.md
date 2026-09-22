# HMS Frontend Components — As-Built

**Last Updated:** 2026-09-23
**Verified by reading source directly** under `hms-pom/hms-webb/angular/src/app/`.

Angular 22, **100% standalone components — no `NgModule` exists anywhere** in `src/app` (confirmed via
grep). Now lives at `hms-pom/hms-webb/angular/` (moved there, unchanged internally, by the
hms-jar/hms-webb pom migration — see [WEBB_MODULE.md](./WEBB_MODULE.md)); the Angular project's own
`package.json` name is still `hms-frontend`, a cosmetic leftover, not a path. No
`environment.ts`/`environment.prod.ts` files exist at all.

## App structure

- **`auth/`** — public screens outside the main layout: `login/`, `forgot-password/`.
- **`core/`** — `guards/`, `interceptors/` (one: `auth.interceptor.ts`), `services/` (with
  `services/platform/` and `services/tenant/` sub-namespaces).
- **`features/`** — the tenant-facing HMS business modules, 73 standalone components across 13 domains,
  each with a matching `.spec.ts` (see [TESTING_STATUS.md](./TESTING_STATUS.md)).
- **`layout/`** — `header/`, `footer/`, `sidebar/`, `main-layout/` (tenant shell) and their platform
  equivalents `platform-header/`, `platform-sidebar/`, `platform-layout/` (the latter has no spec file).
- **`platform/`** — a **second, separate application area** ("Olives Tech" SaaS administration):
  `dashboard/`, `tenants/` (+ `create-tenant/`, `tenant-admin/`, `tenant-modules/`), `users/`, `plans/`
  (+ `create-plan/`), `subscriptions/` (+ `create-subscription/`), `modules/`. This is real UI, not just a
  backend concept — the platform/tenant/subscription/plan backend modules do have a frontend surface.
- **`shared/`** — only `models/` (+ `models/platform/`). No shared components/pipes/directives library
  exists; each feature builds its own markup.

## Feature domains (`features/`)

patients, doctors, departments, appointments, consultations, pharmacy, laboratory (+ nested
`laboratory-requests/`), admissions, billing (+ `receipts`), inventory, reports (single component),
dashboard (single component), settings (hub + `hospital-settings`, `system-preferences`,
`notification-settings`, `user-management`, `profile-settings`).

**`audit` has zero frontend presence** — no component, route, or service references audit logs, other
than the unused `PLATFORM_AUDIT_VIEW` permission string in `platform.guard.ts`. See
[FEATURE_COMPLETENESS.md](./FEATURE_COMPLETENESS.md).

## Routing

Single file, `app.routes.ts`, entirely `loadComponent`-based (no `app-routing.module.ts`, no separate
child-route files). Two top-level authenticated trees:

- `/platform/**` → `PlatformLayout`, guarded by `[authGuard, platformGuard]` — tenants, users, plans,
  subscriptions, modules, each leaf also carrying `permissionGuard` + a `data.permission`.
- `''` (root) → `MainLayout`, guarded by `[authGuard]` — every tenant-facing feature, each leaf also
  carrying `permissionGuard` + `data.permission`.

`/login` is public; `'**'` redirects to `/login`. Notable: `billing/receipts` is ordered explicitly
before `billing/:id` with an inline comment warning it would otherwise be captured as an invoice ID.

## Guards (`core/guards/`)

- **`authGuard`** — checks `AuthService.isAuthenticated()` (token + cached user in `sessionStorage`);
  redirects to `/login` if absent.
- **`permissionGuard`** — checks `route.data['permission']` against the user's permissions; `SUPER_ADMIN`
  always passes (documented as a frontend "safety net" only — backend remains final authority); logs
  verbose debug info to the console on **every** check, unconditionally.
- **`platformGuard`** — checks for any of 8 hard-coded platform permissions
  (`PLATFORM_MODULE_VIEW/MANAGE`, `PLATFORM_PLAN_VIEW/MANAGE`, `PLATFORM_SUBSCRIPTION_VIEW/MANAGE`,
  `PLATFORM_REPORT_VIEW`, `PLATFORM_AUDIT_VIEW`) — the last two are referenced here but used by no route
  or component anywhere in the app.

## Core services (`core/services/`)

All `@Injectable({providedIn:'root'})` wrapping `HttpClient`. Most use **relative** `/api/...` paths
(work through the dev proxy and transparently in the bundled-jar production model). **Four services
hardcode the absolute URL `http://localhost:8081/...`** instead: `report.service.ts`,
`receipt.service.ts`, `core/services/tenant/tenant-module.service.ts`, and
`core/services/platform/platform-user.service.ts` — these will break if the backend is ever deployed at
a different host/port. See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md).

There's a clear split: `core/services/platform/*` (SUPER_ADMIN-side: tenants, plans, subscriptions,
platform users, platform modules) vs. `core/services/tenant/tenant-module.service.ts` (tenant-side:
"what modules is *my* tenant entitled to" — loads enabled module codes into a `Set`, used by
`sidebar.ts` to gate nav items).

## Models (`shared/models/`)

15 flat model files + 6 under `models/platform/`. Hand-written TypeScript interfaces (not generated from
OpenAPI), mirroring backend entities/DTOs by convention rather than tooling — 1:1 mapping is not
enforced. All backend entities except `AuditLog` have a corresponding frontend model/service/UI.

## API base URL / build output

- No environment files. `proxy.conf.json`: `{"/api": {"target": "http://localhost:8081", ...}}`
  (dev-server only), matching the backend's real port.
- `angular.json`'s build output path is `../src/main/resources/static` (relative to `hms-webb/angular/`)
  — `ng build` compiles straight into `hms-webb`'s own static resources, not `hms-jar`'s. See
  [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) and [WEBB_MODULE.md](./WEBB_MODULE.md).

## Auth handling

JWT in `sessionStorage` (`hms_token`), cached user in `hms_user`. `auth.interceptor.ts` attaches the
bearer token to every outgoing request globally. **No global 401 handler** — no interceptor forces
logout/redirect on a 401; instead, 8 individual platform components independently check
`error.status === 401` and just display a message ("Your session has expired..."), without calling
`logout()` or navigating away automatically. Only 3 files call `logout()` at all: `auth.service.ts`
(defines it) and the two sidebar components (manual "Logout" action).

## Testing

Covered in [TESTING_STATUS.md](./TESTING_STATUS.md).

## State management

No NgRx/Akita/store library. No systematic reactive state layer — a few isolated `BehaviorSubject` uses,
minimal `signal()` use (2 files), and only 3 components use `OnPush`. The dominant pattern is
component-local class fields populated in `ngOnInit`. `TenantModuleService`'s in-memory `Set` cache is
the closest thing to shared reactive state.

## Styling/theming

`core/services/theme.service.ts` (406 lines) — manages `data-theme-mode` (light/dark/system, user choice)
and `data-theme` (resolved light/dark) attributes on `<html>`, listens for OS theme changes via
`matchMedia`, caches the mode in `localStorage` as a fast local cache while treating the backend's
per-tenant `SystemPreferences.theme` as the source of truth (synced via `applySystemSettings()`).
Global styles: `src/material-theme.scss`, `src/styles.css`, on top of Angular Material.
