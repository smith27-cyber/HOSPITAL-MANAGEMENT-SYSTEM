# HMS Known Issues & Next Steps

**Version:** 1.2
**Last Updated:** 2026-09-23

All items below were verified directly against source, not inferred from other documentation.

## High priority

- **Audit logging write coverage is effectively limited to pharmacy.** `AuditLogService.log(...)` is only
  called from `PharmacyPrescriptionServiceImpl` (verified by grep, 8 call sites). No other domain
  (billing, admissions, consultations, patients, users, tenant/platform actions) writes an audit entry,
  despite the entity/infrastructure existing for all of them.
- **No global exception handling.** `API_DESIGN.md` used to document a specific error response shape
  (`{"timestamp", "status", "error", "message", "path"}`) as if it were current behavior, and
  `dto/ErrorResponse.java` exists to model it — but nothing constructs or returns it. There is no
  `@ExceptionHandler`/`@ControllerAdvice` anywhere in the backend (confirmed by exhaustive grep). Only
  `LaboratoryRequestController` manually catches exceptions inline; every other controller lets
  service-layer exceptions propagate to Spring Boot's default `/error` handler.
- **`OLIVES-DEFAULT` tenant has zero enabled modules.** Every module-gated endpoint tried
  (`/api/departments`, `/api/dashboard`) returns `403 MODULE_NOT_ENABLED` for a normal tenant user,
  reproduced identically hitting `hms-jar` directly (not a proxy artifact) — surfaced during the
  hms-jar/hms-webb pom migration's live verification. Likely an initializer-ordering issue:
  `RbacDataInitializer` creates the `OLIVES-DEFAULT` tenant, but `PlatformDataInitializer`'s
  `initializeTenantDefaults` (which enables all modules) only runs for tenants that already exist at
  `@Order(100)`, so a tenant created by the unordered `RbacDataInitializer` may get no `TenantModule`
  rows at all depending on initializer run order.
- **Secrets are plaintext in version control.** `hms.jwt.secret` and the Postgres password are committed
  as plaintext in `application.properties` (and the Postgres password again in `docker-compose.yml`), not
  sourced from environment variables or a secrets manager.
- **Four frontend services hardcode `http://localhost:8081`** (`report.service.ts`, `receipt.service.ts`,
  `tenant-module.service.ts`, `platform-user.service.ts`) instead of using the relative `/api/...` path
  every other service uses. **This is not a theoretical "different environment" risk — it actively breaks
  the standard `ng serve` dev workflow right now.** `TenantModuleService` calls its hardcoded URL directly,
  and `hms-jar` has no CORS policy at all (removed deliberately during the pom migration — the browser is
  only ever meant to reach it same-origin via `ng serve`'s dev proxy or `hms-webb`'s forward controller).
  The result, reproduced directly via the browser's own console: every request is blocked
  (`Access to fetch at 'http://localhost:8081/api/tenant/modules' from origin 'http://localhost:4300' has
  been blocked by CORS policy`), `TenantModuleService.loadModules()` always fails into its `catchError`
  branch, `hasModule()` is permanently false, and since every single nav item in `sidebar.html` is gated on
  `hasModulePermission(module, permission)` (`hasModule(...) && hasPermission(...)`), **the entire
  navigation sidebar renders completely empty for every user**, immediately after a successful login.
  Verified end-to-end with a real Playwright test (`dev/testing/playwright/tests/auth/nav-visibility.spec.ts`,
  currently marked `test.fail()` so the suite stays green until this is fixed).
- **The login form gets permanently stuck after any failed login attempt.** After a wrong
  password/username, `Login.login()`'s error handler runs correctly and updates component state exactly
  as coded (`loading` becomes `false`, `errorMessage` is set to the right text) — confirmed directly by
  reading the component's live internal state via Angular DevTools' `ng.getComponent()` API, not just
  inferring it from the DOM. But **the view never re-renders**: the submit button and both inputs stay
  `disabled` indefinitely (confirmed by polling for up to 30s with no change), and the `.login-error`
  message never becomes visible, even though the underlying `errorMessage` string is genuinely set. The
  user cannot retry logging in without a full page reload. Root cause not yet identified (a Zone.js /
  change-detection scheduling gap is the leading suspect, but unconfirmed). Verified via
  `dev/testing/playwright/tests/auth/login-invalid.spec.ts` (currently marked `test.fail()`).
