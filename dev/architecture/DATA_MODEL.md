# HMS Data Model

**Version:** 1.2
**Last Updated:** 2026-09-23

24 JPA `@Entity` classes (table-backed), 5 enums stored as entity fields but not tables of their own
conceptually distinct from the 6 status/type enums used *inside* other entities (see bottom), 1
`@Embeddable`, 1 dead empty file.

## Entity table

| Entity | Table | Tenant-scoped? | Key relationships |
|---|---|---|---|
| `AuditLog` | `audit_logs` | Yes (nullable FK) | `@ManyToOne` → `Tenant`, `User` (both nullable, LAZY) |
| `User` | `users` | Yes (nullable — null for platform SUPER_ADMIN) | `@ManyToMany` → `Role` (EAGER, join `user_roles`); `@ManyToOne` → `Tenant` |
| `Admission` | `admissions` | Yes | None (patient/doctor/department by plain string ID) |
| `Appointment` | `appointments` | Yes | None (plain string IDs) |
| `Billing` | `billing` | Yes | `@OneToMany` → `BillingItem` (cascade ALL, orphanRemoval) |
| `BillingItem` | `billing_items` | via parent | `@ManyToOne` → `Billing` |
| `Consultation` | `consultations` | Yes | None (plain string IDs; `patientName` is `@Transient`) |
| `Department` | `departments` | Yes | None |
| `Doctor` | `doctors` | Yes | None |
| `HospitalSettings` | `hospital_settings` | Yes (1:1 via unique `tenant_id`) | `@ManyToOne` → `Tenant` |
| `Inventory` | `inventory` | Yes | None |
| `LaboratoryRequest` | `laboratory_requests` | Yes | None (`testId` is a plain Long, no FK to `LaboratoryTest`) |
| `LaboratoryTest` | `laboratory_tests` | Yes | None (catalog) |
| `Patient` | `patients` | Yes | None |
| `PaymentTransaction` | `payment_transactions` | Yes | `@ManyToOne` → `Billing` |
| `Permission` | `permissions` | No (global) | Referenced by `Role.permissions` |
| `PharmacyPrescription` | `pharmacy_prescriptions` | Yes | `@ElementCollection` → `PharmacyPrescriptionItem` |
| `Role` | `roles` | No (global) | `@ManyToMany` → `Permission` (EAGER, join `role_permissions`) |
| `Plan` | `plans` | No (platform-global) | `@ManyToMany` → `PlatformModule` (join `plan_modules`) |
| `PlatformModule` | `hms_modules` | No (platform-global catalog) | Referenced by `Plan`, `TenantModule` |
| `Subscription` | `subscriptions` | Yes | `@ManyToOne` → `Tenant`, `Plan` (EAGER) |
| `TenantModule` | `tenant_modules` | Yes | `@ManyToOne` → `Tenant`, `PlatformModule` (EAGER); unique `(tenant_id, module_id)` |
| `SystemPreferences` | `system_preferences` | Yes (1:1 via unique `tenant_id`) | `@ManyToOne` → `Tenant` |
| `Tenant` | `tenants` | — (the tenant itself) | Root of all tenant-scoped FKs |

The `platform`/`tenant`/`audit` rows above (`AuditLog`, `Plan`, `PlatformModule`, `Subscription`,
`TenantModule`, `Tenant`) and `PaymentTransaction`/`SystemPreferences` are absent from earlier drafts of
this document — they postdate the branch it was originally written against.

**Not a table:** `PharmacyPrescriptionItem` (`@Embeddable`, held via `@ElementCollection` +
`@CollectionTable` on `PharmacyPrescription`, backing table `pharmacy_prescription_items`).

**Dead:** `entity/BillingPayment.java` — 0 bytes, no `@Entity`, unreferenced anywhere.

## Cross-cutting observation

Almost none of the core clinical entities (`Admission`, `Appointment`, `Consultation`, `Billing`,
`LaboratoryRequest`, `PharmacyPrescription`) use real JPA object relationships to `Patient`/`Doctor`/
`Department` — cross-references are plain `String`/`Long` IDs plus denormalized name snapshots (e.g.
`patientId` + `patientName` fields side by side). The only true object-graph relationships in the whole
schema are: every tenant-scoped entity → `Tenant`; `User` ↔ `Role` ↔ `Permission` (RBAC); `Billing` →
`BillingItem`; `PaymentTransaction` → `Billing`; `Plan`/`TenantModule` → `PlatformModule`; `Subscription`
→ `Tenant`/`Plan`; `AuditLog` → `Tenant`/`User`.

## Enums

| Enum | Values | Used by |
|---|---|---|
| `AdmissionStatus` | ADMITTED, DISCHARGED, TRANSFERRED, CANCELLED | `Admission.status` |
| `AdmissionType` | EMERGENCY, ROUTINE, REFERRAL, SURGICAL, MATERNITY, OTHER | `Admission.admissionType` |
| `WardType` | GENERAL, PRIVATE, PEDIATRIC, MATERNITY, SURGICAL, ICU, EMERGENCY, OTHER | `Admission.ward` |
| `BillingType` | CONSULTATION, LABORATORY, PHARMACY, ADMISSION, PROCEDURE, OTHER | `BillingItem.billingType` |
| `PaymentMethod` | CASH, MOBILE_MONEY, CARD, BANK_TRANSFER, INSURANCE, OTHER | `Billing.paymentMethod`, reused by `PaymentTransaction` |
| `BillingStatus` | PENDING, PARTIALLY_PAID, PAID, CANCELLED | `Billing.status` |
| `ConsultationStatus` | OPEN, PENDING_RESULTS, READY_FOR_REVIEW, COMPLETED, CANCELLED | `Consultation.status` |
| `BillingCycle` | MONTHLY, QUARTERLY, YEARLY, ONE_TIME | `Plan.billingCycle` |
| `ModuleCode` | DASHBOARD, PATIENTS, APPOINTMENTS, DOCTORS, DEPARTMENTS, CONSULTATIONS, LABORATORY, PHARMACY, ADMISSIONS, BILLING, INVENTORY, REPORTS, SETTINGS | `PlatformModule.code`, `TenantModule` (via module), `ModuleAccessFilter` route map |
| `SubscriptionStatus` | TRIAL, ACTIVE, GRACE_PERIOD, SUSPENDED, CANCELLED, EXPIRED | `Subscription.status` |
| `TenantStatus` | TRIAL, ACTIVE, GRACE_PERIOD, SUSPENDED, CANCELLED, EXPIRED (mirrors `SubscriptionStatus`) | `Tenant.status` |
| `TenantType` | CLINIC, HOSPITAL, PHARMACY, LABORATORY, MEDICAL_CENTER, OTHER | `Tenant.type` |

Several entities also use plain, un-enum-typed `status` strings (`Appointment`, `Department`, `Doctor`,
`Inventory`, `Patient`, `LaboratoryRequest`, `PharmacyPrescription`) — an inconsistency with the entities
above that do use real enums.

Full schema-level detail (indexes, unique constraints, migration strategy) is in
[DATABASE_DESIGN.md](./DATABASE_DESIGN.md).
