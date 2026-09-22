# Plan: Morphing `hms-webb` into a Real Frontend Module

**Status:** All 5 phases done, except two live verifications blocked on
Docker/Postgres access not being available in this environment
(`phase2-task6`, `phase4-task2`'s CORS check — see
[KNOWN_ISSUES.md](../architecture/old/KNOWN_ISSUES.md) P2). Original
design proposal has been implemented and promoted into
`architecture/old/` — see
[architecture/old/WEBB_MODULE.md](../architecture/old/WEBB_MODULE.md).
**Branch:** `architecture/gsn-creating-a-new-pom-structure`

This is the step-by-step breakdown for turning `hms-webb` from an empty
`packaging: pom` container into a running Spring Boot module that serves
the Angular build directly, per the target design. Each phase is a
checkpoint — nothing here should be done in one uninterrupted pass without
confirming along the way. Phases are broken out into their own files under
[`phases/`](./phases/) so progress on each can be tracked independently.

## Hard constraint

**Angular must not be aware of anything outside `hms-webb`.** `hms-jar`
carries zero Angular-awareness — no static build, no SPA-routing/forward
logic, nothing. Everything frontend-serving-related lives solely in
`hms-webb`. This was violated as of 2026-09-22:
`hms-jar/src/main/java/com/hms/backend/config/AngularForwardController.java`
forwards Angular app routes to `/index.html` — that responsibility (and
the static build it implies) must move to `hms-webb` entirely, not stay in
or be shared with `hms-jar`. See [Phase 3](./phases/phase-3-retire-stale-copy.md).

---

## Phases

1. [Scaffold the Spring Boot module](./phases/phase-1-scaffold-module.md) — Done
2. [Wire Angular's build output directly into `static/`](./phases/phase-2-angular-output-wiring.md) — Done (except one blocked live check)
3. [Retire all frontend-serving code from `hms-jar`](./phases/phase-3-retire-stale-copy.md) — Done
4. [Cross-cutting config decisions](./phases/phase-4-cross-cutting-config.md) — Done (except one blocked live check)
5. [Documentation catch-up](./phases/phase-5-documentation-catchup.md) — Done

---

## Explicitly out of scope for this plan

- Any change to `hms-jar`'s business logic, entities, or API contracts.
- Deployment/CI wiring (this plan only covers getting the two modules
  correct locally).
