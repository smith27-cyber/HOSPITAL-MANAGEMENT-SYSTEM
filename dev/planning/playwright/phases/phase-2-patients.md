# Phase 2 — Patients Module

**Plan:** [playwright-plan.md](../playwright-plan.md)
**Depends on:** [Phase 0](./phase-0-foundation.md), [Phase 1](./phase-1-auth-and-shell.md) (auth)
**Status:** Not started

## Scope

`PatientListComponent`, `PatientFormComponent`, `PatientProfileComponent`.
Routes: `/patients`, `/patients/register`, `/patients/:id`,
`/patients/:id/edit`. Fields: Name, Email, Phone, DOB, Gender, Address,
Medical History, Emergency Contact.

## Test Scenarios

### List
- [ ] Loads and displays existing patients (seed at least one via API
      fixture per Phase 0's data strategy).
- [ ] Search/filter narrows the list correctly; clearing the search
      restores the full list.
- [ ] Pagination — if more patients exist than one page, page controls
      work and show correct records.
- [ ] Action buttons (edit, view, delete) are present and navigate/act
      correctly from the list.

### Register
- [ ] Valid submission creates a patient, confirm redirect (to list? to
      the new profile? — confirm actual behavior) and that the new record
      appears where expected.
- [ ] Required-field validation — submitting with missing required fields
      shows errors and does not submit.
- [ ] Format validation — invalid email format, invalid/future date of
      birth, etc. rejected with a visible message (confirm what's
      actually validated client-side vs. only server-side).
- [ ] Duplicate handling — creating a patient with an email that already
      exists (if that's a real constraint — `API_DESIGN.md` documents
      "Email already exists" as a 400 case) shows the error to the user.

### Profile / View
- [ ] All patient details render correctly.
- [ ] Related appointments and related consultations show up (this is
      the module's specific cross-reference feature — don't skip it).
- [ ] Navigating from a related appointment/consultation link lands on
      the correct record.

### Edit
- [ ] Loads existing values pre-filled.
- [ ] Saves changes and they're reflected on the profile view afterward.
- [ ] Same validation rules as Register apply here too.

### Delete
- [ ] Deleting a patient (if exposed in the UI, per the list's action
      buttons) removes it from the list and confirms/warns before
      deleting (check for a confirmation dialog — don't assume one
      exists or doesn't).
