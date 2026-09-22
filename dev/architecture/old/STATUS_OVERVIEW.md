# HMS Status Overview — As-Built

**Last Updated:** 2026-09-23 | Branch `paul` @ `9f5abdb` (docs added at `ff68a3d`)

One-page summary. Every number here is traced to source in the linked docs — none are carried over from
`dev/architecture/20260922/` or any other prior doc.

## By the numbers

| | |
|---|---|
| Backend entities (table-backed) | 24 |
| Backend repositories | 24 |
| Backend service classes | 25 (20 interface+Impl pairs, 5 concrete-only) |
| Backend controllers | 27 |
| Frontend components | 74 (73 feature/platform/layout/auth + root `App`) |
| Frontend spec files | 74 (1:1 with components; `core/` has none) |
| Backend test files | 1 (default context-load smoke test) |
| Feature domains with full backend + frontend | 18 of 19 (all except audit) |

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

## What's not solid

- **Audit logging is a partial, currently non-functional scaffold** — writes only from one feature
  (pharmacy), reads blocked by a missing permission, no frontend at all. See
  [FEATURE_COMPLETENESS.md](./FEATURE_COMPLETENESS.md).
- **No automated backend test coverage** beyond a smoke test, despite substantial, complex business
  logic. See [TESTING_STATUS.md](./TESTING_STATUS.md).
- **No global exception handling**, several CORS/permission inconsistencies, plaintext secrets, and a
  handful of dead files/DTOs. See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md).
- **The documented `hms-jar`/`hms-webb` restructuring has not happened on this branch** — that's a
  different branch's work, mistakenly copied in as if descriptive of this one. See
  [WEBB_MODULE.md](./WEBB_MODULE.md).
- **No CI pipeline** exists to catch any of the above automatically going forward.

## Where to look next

- Fixing the audit-log permission gap and wiring `AuditLogService.log(...)` into more services is the
  single highest-leverage, most self-contained fix (touches RBAC seed data + a handful of service call
  sites).
- Adding a `@RestControllerAdvice` with a real `ErrorResponse` envelope would fix the exception-handling
  gap and make the already-built (but dead) `ErrorResponse` class useful.
- Before any further architecture-doc work, resolve which branch (`paul`, `dev`, or
  `architecture/gsn-creating-a-new-pom-structure`) is meant to become the project's actual trunk — the
  three currently disagree on both code layout and content.
