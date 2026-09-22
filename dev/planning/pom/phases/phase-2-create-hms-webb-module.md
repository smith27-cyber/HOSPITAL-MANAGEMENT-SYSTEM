# Phase 2 — Create the `hms-webb` Spring Boot module

**Plan:** [../../hms-pom-migration-plan.md](../../hms-pom-migration-plan.md)
**Depends on:** Phase 1
**Status:** Done

## Tasks

1. [Create `hms-webb/pom.xml`](../tasks/verify/task2-1-create-hms-webb-pom.md) — Done
2. [Add `HmsWebbApplication` main class](../tasks/verify/task2-2-add-hms-webb-application-class.md) — Done
3. [Add `SpaWebConfig`](../tasks/verify/task2-3-add-spa-web-config.md) — Done
4. [Add `WebApiForwardController`](../tasks/verify/task2-4-add-web-api-forward-controller.md) — Done
5. [Add `application.properties`](../tasks/verify/task2-5-add-hms-webb-application-properties.md) — Done

All 4 code artifacts (pom + 3 classes) can be copied near-verbatim from
`architecture/gsn-creating-a-new-pom-structure` — no adaptation needed for `paul`'s extra backend
modules, since this module has zero awareness of business logic.
