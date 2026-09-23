# HMS API Design Specification

**Version:** 1.2
**Last Updated:** 2026-09-23
**Base URL:** `http://localhost:8081` (dev, `hms-jar` directly)

---

## API Overview

All business endpoints live under `/api/**`; all except `/api/auth/**` and `/api/health` require a valid
JWT (`Authorization: Bearer <token>`). RBAC is `@PreAuthorize("hasAuthority('PERMISSION_CODE')")`,
method-level except `UserController` (class-level). Full permission catalog in [SECURITY.md](./SECURITY.md).

**No global error envelope exists.** `dto/ErrorResponse.java` is dead code — nothing constructs or
returns it. Unhandled exceptions fall through to Spring Boot's default `/error` handler instead. See
[KNOWN_ISSUES.md](./KNOWN_ISSUES.md). Swagger UI: `/swagger-ui.html`; OpenAPI JSON: `/api-docs`.

**No pagination, filtering, or versioning exists** on any endpoint despite being commonly assumed REST
conventions — see the "Proposed API Enhancements" section at the bottom of this document for what was
once drafted here as an aspirational design, none of it implemented.

---

## Core HMS domain

| Controller | Base path | Endpoints |
|---|---|---|
| `PatientController` | `/api/patients` | CRUD, `PATCH {id}/status`. Binds `Patient` entity directly. |
| `DoctorController` | `/api/doctors` | CRUD, `PATCH {id}/status`. Binds `Doctor` entity directly. |
| `DepartmentController` | `/api/departments` | list, `/active`, `{id}`, POST, PUT `{id}`, DELETE `{id}`, `PATCH {id}/status`. Binds entity directly. |
| `AppointmentController` | `/api/appointments` | CRUD, `PATCH {id}/status`, `PATCH {id}/cancel`. Uses `AppointmentRequest`/`Response` DTOs. |
| `ConsultationController` | `/api/consultations` | list/`{id}`/`patient/{id}`/`doctor/{id}`/`appointment/{id}`, POST, PUT `{id}`, `PATCH {id}/status`, `{id}/review-laboratory-results`, `{id}/complete` (separate `CONSULTATION_COMPLETE` permission), `{id}/cancel`, DELETE `{id}`. Uses `ConsultationRequest`/`Response` DTOs. |
| `AdmissionController` | `/api/admissions` | list/`{id}`/`patient/{id}`/`patient/{id}/active`/`status/{status}`/`doctor/{id}`/`department/{id}`/`ward/{ward}/active`, POST, PUT `{id}`, `PATCH {id}/status`, `{id}/discharge`, `{id}/transfer`, `{id}/cancel`, DELETE `{id}`, `GET statistics/count|active|discharged|transferred|cancelled`. Binds entity directly. DELETE reuses `ADMISSION_UPDATE` (no dedicated delete permission exists). All admission endpoints require one of `ADMISSION_VIEW`/`CREATE`/`UPDATE`/`DISCHARGE`/`TRANSFER`/`CANCEL`. |
| `PharmacyPrescriptionController` | `/api/pharmacy/prescriptions` | list/`{id}`/`patient/{id}`/`consultation/{id}`/`consultation/{id}/current`/`status/{status}`, POST, PUT `{id}`, `PATCH {id}/prepare`, `{id}/send-to-billing`, `{id}/check-payment`, `{id}/dispense` (all `PHARMACY_DISPENSE`), `{id}/cancel`, DELETE `{id}` (reuses `PHARMACY_PRESCRIPTION_UPDATE`). Binds entity directly. |
| `LaboratoryTestController` | `/api/laboratory/tests` | CRUD (catalog). Binds entity directly. |
| `LaboratoryRequestController` | `/api/laboratory/requests` | list/`{id}`/`patient/{id}`/`consultation/{id}`/`status/{status}`/`patient/{id}/completed`/`consultation/{id}/completed`, POST, PUT `{id}`, `PATCH {id}/status`, `{id}/complete`, DELETE `{id}`. Binds entity directly. Only controller with inline try/catch exception translation (400/404). |
| `BillingController` | `/api/billing` | list/`{id}`/`patient/{id}`/`patient/{id}/active`/`consultation/{id}`/`status/{status}`, POST create, `POST /patient/{id}/charge`, `POST /consultation/{id}/sync`, PUT `{id}`, DELETE `{id}`, `POST {id}/payment` (separate `BILLING_RECORD_PAYMENT` permission), `PATCH {id}/status`, `GET statistics/count|total|paid|balance`. DTOs for writes, raw entity on reads. |
| `ReceiptController` | `/api/receipts` | list, `{id}`, `billing/{billingId}`, `number/{receiptNumber}`, `date-range?startDate&endDate`. **No `@PreAuthorize`.** Returns `ReceiptResponse`. |
| `InventoryController` | `/api/inventory` | list, `{id}`, `/search?term=`, POST, PUT `{id}`, DELETE `{id}`, `PATCH {id}/status`, `PATCH {id}/quantity`. Binds entity directly. |
| `ReportController` | `/api/reports` | `GET /dashboard?startDate&endDate` (both optional). No tenant param — always resolved server-side. Returns `ReportDashboardResponse`. |
| `DashboardController` | `/api/dashboard` | `GET` only. |
| `HospitalSettingsController` | `/api/settings/hospital` | GET, PUT, `POST /reset` (requires `SETTINGS_HOSPITAL_VIEW`/`_UPDATE`). Binds entity directly. |
| `HealthController` | `/api` | `GET /health` → plain string, `permitAll()`, no auth. |

