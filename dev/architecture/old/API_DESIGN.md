# HMS API Design — As-Built

**Last Updated:** 2026-09-23

Base URL: `http://localhost:8081` (dev). All business endpoints under `/api/**`; all except
`/api/auth/**` and `/api/health` require a valid JWT (`Authorization: Bearer <token>`). RBAC is
`@PreAuthorize("hasAuthority('PERMISSION_CODE')")`, method-level except `UserController` (class-level).
Full permission catalog in [SECURITY.md](./SECURITY.md).

No global error envelope exists (`dto/ErrorResponse.java` is dead code) — see
[KNOWN_ISSUES.md](./KNOWN_ISSUES.md). Swagger UI: `/swagger-ui.html`; OpenAPI JSON: `/api-docs`.

## Core HMS domain

| Controller | Base path | Endpoints |
|---|---|---|
| `PatientController` | `/api/patients` | CRUD, `PATCH {id}/status`. Binds `Patient` entity directly. |
| `DoctorController` | `/api/doctors` | CRUD, `PATCH {id}/status`. Binds `Doctor` entity directly. |
| `DepartmentController` | `/api/departments` | list, `/active`, `{id}`, POST, PUT `{id}`, DELETE `{id}`, `PATCH {id}/status`. Binds entity directly. |
| `AppointmentController` | `/api/appointments` | CRUD, `PATCH {id}/status`, `PATCH {id}/cancel`. Uses `AppointmentRequest`/`Response` DTOs. |
| `ConsultationController` | `/api/consultations` | list/`{id}`/`patient/{id}`/`doctor/{id}`/`appointment/{id}`, POST, PUT `{id}`, `PATCH {id}/status`, `{id}/review-laboratory-results`, `{id}/complete` (separate `CONSULTATION_COMPLETE` permission), `{id}/cancel`, DELETE `{id}`. Uses `ConsultationRequest`/`Response` DTOs. **`@CrossOrigin(origins="*")`** — wildcard, unlike every other controller. |
| `AdmissionController` | `/api/admissions` | list/`{id}`/`patient/{id}`/`patient/{id}/active`/`status/{status}`/`doctor/{id}`/`department/{id}`/`ward/{ward}/active`, POST, PUT `{id}`, `PATCH {id}/status`, `{id}/discharge`, `{id}/transfer`, `{id}/cancel`, DELETE `{id}`, `GET statistics/count|active|discharged|transferred|cancelled`. Binds entity directly. DELETE reuses `ADMISSION_UPDATE` (no dedicated delete permission exists). |
| `PharmacyPrescriptionController` | `/api/pharmacy/prescriptions` | list/`{id}`/`patient/{id}`/`consultation/{id}`/`consultation/{id}/current`/`status/{status}`, POST, PUT `{id}`, `PATCH {id}/prepare`, `{id}/send-to-billing`, `{id}/check-payment`, `{id}/dispense` (all `PHARMACY_DISPENSE`), `{id}/cancel`, DELETE `{id}` (reuses `PHARMACY_PRESCRIPTION_UPDATE`). Binds entity directly. |
| `LaboratoryTestController` | `/api/laboratory/tests` | CRUD (catalog). Binds entity directly. |
| `LaboratoryRequestController` | `/api/laboratory/requests` | list/`{id}`/`patient/{id}`/`consultation/{id}`/`status/{status}`/`patient/{id}/completed`/`consultation/{id}/completed`, POST, PUT `{id}`, `PATCH {id}/status`, `{id}/complete`, DELETE `{id}`. Binds entity directly. Only controller with inline try/catch exception translation (400/404). |
| `BillingController` | `/api/billing` | list/`{id}`/`patient/{id}`/`patient/{id}/active`/`consultation/{id}`/`status/{status}`, POST create, `POST /patient/{id}/charge`, `POST /consultation/{id}/sync`, PUT `{id}`, DELETE `{id}`, `POST {id}/payment` (separate `BILLING_RECORD_PAYMENT` permission), `PATCH {id}/status`, `GET statistics/count|total|paid|balance`. DTOs for writes, raw entity on reads. |
| `ReceiptController` | `/api/receipts` | list, `{id}`, `billing/{billingId}`, `number/{receiptNumber}`, `date-range?startDate&endDate`. **No `@PreAuthorize`, no `@CrossOrigin`.** Returns `ReceiptResponse`. |
| `InventoryController` | `/api/inventory` | list, `{id}`, `/search?term=`, POST, PUT `{id}`, DELETE `{id}`, `PATCH {id}/status`, `PATCH {id}/quantity`. Binds entity directly. |
| `ReportController` | `/api/reports` | `GET /dashboard?startDate&endDate` (both optional). No tenant param — always resolved server-side. Returns `ReportDashboardResponse`. |
| `DashboardController` | `/api/dashboard` | `GET` only. |
| `HospitalSettingsController` | `/api/settings/hospital` | GET, PUT, `POST /reset`. Binds entity directly. |
| `HealthController` | `/api` | `GET /health` → plain string, `permitAll()`, no auth. |

## Auth & users

| Controller | Base path | Endpoints |
|---|---|---|
| `AuthController` | `/api/auth` | `POST /login` only, public, returns `LoginResponse`. **No registration endpoint exists.** |
| `UserController` | `/api/users` | Class-level `@PreAuthorize("hasAuthority('SETTINGS_USER_MANAGE')")`. POST create, GET list/`{id}`, PUT `{id}`, `PATCH {id}/status?enabled=`, `PATCH {id}/password`, DELETE `{id}`. Uses `UserCreateRequest`/`UserUpdateRequest`/`ChangePasswordRequest`/`UserResponse` DTOs. |
| `SystemPreferencesController` | `/api/settings/system` | GET, PUT, `POST /reset`. **No `@PreAuthorize`, no `@CrossOrigin`.** Binds entity directly. |

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

## CORS notes

Global CORS bean restricts to `http://localhost:4200`; 21 controllers redundantly repeat this via
`@CrossOrigin`. `ConsultationController` uses `@CrossOrigin(origins="*")` — effectively wide open for
`/api/consultations/**` only, inconsistent with the rest of the API. `ReceiptController` and
`SystemPreferencesController` have no `@CrossOrigin` at all (rely on the global bean only). Full detail in
[SECURITY.md](./SECURITY.md).
