# Task: Test: cross-reference integrity on delete/reassign

**Phase:** [Phase 3 — Doctors & Departments](../../phases/phase-3-doctors-departments.md)
**Depends on:** [task-3-2-doctors](./task-3-2-doctors.md)
**Status:** Not started

Deleting or reassigning shouldn't silently orphan references — confirm
actual behavior. If this surfaces a real gap rather than a working
feature, fix it (per the top-level plan's scope), don't just log
it.