## Auth & users

| Controller | Base path | Endpoints |
|---|---|---|
| `AuthController` | `/api/auth` | `POST /login` only, public, returns `LoginResponse`. **No registration endpoint, no logout endpoint exist** — JWT is stateless; the client just discards the token. |
| `UserController` | `/api/users` | Class-level `@PreAuthorize("hasAuthority('SETTINGS_USER_MANAGE')")`. POST create, GET list/`{id}`, PUT `{id}`, `PATCH {id}/status?enabled=`, `PATCH {id}/password`, DELETE `{id}`. Uses `UserCreateRequest`/`UserUpdateRequest`/`ChangePasswordRequest`/`UserResponse` DTOs. |
| `SystemPreferencesController` | `/api/settings/system` | GET, PUT, `POST /reset`. **No `@PreAuthorize`.** Binds entity directly. |

## Platform / SaaS administration

| Controller | Base path | Endpoints |
|---|---|---|
| `TenantController` | `/api/tenants` | GET list/`{id}`, POST create, PUT `{id}`, `PATCH {id}/status`, `POST {id}/admin` (create tenant admin, always assigns role `ADMIN`). Uses tenant DTOs. |
| `PlanController` | `/api/platform/plans` | GET list, POST create, `PATCH {id}/active?value=`, `PUT {id}/modules`. Returns raw `Object`. |
| `PlatformModuleController` | `/api/platform/modules` | GET list, `GET tenant/{tenantId}`, `PUT tenant/{tenantId}/module/{moduleId}` (body `ModuleToggleRequest`). |
| `SubscriptionController` | `/api/platform/subscriptions` | list, `tenant/{tenantId}`, POST create, `PATCH {id}/status?value=`. |
| `PlatformUserController` | `/api/platform/users` | list/`{id}`, `PATCH {id}/status?enabled=`, DELETE `{id}` (both block targeting a SUPER_ADMIN). Returns `PlatformUserResponse`. |
| `TenantModuleController` | `/api/tenant/modules` | `GET` only — the caller's **own** tenant's enabled module list (used by the frontend sidebar to hide/show nav items). **No `@PreAuthorize`** — any authenticated user, any tenant. |
| `AuditLogController` | `/api/audit-logs` | GET (paged, `page`/`size`≤100), `/action/{action}`, `/entity/{entityType}`. Requires `AUDIT_LOG_VIEW` — **a permission that is never seeded**, so every endpoint here is currently unreachable by any role. Returns `Page<AuditLog>` (entity, not DTO). |

