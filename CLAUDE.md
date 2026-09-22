# Architecture Documentation - Consistency Issues & Fixes

**Last Updated:** 2026-09-22
**Status:** Resolved (see history below)

---

## History

### 2026-09-03 audit (original)
Found: Admissions module documented but not implemented, service/entity count
mismatches (13 vs 14), SettingsService documented but not implemented, User
entity undocumented, contradictory completion status between README.md and
PROJECT_STATE.md.

A same-day fix commit (`a7cb044`) applied Option A: stripped Admissions and
SettingsService references from README.md/COMPONENTS.md/PROJECT_STATE.md.

### 2026-09-05: code moved past the fix
Two days after the docs were "corrected" to say Admissions/Settings backend
don't exist, both were actually implemented (`Admission` entity/service/
controller/repository, `HospitalSettings` entity/service/controller/
repository). A separate RBAC/user-management effort also added `Role`,
`Permission`, and `UserService`/`UserController`. None of this was reflected
in the architecture docs, and PROJECT_STATE.md — never touched by the Option
A fix — still (correctly, if for the wrong reason) listed Admission and
Settings as done, while README.md/COMPONENTS.md said the opposite. The two
sets of docs contradicted each other.

### 2026-09-22 re-audit and fix (this update)
Verified actual code state and reconciled all docs to match:
- **Entities:** 18 total (17 domain + `User`), including `Admission`,
  `HospitalSettings`, `Role`, `Permission` — previously undocumented.
- **Services:** 16 total (13 domain + `AuthService`/`JwtService`/`UserService`).
- **Repositories:** 16 total.
- **Controllers:** 17 total.
- **Feature modules:** 13 (added Admissions back as a real module; Settings
  is now backend-backed for hospital settings, frontend-only for system/
  notification preferences).
- Fixed a stray port mismatch: ARCHITECTURE.md/API_DESIGN.md said base URL
  `:8080`, actual `application.properties` and README.md say `:8081`.
- Added an Admission Endpoints and Hospital Settings Endpoints section to
  API_DESIGN.md; added an Admissions Module section back to COMPONENTS.md.

**Updated:** README.md, ARCHITECTURE.md, COMPONENTS.md, PROJECT_STATE.md,
API_DESIGN.md, DATA_FLOW.md (date only).

---

## Going forward

Architecture docs drift fastest right after a "doc alignment" pass, because
that pass captures a snapshot the code then moves past within days. When
adding a new entity/service/controller (or removing one), update
`dev/architecture/old/BACKEND_COMPONENTS.md`'s counts and tables in the same change, not as
a follow-up cleanup.
