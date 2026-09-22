# Phase 9 — RBAC & Error/Validation UX (Cross-Cutting)

**Plan:** [playwright-plan.md](../playwright-plan.md)
**Depends on:** [Phase 0](./phase-0-foundation.md); benefits from Phases 1–8 existing first, since it reuses their page interactions rather than inventing new ones
**Status:** Not started

This phase doesn't add new pages to test — it re-exercises pages from
earlier phases **as different roles**, and specifically targets error
paths the "happy path" scenarios in other phases don't cover.

## Grounded in real data, not assumption

While building the earlier phases of this plan, logging in as
`test_doctor` actually returned this permission set (captured directly
from a real login response, not inferred):
`ADMISSION_VIEW, APPOINTMENT_VIEW, CONSULTATION_COMPLETE,
CONSULTATION_CREATE, CONSULTATION_UPDATE, CONSULTATION_VIEW,
DASHBOARD_VIEW, DEPARTMENT_VIEW, DOCTOR_VIEW,
LABORATORY_REQUEST_CREATE, LABORATORY_REQUEST_VIEW,
LABORATORY_RESULT_VIEW, LABORATORY_VIEW, PATIENT_VIEW,
PHARMACY_PRESCRIPTION_CANCEL, PHARMACY_PRESCRIPTION_CREATE,
PHARMACY_PRESCRIPTION_UPDATE, PHARMACY_PRESCRIPTION_VIEW,
PHARMACY_VIEW, REPORT_VIEW, SETTINGS_VIEW`.

This suite actually authenticates via `doc-testuser` (dev-login, per
[task-0-4-decide-auth-reuse](../tasks/todo/task-0-4-decide-auth-reuse.md)),
not `test_doctor` — same `DOCTOR` role, and re-verified live to return
this exact permission set, not assumed identical.

Notably **absent**: any `BILLING_*`, `INVENTORY_*`, `PATIENT_CREATE`/`UPDATE`,
`ADMISSION_CREATE`/`UPDATE`, or `SETTINGS_*_MANAGE`/`USER_MANAGE`
permission. That gives concrete, real assertions to write — e.g. "logged
in as `doc-testuser`, the Billing module's create-invoice action should be
unavailable or rejected" — instead of guessing at what each role can do.
**Capture the actual permission list for the other 7 dev-login identities
the same way** (a real login call, not inference from the role name)
before writing their comparison tests.

## Test Scenarios

### Per-role nav/UI visibility
- [ ] For each of the 8 seeded roles, log in and record which nav items
      are visible/hidden, and which action buttons (create/edit/delete)
      are present/absent on each module's list page. Compare against that
      role's actual captured permission set — a visible "Create Invoice"
      button for a role without any `BILLING_*` permission is a bug,
      not a variant.

### Backend enforcement, not just UI hiding
- [ ] For at least one case per role, confirm the restriction is enforced
      **server-side**, not just hidden in the UI — e.g. as `doc-testuser`,
      attempt the billing-create action directly (bypassing the hidden
      button, e.g. via direct navigation to `/billing/register` or a
      crafted request) and confirm it's actually rejected (403), not just
      invisible. A hidden button with an unprotected endpoint behind it is
      a real security gap this suite should be able to catch.

### Form validation UX (cross-module patterns, not per-module repeats)
- [ ] Required-field indicators are visually consistent across modules
      (spot-check 3–4 modules, don't repeat this in every phase).
- [ ] Server-side validation errors surfaced by the API (e.g. the
      documented 400 "Email already exists," 409 "Doctor is not available
      at this time") are displayed to the user somewhere sensible, not
      swallowed or shown as a generic error.

### Network/API error handling
- [ ] Simulate a backend error (e.g. via Playwright's route interception,
      returning a 500 for one request) and confirm the UI shows a
      reasonable error state rather than an infinite spinner or a blank
      screen.
- [ ] Simulate a 401 (expired/invalid token) mid-session and confirm the
      user is redirected to login rather than stuck on a broken page.

### Known gap this phase will surface — and fix, per this plan's scope
- [ ] Per `KNOWN_ISSUES.md` (P1), there's no global exception handler in
      `hms-jar` — unhandled backend exceptions return Spring Boot's
      default error shape, not the documented
      `{"timestamp","status","error","message","path"}` contract. Any
      test here that hits an unhandled error path should assert what
      **actually** comes back, and confirm whether the frontend's error
      handling was built assuming the documented (but unimplemented)
      shape. If it was — meaning real users see broken/inconsistent error
      handling today — implementing the actual
      `@ExceptionHandler`/`@ControllerAdvice` in `hms-jar` is in scope
      here too, closing out `KNOWN_ISSUES.md` (P1) rather than leaving it
      as a permanently-documented gap.
