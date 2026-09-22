# HMS Data Flow — As-Built

**Last Updated:** 2026-09-23

## 1. Login

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

## 2. Authenticated request → tenant + module resolution

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

## 3. Tenant provisioning → module entitlement (platform side)

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

## 4. Consultation → billing sync (idempotent invoice merge)

```
POST /api/consultations/{id}/complete  → ConsultationService.completeConsultation
   (validates OPEN status, diagnosis, treatment plan, lab results reviewed if applicable)
POST /api/billing/consultation/{id}/sync → BillingService.syncConsultationInvoice(consultationId)
   - looks up existing bill for this consultation, or creates one
   - merges consultation charge + laboratory charges + pharmacy charges into billing items
     (BillingItemRepository.existsByBillingAndReferenceIdAndBillingType guards against double-adding)
   - does NOT itself complete or change consultation status
```

## 5. Billing payment → receipt

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

## 6. Pharmacy dispense workflow

```
Waiting → (prepare) → Preparing → (send-to-billing) → Awaiting Payment
        → (check-payment, confirms Billing/PaymentTransaction) → Ready for Pickup
        → (dispense) → Dispensed
                     ↘ (cancel, from most states) → Cancelled
```
All four workflow-advancing PATCHes (`prepare`, `send-to-billing`, `check-payment`, `dispense`) share the
single `PHARMACY_DISPENSE` permission, distinct from `PHARMACY_PRESCRIPTION_CREATE`/`_UPDATE`/`_CANCEL`.

## 7. Audit logging (write path exists but is only wired up for one feature; read path is unreachable)

```
AuditLogService.log(action, entityType, entityId, description[, oldValue, newValue])
  - captures tenant from TenantContext, user from SecurityContextHolder,
    IP from X-Forwarded-For (fallback getRemoteAddr()), User-Agent header
  - persists an AuditLog row
GET /api/audit-logs  → requires AUDIT_LOG_VIEW, which is never seeded → always 403, no role can read this data back
```

**Verified by grep**: `AuditLogService.log(...)` is only ever called from
`PharmacyPrescriptionServiceImpl` (8 call sites — create, prepare, cancel, dispense, and other status
transitions). No other service — not `Billing`, `Admission`, `Consultation`, `Patient`, `User`,
`Tenant`, or any platform service — writes an audit entry for its actions. Combined with the
`AUDIT_LOG_VIEW` gap, the audit subsystem currently both under-writes (only pharmacy events) and
cannot be read back by anyone. See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md).
