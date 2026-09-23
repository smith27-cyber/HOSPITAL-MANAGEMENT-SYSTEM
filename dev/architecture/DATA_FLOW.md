# HMS Data Flow Patterns

**Version:** 1.1
**Last Updated:** 2026-09-23

---

## Verified flows (as-built)

Each flow below was checked directly against the real service/controller/filter code in `hms-pom/hms-jar`.

### 1. Login

```
POST /api/auth/login {username, password}  (public)
  → AuthController.login → AuthService.login (@Transactional readOnly)
     - lookup User by username (generic error if absent, same message as bad password)
     - check enabled, check tenant status not in {SUSPENDED, CANCELLED, EXPIRED}
     - verify password (BCrypt)
     - build sorted roles[] and deduplicated permissions[] (flat-mapped from all roles)
     - JwtService.generateToken(user, roles, permissions)
  ← LoginResponse{token, username, fullName, role(legacy), roles[], permissions[], tenantId?, tenantCode?, tenantName?}
```

The frontend stores the token in `sessionStorage` (`hms_token`) plus a cached user object (`hms_user`);
`auth.interceptor.ts` attaches `Authorization: Bearer <token>` to every subsequent request.

### 2. Authenticated request → tenant + module resolution

```
Request with Authorization header
  → JwtAuthenticationFilter: validate JWT, build SimpleGrantedAuthority list
      (roles → ROLE_*, permissions → raw code), set SecurityContext
  → TenantContextFilter: re-parse JWT, TenantContext.setTenantId(claim)
  → ModuleAccessFilter: resolve path → ModuleCode (hard-coded map) → skip if
      SUPER_ADMIN / unmapped path / no tenant; else PlatformModuleService.isEnabled(tenantId, module);
      403 MODULE_NOT_ENABLED if false
  → Controller @PreAuthorize("hasAuthority('X')")
  → Service: TenantContext.requireTenantId() → repository findAllByTenant_Id(...)
  → finally: TenantContext.clear()
```

### 3. Tenant provisioning → module entitlement (platform side)

```
Platform admin: POST /api/tenants  → TenantService.createTenant (forces status=TRIAL, rejects duplicate code)
                                    → (at boot, PlatformDataInitializer also runs
                                       PlatformModuleService.initializeTenantDefaults(tenant)
                                       for every EXISTING tenant — creates one TenantModule row
                                       per catalog PlatformModule, enabled=true)

Platform admin: POST /api/platform/subscriptions {tenantId, planId, status}
  → SubscriptionService.create
     - compute trial/active period dates from Plan.trialDays / billingCycle
     - set Tenant.status accordingly
     - PlatformModuleService.enableOnly(tenantId, plan.getModules())
         → for every catalog module, setTenantModule(tenantId, moduleId, enabled=<in plan's module set>)
  ⇒ tenant's actual module access is now driven by the Plan, not by the Subscription object at request time
```

Changing a subscription's status later (`PATCH .../status`) mirrors the new `SubscriptionStatus` onto
`Tenant.status` via `SubscriptionService.changeStatus`, but does **not** re-run `enableOnly` — module
access stays whatever it was last set to until a new subscription is created.

### 4. Consultation → billing sync (idempotent invoice merge)

```
POST /api/consultations/{id}/complete  → ConsultationService.completeConsultation
   (validates OPEN status, diagnosis, treatment plan, lab results reviewed if applicable)
POST /api/billing/consultation/{id}/sync → BillingService.syncConsultationInvoice(consultationId)
   - looks up existing bill for this consultation, or creates one
   - merges consultation charge + laboratory charges + pharmacy charges into billing items
     (BillingItemRepository.existsByBillingAndReferenceIdAndBillingType guards against double-adding)
   - does NOT itself complete or change consultation status
```

### 5. Billing payment → receipt

```
POST /api/billing/{id}/payment  (separate BILLING_RECORD_PAYMENT permission)
  → BillingService.recordPayment
     - creates a PaymentTransaction row (receiptNumber unique per tenant)
     - updates Billing.amountPaid / balance / status
GET /api/receipts, /api/receipts/{id}, .../billing/{billingId}, .../number/{receiptNumber}
  → ReceiptService reads PaymentTransactionRepository, maps each transaction + its Billing
    into a ReceiptResponse. Tenant resolved exclusively from TenantContext.
```

