# HMS Status Overview

**Version:** 1.2
**Last Updated:** 2026-09-23

---

## By the numbers

Every number here is traced to source in the linked docs.

| | |
|---|---|
| Backend entities (table-backed) | 24 |
| Backend repositories | 24 |
| Backend service classes | 25 (20 interface+Impl pairs, 5 concrete-only) |
| Backend controllers | 26 |
| Frontend components | 74 (73 feature/platform/layout/auth + root `App`) |
| Frontend spec files | 74 — **verified passing, 74/74, exit 0** (see [TESTING_STATUS.md](./TESTING_STATUS.md)) |
| Backend test files | 2 (default context-load smoke test per module — `hms-jar`, `hms-webb`) |
| Feature domains with full backend + frontend | 18 of 19 (all except audit) |

Earlier drafts of this document said 18 entities / 16 repositories / 16 services / 17 controllers and
listed no platform/tenant/audit layer at all — that was accurate for a different, earlier branch. The
gap has since been closed in this document.

## What's solid

- The core clinical workflow — patients, doctors, departments, appointments, consultations, pharmacy
  dispense, laboratory, admissions, billing/receipts, inventory, reporting, dashboard — is implemented
  end to end, backend and frontend, with real business logic (multi-thousand-line service
  implementations for billing and pharmacy in particular).
- The multi-tenant platform layer (tenants, plans, subscriptions, per-tenant module entitlement) is a
  complete, working subsystem with its own frontend administration UI, not just backend scaffolding.
- RBAC is broad and genuinely enforced (~60 permissions, 10 roles, `@PreAuthorize` on almost every
  endpoint) and tenant isolation, while entirely manual, is applied consistently across the domain
  repositories.
- The `hms-jar`/`hms-webb` pom restructuring is done and live-verified — two Spring Boot processes, CORS
  blocked entirely, real login/JWT/module-gating round trips confirmed. See
  [WEBB_MODULE.md](./WEBB_MODULE.md).
- The frontend test suite compiles and passes (74/74) after this reconciliation pass fixed several
  broken/fictional spec files. See [TESTING_STATUS.md](./TESTING_STATUS.md).
- `AUDIT_LOG_VIEW` is now seeded and a systemic `-parameters`-flag bug (unnamed `@RequestParam`s
  500'ing across ~10 controllers) is fixed — both live-verified. See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md).

## What's not solid

- **Audit logging is a partial scaffold, though reads are unblocked now** — writes only from one feature
  (pharmacy), no frontend at all. See [FEATURE_COMPLETENESS.md](./FEATURE_COMPLETENESS.md).
- **No automated backend test coverage** beyond a smoke test per module, despite substantial, complex
  business logic. See [TESTING_STATUS.md](./TESTING_STATUS.md).
- **No global exception handling**, plaintext secrets, and a handful of dead files/DTOs. See
  [KNOWN_ISSUES.md](./KNOWN_ISSUES.md).
- **`OLIVES-DEFAULT` tenant has zero enabled modules** — a likely initializer-ordering bug found during
  the pom migration's live verification. See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md).
- **No CI pipeline** exists to catch any of the above automatically going forward.

## Deployment readiness

| Aspect | Status | Notes |
|---|---|---|
| Security | 🟡 Partial | JWT + RBAC + tenant isolation configured; CORS blocked entirely; secrets are plaintext in `application.properties` (see [SECURITY.md](./SECURITY.md), [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)) |
| Database | 🟡 Partial | Schema Hibernate-managed (`ddl-auto=update`) — **no migrations exist**, not "migrations ready" |
| API | 🟡 Partial | RESTful endpoints operational; no pagination/versioning/rate-limiting, no global error envelope |
| Error handling | 🔴 Not implemented | No `@ExceptionHandler`/`@ControllerAdvice` anywhere; `dto/ErrorResponse.java` exists but is unused |
| Testing | 🔴 Minimal | Backend: smoke tests only. Frontend: 74/74 passing but all `should create` checks, no behavioral assertions |
| CI/CD | 🔴 None | No pipeline builds, tests, or lints on push/PR |
| Logging | 🟡 Partial | Basic Spring Boot + SQL logging, no structured logging or APM |

## Technology versions

**Backend:** Spring Boot 4.1.1, Java 21, Spring Data JPA, Spring Security, JWT (jjwt) 0.12.6, PostgreSQL,
Lombok, springdoc-openapi 2.6.0.

**Frontend:** Angular 22.1.0, TypeScript 6.0.2, RxJS 7.8.0, Angular Material 22.1.2, Chart.js 4.5.1,
Vitest (native Angular 22 test runner, not Karma).

## Where to look next

- Wiring `AuditLogService.log(...)` into more services (billing, admissions, consultations, users at
  minimum) is the next highest-leverage step now that the permission gate and reads are fixed.
- Adding a `@RestControllerAdvice` with a real `ErrorResponse` envelope would fix the exception-handling
  gap and make the already-built (but dead) `ErrorResponse` class useful.
- Backend test coverage is the largest gap between "code exists" and "code is verified to work" — start
  with the highest-risk services (billing, pharmacy dispense, multi-tenancy/module gating).

## Related Documentation

- [FEATURE_COMPLETENESS.md](./FEATURE_COMPLETENESS.md) — per-module checklist
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — open issues and next steps
- [TESTING_STATUS.md](./TESTING_STATUS.md) — actual test coverage
- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) — architecture
