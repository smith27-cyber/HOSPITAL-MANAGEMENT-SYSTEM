# Task: Block CORS on `hms-jar` entirely — no cross-origin API access

**Phase:** [Phase 4 — Cross-cutting config decisions](../../phases/phase-4-cross-cutting-config.md)
**Depends on:** [phase1-task7-add-ng-serve-proxy](./phase1-task7-add-ng-serve-proxy.md), [phase2-task5-add-reverse-proxy](./phase2-task5-add-reverse-proxy.md)
**Status:** Done, except live verification (blocked — see below)

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

- **Done:** removed the global `corsConfigurationSource()` bean and its
  `.cors(...)` registration from `SecurityConfig`, plus the three now-unused
  imports (`CorsConfiguration`, `CorsConfigurationSource`,
  `UrlBasedCorsConfigurationSource`; `java.util.List` too, only used inside
  that bean).
- **Done:** removed all 15 redundant per-controller `@CrossOrigin`
  annotations and `ConsultationController`'s wildcard (verified with a
  repo-wide `grep -rn "CrossOrigin"` — zero remaining).
- **Bonus find while in `SecurityConfig`:** `authorizeHttpRequests` also
  had a hardcoded `permitAll()` whitelist of Angular routes
  (`/patients/**`, `/dashboard`, etc. — the same list
  `AngularForwardController` used), now dead code since Phase 3 removed
  the static folder and forwarding controller it existed to support. This
  was itself a hard-constraint violation (Angular-awareness in `hms-jar`)
  that Phase 3 hadn't caught — removed it too.
- **Verified:** `hms-jar` still compiles cleanly (105 source files, `BUILD
  SUCCESS`) with all of the above removed.
- **Blocked:** the "confirm with a real cross-origin request" step —
  `hms-jar` cannot even boot in this environment. Tried
  `mvn spring-boot:run`: Hibernate fails immediately
  (`Unable to determine Dialect without JDBC metadata`) because there's no
  Postgres to connect to, so the app never reaches the point of starting
  Tomcat or the security filter chain. Same Docker/Postgres limitation as
  [phase1-task7](../verify/phase1-task7-add-ng-serve-proxy.md) and
  [phase2-task6](../todo/phase2-task6-verify-api-call.md). Run this check
  manually once Postgres is available: start `hms-jar`, then
  `curl -H "Origin: http://evil.example" -i http://localhost:8081/api/departments`
  and confirm the response has no `Access-Control-Allow-Origin` header.