- **`SUPER_ADMIN`'s `PLATFORM_*` permissions silently disappeared from the database during ordinary app
  usage this session — a live data-integrity bug, not a seed-time issue.** A fresh login as `superadmin`
  right after `hms-jar` booted returned a JWT with 82 permissions including all 10 `PLATFORM_*` ones
  (confirmed by decoding the JWT directly). After exercising the app normally through Playwright for a
  while (no server restart), the same account's JWT dropped to 66 permissions with **zero** `PLATFORM_*`
  ones — confirmed independently with a direct `role_permissions` query against Postgres, which shows
  `SUPER_ADMIN` and `ADMIN` now have an *identical* 66-permission set. Since `platform.guard.ts` requires
  at least one `PLATFORM_*` permission, `SUPER_ADMIN` can no longer reach `/platform/dashboard` at all —
  `login.ts` still correctly decides to redirect there, but the guard immediately bounces back to
  `/dashboard`. The trigger wasn't isolated (many login attempts and protected-route requests were made in
  between); this needs a focused investigation, not a guess. Verified via
  `dev/testing/playwright/tests/auth/login-valid.spec.ts`'s platform-admin-redirect test (currently marked
  `test.fail()`).

## Medium priority

- **`entity/BillingPayment.java` is a dead, empty (0-byte) file** — no `@Entity`, no class body, referenced
  nowhere. `PaymentTransaction` fully covers its intended role. Should be deleted.
- **`ReceiptController`, `SystemPreferencesController`, and `TenantModuleController` have no
  `@PreAuthorize` at all** — reachable by any authenticated user of any role, unlike every other
  controller in the app.
- **`ModuleAccessFilter` silently skips module gating for `/api/audit-logs`, `/api/users`,
  `/api/receipts`, and `/api/tenant/modules`** — these paths aren't in the filter's route map or its
  explicit skip list, so `resolve(path)` returns `null` and the check is a no-op.
- **`PlanService`, `PlatformModuleService`, and `SubscriptionService` are concrete classes with no
  interface**, unlike every other service in the codebase (interface + `XxxServiceImpl` pattern).
- **DTO usage is inconsistent across the core domain**: only 4 of ~15 core controllers
  (`Appointment`, `Consultation`, `Billing`, `Dashboard`) use dedicated request/response DTOs; the rest
  bind the JPA entity directly as the request/response body. `PatientRequest`/`PatientResponse` and
  `DoctorRequest` exist in `dto/` but are dead code — their controllers bind the entity directly instead.
- **No frontend global 401 handler.** 8 platform components each independently check
  `error.status === 401` and just show a message, without calling `logout()` or navigating to `/login`.
- **`permissionGuard` logs verbose debug info to the browser console on every route check**,
  unconditionally — no dev/prod gate.
- **No CI pipeline** builds, tests, or lints the project on push/PR.
- **No `application-{profile}.properties` files** — dev/staging/prod share one config file with
  hardcoded, plaintext secrets.

## Low priority / worth tracking

- **No backend automated tests beyond the default Spring Boot context-load smoke test** per module —
  zero coverage for 25 services, 26 controllers, 24 repositories. See [TESTING_STATUS.md](./TESTING_STATUS.md).
- **No tests for frontend `core/`** (auth service, guards, interceptor) despite near-complete component
  spec-file coverage elsewhere.
- Several entities use a plain `status` string instead of an enum (`Appointment`, `Department`, `Doctor`,
  `Inventory`, `Patient`, `LaboratoryRequest`, `PharmacyPrescription`), inconsistent with entities that do
  use real enums (`Admission`, `Billing`, `Consultation`).
- `LaboratoryRequest.testId` references `LaboratoryTest` only as a plain `Long`, with no foreign key —
  referential integrity between the two is enforced only by application code.
