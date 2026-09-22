# Task: `hms-webb`'s port

**Phase:** [Phase 4 — Cross-cutting config decisions](../phases/phase-4-cross-cutting-config.md)
**Status:** Resolved — **`8080`**

## Decision

Standard ports throughout, per instruction:
- `hms-jar` (Backend API) → `8081` (already fixed, unchanged)
- `hms-webb` (Web API + static serving) → `8080` (Spring Boot's
  conventional default — free to use since `hms-jar` deliberately runs on
  `8081` instead)
- Angular dev server (`ng serve`) → `4200` (Angular CLI default, unchanged)

This unblocks [phase1-task5](./phase1-task5-add-application-properties.md),
which was waiting on this decision.
