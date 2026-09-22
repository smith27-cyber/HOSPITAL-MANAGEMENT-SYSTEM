# Task: Decide `hms-webb`'s port

**Phase:** [Phase 4 — Cross-cutting config decisions](../phases/phase-4-cross-cutting-config.md)
**Status:** Not started — a decision, not a code change

`8082` is proposed in the design doc
([POM_STRUCTURE.md](../../architecture/future/POM_STRUCTURE.md)) but not
confirmed. Existing ports in use: `hms-jar` → `8081`, Angular dev server
(`ng serve`) → `4200`. Confirm `8082` or pick another value before
[phase1-task5](./phase1-task5-add-application-properties.md) can be
completed — that task is blocked on this one.