`Billing.amountPaid` is a running aggregate; `PaymentTransaction` is the individual payment-history
ledger the aggregate is built from — the two are deliberately distinct (see
[DATA_MODEL.md](./DATA_MODEL.md)).

### 6. Pharmacy dispense workflow

```
Waiting → (prepare) → Preparing → (send-to-billing) → Awaiting Payment
        → (check-payment, confirms Billing/PaymentTransaction) → Ready for Pickup
        → (dispense) → Dispensed
                     ↘ (cancel, from most states) → Cancelled
```
All four workflow-advancing PATCHes (`prepare`, `send-to-billing`, `check-payment`, `dispense`) share the
single `PHARMACY_DISPENSE` permission, distinct from `PHARMACY_PRESCRIPTION_CREATE`/`_UPDATE`/`_CANCEL`.

### 7. Audit logging (write path exists but is only wired up for one feature)

```
AuditLogService.log(action, entityType, entityId, description[, oldValue, newValue])
  - captures tenant from TenantContext, user from SecurityContextHolder,
    IP from X-Forwarded-For (fallback getRemoteAddr()), User-Agent header
  - persists an AuditLog row
GET /api/audit-logs  → requires AUDIT_LOG_VIEW (now seeded) → 200 for SUPER_ADMIN/ADMIN, but the page is
  almost always empty since write coverage below is so narrow
```

**Verified by grep**: `AuditLogService.log(...)` is only ever called from
`PharmacyPrescriptionServiceImpl` (8 call sites — create, prepare, cancel, dispense, and other status
transitions). No other service — not `Billing`, `Admission`, `Consultation`, `Patient`, `User`,
`Tenant`, or any platform service — writes an audit entry for its actions. The read side is fixed
(`AUDIT_LOG_VIEW` is seeded — see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)); the audit subsystem still
under-writes (only pharmacy events), so there's rarely anything to read back yet.

---

## Illustrative Generic Flow Diagram (Not Endpoint-Specific)

The layered request/response shape below is a generic description of how *any* request moves through
the stack and holds up fine at this level of abstraction — frontend component → service → interceptor
→ controller → service → repository → database, and back:

```
User Interaction → Angular Component → Validation → Service Layer → Auth Interceptor
   → HTTP Request (JSON) → Backend Controller → Validation → Service Layer (business logic)
   → Repository Layer → Database → HTTP Response (JSON) → Service Layer → Component → Updated View
```

## Proposed Flow Examples (Not Implemented — Contradicted By Real Code)

**None of the code shown in earlier drafts of this section exists.** They walked through a "Patient
Registration Flow," "Appointment Scheduling Flow," "Consultation & Prescription Flow," "Billing Flow,"
"Read/Query Flow," "Error Handling Flow," and "Data Transformation Flow" using a consistent fictional
pattern: a `PatientDTO`/mapper-based service layer (`patientMapper.toEntity`/`toDTO`), a global exception
handler catching `ValidationException` and returning a structured `ErrorResponse`, and DTOs for every
entity. None of this exists — verified directly:

- **No mapper classes exist anywhere** in `hms-pom/hms-jar`. Most controllers (`PatientController`,
  `DoctorController`, `DepartmentController`, `AdmissionController`, and others — see
  [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md)'s DTO Layer section) bind the JPA entity directly as
  the request/response body. Only `Appointment`, `Consultation`, `Billing`, and `Dashboard` have real
  dedicated DTOs.
- **No global exception handler exists.** No `@ControllerAdvice`/`@RestControllerAdvice`/
  `@ExceptionHandler` anywhere; `dto/ErrorResponse.java` is dead code, never constructed. Uncaught
  exceptions fall through to Spring Boot's default `/error` handler. See
  [KNOWN_ISSUES.md](./KNOWN_ISSUES.md).
- **No `ValidationException` class exists** in the codebase.

If this DTO+mapper+global-exception-handler direction is ever actually pursued, treat it as a real
design decision to make (and document as such once implemented), not something to resume building from
these old examples — they were never checked against the code they were meant to describe.

---

## Related Documentation

- [DATA_MODEL.md](./DATA_MODEL.md) — entities and relationships
- [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md) — services, repositories, DTO usage
- [API_DESIGN.md](./API_DESIGN.md) — endpoint reference
- [SECURITY.md](./SECURITY.md) — auth, RBAC, tenant isolation, module gating
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — the missing global exception handler, dead `ErrorResponse`
