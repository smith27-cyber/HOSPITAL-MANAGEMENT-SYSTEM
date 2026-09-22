# HMS Pom Structure — Frontend Module Proposal

**Status:** Partially implemented — Phase 1, Phase 2, and Phase 3 done
(see [dev/planning/tasks/verify/](../../planning/tasks/verify/)); Phase 4
(CORS removal, dev-workflow docs) not started. **This section is not yet
"promoted" to `../old/`** — that's [phase5-task1](../../planning/tasks/todo/phase5-task1-promote-proposal-doc.md),
which explicitly waits until all of Phase 1–4 are done and verified. The
paragraphs below are patched for accuracy in the meantime, not rewritten
wholesale.
**Last Updated:** 2026-09-22

---

## Current State

`hms-pom` is a Maven multi-module parent (`hms-parent`, `packaging: pom`) with two declared modules:

```
hms-pom/
├── pom.xml            # hms-parent (packaging: pom)
├── hms-jar/           # backend — real Spring Boot module (packaging: jar)
│                        # NOW CLEAN — no static/, no AngularForwardController
│                        # (both removed, Phase 3 done); zero Angular-awareness
└── hms-webb/          # frontend — NOW A REAL SPRING BOOT MODULE (packaging: jar)
    ├── pom.xml         # spring-boot-starter-webmvc + devtools, runs on 8080
    ├── src/main/java/com/hms/webb/
    │   ├── HmsWebbApplication.java
    │   ├── config/SpaWebConfig.java        # SPA routing fallback (Phase 2, done)
    │   └── controller/WebApiForwardController.java  # Web API forwarder (Phase 2, done)
    ├── src/main/resources/static/   # `ng build` writes directly here — verified working
    └── angular/        # the Angular 22 project
        └── proxy.conf.json   # ng serve dev proxy (Phase 1, done — config only, unverified end-to-end)
```

**Hard constraint:** Angular must not be aware of anything outside
`hms-webb`. `hms-jar` carries zero Angular-awareness — no static build, no
SPA-routing/forward logic, nothing. **Satisfied** — both violations were
removed in [Phase 3](../../planning/phases/phase-3-retire-stale-copy.md)
(`git rm` on the 67-file static folder and on
`AngularForwardController.java`; `hms-jar` confirmed still compiling
cleanly, 105 source files, without them).

`hms-webb` is now a real, runnable Spring Boot module — verified booting
on port 8080, serving the real built Angular app (not a placeholder), with
working SPA-route fallback and a functioning `/api/**` forwarding layer
(confirmed to correctly attempt relaying to `hms-jar`, though a real
end-to-end response through a running `hms-jar` + Postgres hasn't been
observed in this environment — see
[phase2-task6](../../planning/tasks/todo/phase2-task6-verify-api-call.md)).

---

## Target State

```
hms-pom/
├── pom.xml            # hms-parent
├── hms-jar/           # backend Spring Boot module (API only)
└── hms-webb/          # frontend Spring Boot module (packaging: jar)
    ├── pom.xml         # spring-boot-starter-webmvc + devtools
    ├── src/main/java/com/hms/webb/HmsWebbApplication.java
    ├── src/main/resources/
    │   └── static/     # Angular's build output lands HERE directly
    └── angular/        # the Angular 22 project (unchanged location)
        └── angular.json
```

Two independent Spring Boot processes: `hms-jar` (the Backend API, port
8081) and `hms-webb` (serves the built Angular app plus its own Web API
forwarding layer, port 8080 — standard ports throughout).

### Mechanism: Angular writes directly into the module's static folder

No Maven copy step, no `frontend-maven-plugin`. Angular's own build
configuration points its output straight at
`hms-webb/src/main/resources/static/`.

Angular 22's `@angular/build:application` builder nests browser output
under a `browser/` subfolder by default (`<outputPath>/browser/index.html`).
Spring Boot needs `index.html` and assets sitting directly under
`static/`, so `angular.json` needs the object form of `outputPath` with an
empty `browser` override to skip that nesting:

```jsonc
// hms-webb/angular/angular.json — architect.build.options
"outputPath": {
  "base": "../src/main/resources/static",
  "browser": ""
}
```

