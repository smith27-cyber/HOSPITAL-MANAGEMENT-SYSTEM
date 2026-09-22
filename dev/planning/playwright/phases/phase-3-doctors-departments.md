# Phase 3 — Doctors & Departments

**Plan:** [playwright-plan.md](../playwright-plan.md)
**Depends on:** [Phase 0](./phase-0-foundation.md), [Phase 1](./phase-1-auth-and-shell.md)
**Status:** Not started

Grouped together because Doctors and Departments cross-reference each
other constantly (a doctor belongs to a department; a department lists
its doctors) — testing them together makes that relationship easy to
verify in both directions.

## Scope

**Doctors:** `DoctorListComponent`, `DoctorFormComponent`,
`DoctorProfileComponent`. Routes: `/doctors`, `/doctors/register`,
`/doctors/:id`, `/doctors/:id/edit`. Fields: Name, License Number,
Specialization, Department, Contact, Qualifications.

**Departments:** `DepartmentListComponent`, `DepartmentFormComponent`,
`DepartmentProfileComponent`. Routes: `/departments`,
`/departments/register`, `/departments/:id`, `/departments/:id/edit`.
Fields: Name, Description, Head of Department, Staff Count,
Location/Floor.

## Test Scenarios

### Departments
- [ ] List loads, register creates a new one (validation on required
      fields), edit updates it.
- [ ] Department profile shows its staff (doctors) list correctly —
      register a doctor into it first (or seed via API), confirm they
      appear.

### Doctors
- [ ] List loads, search/filter works.
- [ ] Register a doctor, **specifically selecting a department from a
      dropdown/selector fed by the Departments module** — confirms the
      cross-module data dependency actually works, not just that the form
      submits.
- [ ] Required-field and format validation (e.g. license number format,
      if one is enforced).
- [ ] Doctor profile shows department name/link correctly, and following
      it lands on that department's profile.
- [ ] Edit — changing a doctor's department and confirming it's reflected
      on both the doctor's profile and the (new and old) department's
      staff list.

### Cross-reference integrity
- [ ] Deleting or reassigning shouldn't silently orphan references —
      confirm actual behavior. If this surfaces a real gap rather than a
      working feature, fix it (per the plan's scope), don't just log it.