- `AdmissionController`'s DELETE and generic status-PATCH both reuse `ADMISSION_UPDATE`; there is no
  dedicated `ADMISSION_DELETE` permission. Similarly, `PharmacyPrescriptionController`'s DELETE reuses
  `PHARMACY_PRESCRIPTION_UPDATE`.
- Seeded RBAC test accounts (`test_doctor`/`doctor123`, `admin`/`admin123`, `superadmin`/`superadmin123`,
  etc.) have hardcoded passwords that are never rotated — fine for local dev, a real risk if this
  initializer ever runs against a production database.

## Resolved

- **`ConsultationController` allowed any CORS origin** (`@CrossOrigin(origins = "*")`, inconsistent with
  the rest of the API's `http://localhost:4200`-only policy). Resolved by the hms-jar/hms-webb pom
  migration, which removed CORS entirely from `hms-jar` (not just this one annotation) — see
  [SECURITY.md](./SECURITY.md).
- **Stray build artifacts at the repository root** (`index.html`, `main-V6MMLPDK.js`,
  `styles-4KNJEDFK.css`) — deleted as part of the same migration's cleanup.
- **`AUDIT_LOG_VIEW` permission was never seeded**, making `/api/audit-logs` unreachable by any role.
  Fixed by adding it to `RbacDataInitializer`'s permission definitions (`SUPER_ADMIN` and `ADMIN` get it
  automatically, same as every other permission). Live-verified: `admin` now gets `200` from
  `GET /api/audit-logs` (previously `403`).
- **Every unnamed primitive/enum `@RequestParam` threw `500` at runtime** (`IllegalArgumentException:
  Name for argument ... not specified ... compiler uses the '-parameters' flag`) — this was a systemic
  gap, not isolated to one controller: `AuditLogController` (`page`/`size`), `PlatformUserController`
  (`enabled`), `PlanController` (`value`), `SubscriptionController` (`value`), `InventoryController`
  (`quantity`), `AdmissionController` (`status`, `ward`), `UserController` (`enabled`),
  `BillingController`, `ReceiptController`, `ReportController` all had at least one occurrence. Most of
  these were never actually exercised (no automated tests, and several were behind the
  now-also-just-fixed `AUDIT_LOG_VIEW` gap or otherwise rarely called), so the bug sat latent. Fixed at
  the root — added `<parameters>true</parameters>` to `hms-jar`'s `maven-compiler-plugin` config instead
  of patching each occurrence individually. Live-verified on 3 previously-broken endpoints
  (`GET /api/audit-logs`, `PATCH /api/platform/users/{id}/status`, `PATCH /api/platform/plans/{id}/active`)
  — all now return `200`.

---

## Next Steps (Roadmap Ideas, Not a Committed Plan)

None of the items below are currently scheduled work — they're generic project-maturity checkpoints worth
revisiting once the higher-priority items above are addressed, in roughly this order:

1. **Add a global exception handler** wired to the existing (currently dead) `ErrorResponse` shape.
2. **Decide whether audit logging should cover more than pharmacy** — the permission gate is fixed, but
   write coverage is still one feature deep.
3. **Add automated backend tests** for the highest-risk services first (billing, pharmacy dispense,
   multi-tenancy/module gating) — see [TESTING_STATUS.md](./TESTING_STATUS.md) for why this is step 3,
   not step 0. This would also have caught the `-parameters` gap far earlier than a manual audit did.
4. **Security audit** — move secrets out of version control, decide on `application-{profile}` separation.
5. **Performance work** — none of this has been measured yet; premature to prioritize specific
   optimizations before there's a workload to profile.
6. **CI pipeline** and **deployment documentation**.

## Related Documentation

- [SECURITY.md](./SECURITY.md) — the CORS design (resolved), RBAC, tenant isolation
- [OPERATIONS.md](./OPERATIONS.md) — the intended (unimplemented) error-handling shape, CI status
- [TESTING_STATUS.md](./TESTING_STATUS.md) — why "add tests" isn't step 0
- [STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md) — overall project status
