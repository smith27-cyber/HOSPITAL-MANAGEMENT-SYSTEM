# Task: Resolve CORS strategy between `hms-jar` and `hms-webb`

**Phase:** [Phase 4 — Cross-cutting config decisions](../phases/phase-4-cross-cutting-config.md)
**Depends on:** [phase4-task1-choose-port](./phase4-task1-choose-port.md)
**Status:** Not started — a decision, not a code change

`hms-jar`'s controllers are already inconsistent about CORS, independent
of this migration:
- `AppointmentController`, `UserController`: `@CrossOrigin(origins = "http://localhost:4200")`
- `ConsultationController`: `@CrossOrigin(origins = "*")`
- `BillingController`: custom config — needs checking directly

Once `hms-webb` serves the built app on its own origin, decide between:
1. **Reverse proxy** — put both modules behind one origin in production,
   so no CORS is needed at all.
2. **Keep CORS, add the new origin everywhere** — but do it consistently
   this time, fixing the existing `*` vs. fixed-origin split rather than
   adding a third inconsistent pattern on top.

This decision should be made once, then applied uniformly — not decided
per-controller as it evidently was before.
