# Plan: Full Playwright UI & User-Flow Test Suite

**Status:** Planning — nothing below has been implemented
**Replaces:** `dev/testing/playwright/tests/app.spec.ts` — the current
suite is a single smoke test that loads `/` and collects Istanbul code
coverage; it does not test any actual feature or user flow. It is not
extended by this plan, it is replaced. See [Phase 0](./phases/phase-0-foundation.md)
for what's worth keeping from it (the coverage-instrumentation tooling)
versus what's discarded (the test's content and its narrow purpose).

---

## Scope

Every one of the 13 feature modules plus authentication, covering what a
real user sees and does — not just "does the page load," but the actual
flows: search and filter a list, submit a form and see validation errors,
navigate from one record to a related one, transition a record through
its real lifecycle (schedule → complete → bill; admit → transfer →
discharge), and see different things depending on role (RBAC).

Grounded in what's actually in the codebase, not assumed:
- **13 feature modules** ([FRONTEND_COMPONENTS.md](../../architecture/FRONTEND_COMPONENTS.md)): Dashboard, Patients, Doctors, Departments, Appointments, Consultations, Admissions, Pharmacy, Laboratory, Billing, Inventory, Reports, Settings.
- **8 seeded RBAC test accounts** (`RbacDataInitializer.java`):
  `test_doctor`/`doctor123` (DOCTOR), `test_nurse`/`nurse123` (NURSE),
  `test_receptionist`/`receptionist123` (RECEPTIONIST),
  `test_pharmacist`/`pharmacist123` (PHARMACIST),
  `test_labtech`/`labtech123` (LABORATORY_TECHNICIAN),
  `test_accountant`/`accountant123` (ACCOUNTANT),
  `test_records`/`records123` (RECORDS_OFFICER),
  `test_manager`/`manager123` (HOSPITAL_MANAGER), plus `admin`/`admin123`
  (`ADMIN`) confirmed directly from `RbacDataInitializer.java` — see
  [task-0-8-confirm-admin-login](./tasks/todo/task-0-8-confirm-admin-login.md).
  `SUPER_ADMIN` exists only as a `Role` with no `User` ever created
  against it — there is no seeded `SUPER_ADMIN` login.

## Phases

Unlike the `hms-webb` migration plan, these phases are **not** strictly
sequential — only [Phase 0](./phases/phase-0-foundation.md) is a hard
dependency for everything else. Phases 1–9 can be built and run in any
order or in parallel; Phase 10 (full journeys) depends on the individual
module phases it chains together.

0. [Foundation & test infrastructure](./phases/phase-0-foundation.md) — decisions everything else depends on
1. [Authentication & app shell](./phases/phase-1-auth-and-shell.md)
2. [Patients](./phases/phase-2-patients.md)
3. [Doctors & Departments](./phases/phase-3-doctors-departments.md)
4. [Appointments & Consultations](./phases/phase-4-appointments-consultations.md)
5. [Admissions](./phases/phase-5-admissions.md)
6. [Pharmacy & Laboratory](./phases/phase-6-pharmacy-laboratory.md)
7. [Billing & Inventory](./phases/phase-7-billing-inventory.md)
8. [Reports & Settings](./phases/phase-8-reports-settings.md)
9. [RBAC & error/validation UX (cross-cutting)](./phases/phase-9-rbac-and-error-handling.md)
10. [Full user journeys (cross-module)](./phases/phase-10-full-user-journeys.md)

## Explicitly in scope: fixing what these tests find

Bugs, gaps, and doc-vs-reality mismatches these tests surface (e.g. a
role seeing an action it has no permission for, a hidden button with an
unprotected endpoint behind it, a validation error that isn't shown to
the user) get fixed as part of this plan — writing a test that finds a
real problem and then leaving the problem in place isn't the goal.

## Explicitly out of scope for this plan

- Unit/component tests (Vitest) — this is E2E/user-flow testing only.
- Load/performance testing.
- Visual regression testing (pixel-diffing) — not ruled out for later,
  just not part of this plan.
