# Task: Test: patient registration — valid, validation, duplicates

**Phase:** [Phase 2 — Patients Module](../../phases/phase-2-patients.md)
**Depends on:** [task-2-1-list](./task-2-1-list.md)
**Status:** Not started

- Valid submission creates a patient; confirm redirect (to list? to the
  new profile? — confirm actual behavior) and that the new record
  appears where expected.
- Required-field validation — submitting with missing required fields
  shows errors and does not submit.
- Format validation — invalid email format, invalid/future date of
  birth, etc. rejected with a visible message (confirm what's actually
  validated client-side vs. only server-side).
- Duplicate handling — creating a patient with an email that already
  exists (`API_DESIGN.md` documents "Email already exists" as a 400
  case) shows the error to the user.
