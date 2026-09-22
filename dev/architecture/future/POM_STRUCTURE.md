# HMS Pom Structure — Frontend Module Proposal

**Status:** Proposed — not yet implemented
**Last Updated:** 2026-09-22

---

## Current State

`hms-pom` is a Maven multi-module parent (`hms-parent`, `packaging: pom`) with two declared modules:

```
hms-pom/
├── pom.xml            # hms-parent (packaging: pom)
├── hms-jar/           # backend — real Spring Boot module (packaging: jar)
│   └── src/main/resources/static/   # contains a manually-copied, stale
│                                     # Angular build (not produced by any
│                                     # build step in this repo)
└── hms-webb/          # frontend — packaging: pom, EMPTY CONTAINER ONLY
    ├── pom.xml         # no dependencies, no main class, does not run
    └── angular/        # the actual Angular 22 project
        └── dist/hms-frontend/browser/   # `ng build` default output location
```

`hms-webb`'s own pom.xml states its intent directly: *"Angular is built
separately using npm and served independently. This POM organizes the
structure logically."* In practice this means:
- `hms-webb` is not a runnable Spring Boot app today.
- The Angular build (`ng build`) writes to its own `dist/` folder and isn't
  wired to anything.
- Whatever is being served as static content by the backend
  (`hms-jar/src/main/resources/static`) got there by hand, not by build
  automation.

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

Two independent Spring Boot processes: `hms-jar` (the REST API, port 8081)
and `hms-webb` (serves the built Angular app as static content, proposed
port 8082).

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

## Open Items (not yet decided)

1. **Stale static content in `hms-jar`.** `hms-jar/src/main/resources/static`
   currently holds a manually-copied Angular build. Once `hms-webb` is real
   and serving its own build, this should presumably be removed from the
   backend module — but it hasn't been touched, in case it's serving a
   purpose today (e.g. a deployed environment depends on it).
2. **CORS configuration.** `hms-jar`'s controllers currently allow
   `http://localhost:4200` (the Angular dev-server port) via
   `@CrossOrigin`. Once `hms-webb` serves the built app on its own port
   (proposed `8082`), that origin list needs revisiting — and reverse-proxy
   vs. direct-CORS between the two Spring Boot processes needs a decision.
3. **Port choice.** `8082` for `hms-webb` is a placeholder, not confirmed.
4. **Dev workflow.** During active frontend development, `ng serve` (port
   4200, proxying API calls to `:8081`) is still the fast loop; `hms-webb`
   is the *production/packaged* serving path. Worth stating explicitly so
   nobody expects hot-reload from `hms-webb` itself.

---

## Related Documentation

- See [ARCHITECTURE.md](../old/ARCHITECTURE.md) for overall system design
- See [COMPONENTS.md](../old/COMPONENTS.md) for component breakdown
- See [PROJECT_STATE.md](../old/PROJECT_STATE.md) for current status
