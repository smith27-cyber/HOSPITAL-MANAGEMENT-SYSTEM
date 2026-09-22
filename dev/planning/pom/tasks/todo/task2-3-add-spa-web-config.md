# Task: Add `SpaWebConfig`

**Phase:** [Phase 2 — Create the hms-webb Spring Boot module](../../phases/phase-2-create-hms-webb-module.md)
**Status:** Not started

Create `hms-pom/hms-webb/src/main/java/com/hms/webb/config/SpaWebConfig.java` — overrides
`PathResourceResolver` so any request that doesn't resolve to a real static file falls back to
`classpath:/static/index.html`, letting Angular's client-side router take over. This is the standard
Spring Boot SPA-hosting pattern and works automatically for every route, present or future, unlike the
hardcoded-route-list approach `hms-jar`'s old `AngularForwardController` used (that controller is a
*reference pattern only* — do not port its route whitelist; retiring it entirely is Phase 3).

Copy from `architecture/gsn-creating-a-new-pom-structure`'s
`hms-pom/hms-webb/src/main/java/com/hms/webb/config/SpaWebConfig.java` — generic infrastructure, no
adaptation needed.

Verification once running (covered again in Phase 5): `/patients` (no such static file) → 200
`index.html`; `/favicon.ico` (a real file) → still the real file, not the fallback.
