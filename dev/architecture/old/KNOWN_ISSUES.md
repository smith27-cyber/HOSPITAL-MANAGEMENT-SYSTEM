# HMS Known Issues — As-Built

**Last Updated:** 2026-09-23

All items below were verified directly against source on branch `paul`, not inferred from other
documentation.

## High priority

- **`AUDIT_LOG_VIEW` permission is never seeded.** `AuditLogController` requires it on every endpoint;
  neither `RbacDataInitializer` nor `PlatformPermissionInitializer` creates it (they create a
  differently-named `PLATFORM_AUDIT_VIEW`, which nothing checks). Result: `/api/audit-logs` is
  unreachable by any role, including SUPER_ADMIN. See [SECURITY.md](./SECURITY.md).
- **Audit logging write coverage is effectively limited to pharmacy.** `AuditLogService.log(...)` is only
  called from `PharmacyPrescriptionServiceImpl` (verified by grep, 8 call sites). No other domain
  (billing, admissions, consultations, patients, users, tenant/platform actions) writes an audit entry,
  despite the entity/infrastructure existing for all of them.
- **No global exception handling.** No `@ControllerAdvice`/`@RestControllerAdvice`/`@ExceptionHandler`
  exists anywhere in the backend (confirmed by exhaustive grep). `dto/ErrorResponse.java` is fully dead
  code — built with Lombok `@Builder`, static factories, `@JsonInclude(NON_NULL)`, but never constructed.
  Only `LaboratoryRequestController` manually catches exceptions inline; every other controller lets
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
  every other service uses. These will silently break in any environment where the backend isn't at that
  exact host/port, while the rest of the app keeps working.

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
  A user with an expired token has to notice the message and manually log out.
- **`permissionGuard` logs verbose debug info to the browser console on every route check**,
  unconditionally — no dev/prod gate.
- **No CI pipeline** builds, tests, or lints the project on push/PR (see [OPERATIONS.md](./OPERATIONS.md)).
- **No `application-{profile}.properties` files** — dev/staging/prod share one config file with
  hardcoded, plaintext secrets.

## Low priority / worth tracking

- **No backend automated tests beyond the default Spring Boot context-load smoke test** — zero coverage
  for 25 services, 27 controllers, 24 repositories. See [TESTING_STATUS.md](./TESTING_STATUS.md).
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
  `styles-4KNJEDFK.css`, different content hashes than anything actually served) — deleted as part of the
  same migration's cleanup.

## Not an issue, but worth documenting clearly

- `dev/architecture/20260922/` and this directory (`dev/architecture/old/`) describe two different
  branches' code and will disagree with each other on entity/service/controller counts — see
  [README.md](./README.md) and [WEBB_MODULE.md](./WEBB_MODULE.md) for why.