This section (`platform`/`tenant`/`audit`) did not exist in earlier drafts of this document — it's
`paul`'s own multi-tenant SaaS layer, absent from the branch this doc set was originally written for.

## CORS notes

CORS is blocked entirely — no bean, no `@CrossOrigin` on any controller (removed as part of the
`hms-jar`/`hms-webb` pom migration; `ConsultationController`'s former wildcard `@CrossOrigin(origins="*")`
is gone along with the rest). The browser only ever talks to `ng serve`'s dev proxy or `hms-webb`'s
API-forwarding layer, both of which reach `hms-jar` server-side. Full detail in
[SECURITY.md](./SECURITY.md).

---

## Proposed API Enhancements (Not Implemented)

**None of what follows exists in the codebase.** An earlier draft of this document described these as if
they were current behavior; they were never verified against the actual controllers and several are
directly contradicted by them (a `POST /api/auth/logout` endpoint, pagination on `GET /api/patients`, and
generic `{error, message, status}` response bodies were all checked directly against
`hms-pom/hms-jar` and don't exist). Kept here, clearly marked, as design ideas someone drafted for a
possible future API evolution — not a plan currently being executed, and not something to treat as a
spec to implement without deciding it's actually wanted first.

### Ideas drafted

- **Pagination envelope** on list endpoints: `?page=&size=&sort=` query params, responses shaped like
  `{content: [...], totalElements, totalPages, currentPage, size}`. Real list endpoints today return a
  plain JSON array with no query-param support at all.
- **A structured error envelope**: `{timestamp, status, error, message, path, details: [{field, message}]}`
  for validation errors. This is close to (but not identical to) the shape `dto/ErrorResponse.java`
  actually models — see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) for why that class is dead code today.
- **Filtering query params** per resource (e.g. `?department=cardiology&specialization=cardiologist` on
  doctors, `?status=scheduled&date=...` on appointments) — none of the real list endpoints accept filter
  query parameters; where filtering exists at all it's via dedicated path segments
  (`/status/{status}`, `/ward/{ward}/active`, etc.), not query strings.
- **A `POST /api/auth/logout` endpoint** returning a confirmation message — doesn't exist; nothing is
  invalidated server-side on logout today, the frontend just discards the token from `sessionStorage`.
- **URL-based API versioning** (`/api/v1`, `/api/v2`) — not used anywhere; there is exactly one,
  unversioned `/api/**` surface.
- **Rate limiting headers** (`X-RateLimit-Limit`/`-Remaining`/`-Reset`) — no rate limiting exists at any
  layer.
- **Richer response bodies** for several resources (e.g. a Doctor response including
  `departmentName`/`qualifications`, an Appointment response including denormalized
  `patientName`/`doctorName`, a Billing response including a computed `tax`/`discount` breakdown) — some
  of this denormalization *does* happen in the real entities (e.g. `Appointment.patientName` /
  `doctorName` are real fields), but the specific shapes drafted here were never checked field-by-field
  against the real DTOs/entities and shouldn't be trusted as accurate without re-verifying.

If this direction is ever picked up for real, the right first step is a fresh audit against
`BACKEND_COMPONENTS.md`'s DTO Layer section (which documents exactly which controllers use a real DTO
today vs. bind the entity directly) rather than resuming from these drafted examples as-is.

---

## Related Documentation

- See [STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md) for current status
- See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for system design
- See [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md) and [FRONTEND_COMPONENTS.md](./FRONTEND_COMPONENTS.md) for component breakdowns
- See [DATA_FLOW.md](./DATA_FLOW.md) for data flow patterns
- See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) for the error-response-format gap noted above
- See [SECURITY.md](./SECURITY.md) for authentication, RBAC, and CORS
