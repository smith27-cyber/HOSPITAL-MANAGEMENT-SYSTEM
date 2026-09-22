# Phase 4 — Cross-cutting config decisions (need answers, not just code)

**Plan:** [hms-webb-morph-plan.md](../hms-webb-morph-plan.md)
**Depends on:** [Phase 1](./phase-1-scaffold-module.md)
**Status:** Not started — these are decisions, not implementation tasks

- [ ] **Port for `hms-webb`.** Proposed `8082` in the design doc — not
      confirmed.
- [ ] **CORS.** Backend controllers are currently *inconsistent* already,
      independent of this migration:
      - `AppointmentController`, `UserController`: `@CrossOrigin(origins = "http://localhost:4200")`
      - `ConsultationController`: `@CrossOrigin(origins = "*")`
      - `BillingController`: custom config, needs checking
      Once `hms-webb` serves the built app on its own origin, decide:
      same-origin via reverse proxy (no CORS needed) vs. keeping CORS and
      adding the new origin everywhere consistently. This is a good moment
      to also fix the pre-existing `*` vs fixed-origin inconsistency, not
      just bolt on a third origin.
- [ ] **Dev workflow clarity.** `ng serve` (port 4200, fast reload) remains
      the loop for active frontend development; `hms-webb` is the
      packaged/production-like serving path. Document this explicitly so
      nobody expects hot-reload from `hms-webb` itself.