With this in place, running `ng build` (or `ng build --configuration
production`) from `hms-webb/angular/` writes `index.html` and all assets
directly into `hms-webb/src/main/resources/static/`, ready for
`hms-webb`'s embedded Tomcat to serve as-is — no build plugin coordination
between Maven and npm required.

---

## Why a separate frontend Spring Boot module (not just a static folder in the backend)

- Keeps the API module (`hms-jar`) free of frontend artifacts — it should
  only ever contain what it builds and depends on.
- Lets the frontend be deployed/scaled/restarted independently of the API.
- Matches the multi-module layout already declared in the parent
  (`hms-parent` → `hms-jar`, `hms-webb`) instead of fighting it.

---

## Design Decisions

All four items below are now resolved — nothing left open. Kept under
this heading (rather than folded into the design above) so the reasoning
behind each decision stays visible, not just the conclusion.

1. **Frontend-serving code in `hms-jar` — resolved and done: `hms-jar`
   must NEVER serve static files, that is `hms-webb`'s job, full stop.**
   `hms-jar/src/main/resources/static` used to hold a manually-copied
   Angular build, and `hms-jar/.../config/AngularForwardController.java`
   used to forward Angular app routes to `index.html` (the same problem
   [phase2-task4](../../planning/tasks/verify/phase2-task4-verify-routing.md)
   solves for `hms-webb`, via `SpaWebConfig`, a `PathResourceResolver`
   rather than a hardcoded route list). Both were removed once `hms-webb`
   had its own working equivalent — sequenced for that reason, not
   because the removal itself was in question.
   See [Phase 3](../../planning/phases/phase-3-retire-stale-copy.md).
2. **CORS — resolved: blocked entirely, same mechanism in both modes.**
   `hms-jar` is the **Backend API** — all business logic and its 17
   controllers stay there, untouched (18 total Spring controllers in
   `hms-jar` today, including the one being removed per item 1 above; 17
   are the real REST API). Every Angular service calls it with
   a *relative* URL (`API_URL = '/api/departments'`, no host/port — true
   across all ~15 core services), which is already correct and needs no
   code changes. Both serving modes are proxies in front of the Backend
   API, so the browser never sees a second origin:
   - **Dev (`ng serve`):** an `angular.json` `proxyConfig` forwards
     `/api/**` to `hms-jar`.
   - **Packaged (`hms-webb`):** `hms-webb` gets its own thin **Web API** —
     not a copy of business logic, just a forwarding layer that relays
     `/api/**` to the Backend API server-side.
   From the browser's point of view, whichever server delivered the page
   *is* the API. The Backend API itself allows no cross-origin access at
   all — there's nothing to allow-list.

   `hms-jar` today has CORS configured in **two overlapping places**, not
   one: a centralized `CorsConfigurationSource` bean in `SecurityConfig`
   (registered on `/**`, currently allowing exactly `http://localhost:4200`
   — a real, active policy, not an absent default), *and* per-controller
   `@CrossOrigin` annotations that override it inconsistently —
   `ConsultationController`'s `@CrossOrigin(origins = "*")` in particular
   currently widens access beyond that global policy for its own
   endpoints. Both need removing, not just the annotations. See
   `dev/planning/tasks/verify/phase1-task7-add-ng-serve-proxy.md`,
   `dev/planning/tasks/verify/phase2-task5-add-reverse-proxy.md`, and
   `dev/planning/tasks/todo/phase4-task2-resolve-cors.md`.
3. **Port choice — resolved.** `hms-webb` runs on `8080` (Spring Boot's
   conventional default), `hms-jar` stays on `8081`, Angular dev server on
   `4200` — standard ports throughout.
4. **Dev workflow.** `ng serve` (port 4200, now proxying `/api` to
   `hms-jar` per point 2) is still the fast loop for active frontend
   development; `hms-webb` is the *production/packaged* serving path — no
   hot-reload there.

---

## Related Documentation

- See [SYSTEM_DESIGN.md](../old/SYSTEM_DESIGN.md) for overall system design
- See [BACKEND_COMPONENTS.md](../old/BACKEND_COMPONENTS.md) and [FRONTEND_COMPONENTS.md](../old/FRONTEND_COMPONENTS.md) for component breakdowns
- See [STATUS_OVERVIEW.md](../old/STATUS_OVERVIEW.md) for current status
- See [KNOWN_ISSUES.md](../old/KNOWN_ISSUES.md) for the CORS issue referenced above
