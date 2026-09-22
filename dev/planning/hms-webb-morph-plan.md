# Plan: Morphing `hms-webb` into a Real Frontend Module

**Status:** Planning — nothing below has been implemented
**Design reference:** [architecture/future/POM_STRUCTURE.md](../architecture/future/POM_STRUCTURE.md)
**Branch:** `architecture/gsn-creating-a-new-pom-structure`

This is the step-by-step breakdown for turning `hms-webb` from an empty
`packaging: pom` container into a running Spring Boot module that serves
the Angular build directly, per the target design. Each phase is a
checkpoint — nothing here should be done in one uninterrupted pass without
confirming along the way. Phases are broken out into their own files under
[`phases/`](./phases/) so progress on each can be tracked independently.

---

## Phases

1. [Scaffold the Spring Boot module](./phases/phase-1-scaffold-module.md)
2. [Wire Angular's build output directly into `static/`](./phases/phase-2-angular-output-wiring.md)
3. [Retire the stale manual copy in `hms-jar`](./phases/phase-3-retire-stale-copy.md)
4. [Cross-cutting config decisions](./phases/phase-4-cross-cutting-config.md)
5. [Documentation catch-up](./phases/phase-5-documentation-catchup.md)

---

## Explicitly out of scope for this plan

- Any change to `hms-jar`'s business logic, entities, or API contracts.
- Deployment/CI wiring (this plan only covers getting the two modules
  correct locally).
