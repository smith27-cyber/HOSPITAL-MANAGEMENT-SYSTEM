# HMS Backend Components

**Version:** 1.2
**Last Updated:** 2026-09-23
**Verified by reading source directly** under `hms-pom/hms-jar/src/main/java/com/hms/backend/`.

Package root contains exactly 11 subpackages plus one top-level class
(`HmsBackendApplication.java`): **audit, auth, config, controller, dto, entity, platform, repository,
service, settings, tenant**.

## Headline counts

| | Count | Notes |
|---|---|---|
| JPA `@Entity` classes (table-backed) | **24** | Excludes 5 pure enums, 1 `@Embeddable`, 1 dead empty file |
| Repositories | **24** | One per entity, all `JpaRepository` |
| Service classes | **25** | 20 interface+Impl pairs, plus 5 concrete no-interface services |
| Controllers | **26** | All REST — `AngularForwardController` was retired in the hms-jar/hms-webb pom migration |
| Enums (entity-adjacent) | **10** | `AdmissionStatus/Type`, `WardType`, `BillingType`, `PaymentMethod`, `BillingStatus`, `ConsultationStatus`, `BillingCycle`, `ModuleCode`, `SubscriptionStatus`, `TenantStatus`, `TenantType` |

Earlier drafts of this document said 18 entities / 16 repositories / 16 services — that count was
accurate for a different, earlier branch this doc set was originally written against. The gap is one
whole subsystem this document now covers for the first time: `platform` (SaaS plans/subscriptions/module
entitlement), `tenant`, `audit`, plus `PaymentTransaction`, `ReceiptController`/`Service`,
`ReportController`/`Service`, and the backend half of `settings` (`SystemPreferences`).

---

## Configuration layer (`config/`)

3 classes:

- **`SecurityConfig`** — full filter chain, authorization rules. No CORS configuration at all (removed
  as part of the hms-jar/hms-webb pom migration — see [WEBB_MODULE.md](./WEBB_MODULE.md)). See
  [SECURITY.md](./SECURITY.md).
- **`PasswordConfig`** — single bean, `BCryptPasswordEncoder`.
- **`OpenApiConfig`** — Swagger/OpenAPI metadata. See [API_DESIGN.md](./API_DESIGN.md).

(SPA deep-linking used to be a 4th class here, `AngularForwardController` — that responsibility now
lives entirely in `hms-webb`'s `SpaWebConfig`, see [WEBB_MODULE.md](./WEBB_MODULE.md).)

## Entity layer

Full field/relationship detail in [DATA_MODEL.md](./DATA_MODEL.md). One dead file exists:
`entity/BillingPayment.java` is **0 bytes** — no class body, no `@Entity`, referenced nowhere. Its
functional role (individual payment-history rows against a `Billing`) is actually filled by
`PaymentTransaction`.

## Repository layer

All 24 extend `JpaRepository`. Every tenant-scoped repository follows the same convention:
`findAllByTenant_Id`, `findByIdAndTenant_Id`, plus domain-specific derived finders and, for reporting,
custom `@Query` projections (e.g. `BillingRepository.getReportTotals` → `ReportBillingTotals`,
`PharmacyPrescriptionRepository.getReportTotals`/`getTopMedicines` → `ReportPharmacyTotals`/`Object[]`).
Two use native SQL for sequential ID generation: `DepartmentRepository.findMaxIdForCurrentYear()`
(`DEP-<year>-%`) and `DoctorRepository.findMaxIdForCurrentYear()` (`DOC-<year>-%`).

## Service layer

Pattern is interface + `XxxServiceImpl`, **except** `platform/service/PlanService`,
`PlatformModuleService`, and `SubscriptionService`, which are concrete `@Service` classes with no
interface — an inconsistency with the rest of the codebase. `auth/service/AuthService` and `JwtService`
are also concrete-only.

Largest implementations by line count: `PharmacyPrescriptionService` (2020 lines — full dispense
workflow: Waiting → Preparing → Awaiting Payment → Ready for Pickup → Dispensed), `BillingService`
(1685 lines), `LaboratoryRequestService` (1455 lines), `AdmissionService` (1027 lines),
`ConsultationService` (1059 lines).

Business-rule highlights:
- `BillingService.syncConsultationInvoice` — idempotent: merges consultation + lab + pharmacy charges
  into one invoice per consultation without completing it.
- `ConsultationService.completeConsultation` — the only path allowed to move status to `COMPLETED`;
  `updateStatus` explicitly rejects that transition.
- `SubscriptionService.create`/`changeStatus` — computes trial/active period dates from the `Plan`, sets
  `Tenant.status` accordingly, and calls `PlatformModuleService.enableOnly(...)` — this is the mechanism
  by which a Plan's module set becomes a tenant's actual entitlements (see
  [DATA_FLOW.md](./DATA_FLOW.md)).
- `TenantService.updateTenantStatus` — hard-blocks suspending/cancelling/expiring the tenant coded
  `OLIVES-DEFAULT`.
- `ReceiptService`/`ReportService` — both resolve tenant **exclusively** from `TenantContext`, never from
  a caller-supplied parameter, by explicit design.

## Controller layer

All controllers under `controller/` are prefixed `/api/...`; RBAC is via
`@PreAuthorize("hasAuthority('X')")`, method-level except `UserController` (class-level, one permission
for every action). Full endpoint list in [API_DESIGN.md](./API_DESIGN.md).

**No `@PreAuthorize` at all** (protected only by the blanket "any authenticated user" rule):
`HealthController` (intentionally `permitAll` anyway), `ReceiptController`, `SystemPreferencesController`,
`TenantModuleController`. Any logged-in user of any role can call these three real endpoints.

## DTO layer

Inconsistently applied — most controllers bind `@RequestBody` directly to the JPA entity rather than a
DTO. Naming pattern where DTOs exist: `<Entity>Request`/`<Entity>Response`.

**Actually used:** `AppointmentRequest`/`Response`, `ConsultationRequest`/`Response`,
`BillingRequest`/`BillingItemRequest`/`PaymentRequest`, `DashboardResponse`, `ReceiptResponse`,
`ReportBillingTotals`, `ReportDashboardResponse`, `ReportPharmacyTotals` — plus all of `auth/dto/`,
`platform/dto/`, `tenant/dto/`.

**Defined but dead (nothing constructs or references them outside their own file):**
- `PatientRequest`/`PatientResponse` — `PatientController` binds the `Patient` entity directly.
- `DoctorRequest` — `DoctorController` binds the `Doctor` entity directly.
- `ErrorResponse` — see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md); there is no `@ControllerAdvice` to construct
  one.

**No DTO at all — controller binds the entity directly:** `AdmissionController`, `DepartmentController`,
`DoctorController`, `InventoryController`, `LaboratoryRequestController`, `LaboratoryTestController`,
`PatientController`, `HospitalSettingsController`, `PharmacyPrescriptionController`,
`SystemPreferencesController`.

## Related Documentation

- [DATA_MODEL.md](./DATA_MODEL.md) — entities and relationships
- [FRONTEND_COMPONENTS.md](./FRONTEND_COMPONENTS.md) — what calls these components
- [SECURITY.md](./SECURITY.md) — SecurityConfig, RBAC, tenant/module filters
- [API_DESIGN.md](./API_DESIGN.md) — full endpoint specifications
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — dead code, missing permission, CORS inconsistency
