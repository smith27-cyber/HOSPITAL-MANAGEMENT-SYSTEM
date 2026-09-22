# Task: Block CORS on `hms-jar` entirely — no cross-origin API access

**Phase:** [Phase 4 — Cross-cutting config decisions](../../phases/phase-4-cross-cutting-config.md)
**Depends on:** [phase1-task7-add-ng-serve-proxy](../verify/phase1-task7-add-ng-serve-proxy.md), [phase2-task5-add-reverse-proxy](../verify/phase2-task5-add-reverse-proxy.md)
**Status:** Not started — **decision made**, this is now implementation

## Decision

CORS is blocked, full stop — not scoped to an allow-list, blocked
entirely. The delivering server (`ng serve` in dev, `hms-webb`'s Web API
layer when packaged) is the only thing the browser ever talks to; both
forward `/api/**` to `hms-jar`'s Backend API server-side
([phase1-task7](../verify/phase1-task7-add-ng-serve-proxy.md),
[phase2-task5](../verify/phase2-task5-add-reverse-proxy.md)). From the browser's
side, whichever server delivered the page *is* the API — there is never a
cross-origin request to the Backend API to allow.

## Current reality — more than just annotations

`SecurityConfig.java` already has an active, centralized
`CorsConfigurationSource` bean (`corsConfigurationSource()`), registered
via `.cors(cors -> cors.configurationSource(...))` on path `/**`,
currently allowing exactly `http://localhost:4200`, methods
`GET/POST/PUT/PATCH/DELETE/OPTIONS`, all headers, no credentials. This
isn't "no CORS config, default deny" — it's an existing, deliberate,
narrowly-scoped policy that needs to be **removed** (not just left alone
assuming a default), since the new design has nothing calling `hms-jar`
cross-origin at all.

**Checked all 18 controllers directly, not sampled:**
- **15 of 18** carry `@CrossOrigin(origins = "http://localhost:4200")` —
  `AdmissionController`, `AppointmentController`, `AuthController`,
  `BillingController`, `DashboardController`, `DepartmentController`,
  `DoctorController`, `HospitalSettingsController`, `InventoryController`,
  `LaboratoryRequestController`, `LaboratoryTestController`,
  `PatientController`, `PharmacyPrescriptionController`, `UserController`.
  Same origin as the global config — redundant boilerplate, not a gap.
- **1 of 18** — `ConsultationController` — has `@CrossOrigin(origins = "*")`.
  **This is the actual gap**: it actively widens access beyond the global
  policy for Consultation endpoints specifically, allowing any origin to
  reach them today, contradicting the documented `:4200`-only intent
  everywhere else.
- **2 of 18** — `HealthController`, `LoginFormController` — carry no
  `@CrossOrigin` at all, relying solely on the global bean (correctly
  minimal).

## Implementation

- Remove the global `corsConfigurationSource()` bean and its
  `.cors(...)` registration from `SecurityConfig` entirely.
- Remove all 15 redundant per-controller `@CrossOrigin` annotations and
  `ConsultationController`'s wildcard — the wildcard is the one that
  actually matters to fix (a live gap), the other 15 are just cleanup.
- Verify (don't assume) that after removal, Spring Security's default
  behavior actually denies cross-origin requests — confirm this with a
  real cross-origin request in a browser or via `curl -H "Origin:
  http://evil.example"`, not just by reading the absence of config.
