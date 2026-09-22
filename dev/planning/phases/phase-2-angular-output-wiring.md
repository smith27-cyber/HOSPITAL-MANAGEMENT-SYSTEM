# Phase 2 — Wire Angular's build output directly into `static/`

**Plan:** [hms-webb-morph-plan.md](../hms-webb-morph-plan.md)
**Depends on:** [Phase 1](./phase-1-scaffold-module.md)
**Status:** Not started

- [ ] `hms-webb/angular/angular.json` → `architect.build.options.outputPath`:
  ```jsonc
  "outputPath": {
    "base": "../src/main/resources/static",
    "browser": ""
  }
  ```
- [ ] Run `ng build` from `hms-webb/angular/` and confirm `index.html` lands
      at `hms-webb/src/main/resources/static/index.html` (root level, **not**
      nested under a `browser/` subfolder)
- [ ] Restart `hms-webb` and confirm the built Angular app loads at
      `http://localhost:<webb-port>/`
- [ ] Confirm client-side routing works on a hard refresh of a non-root
      route (Angular's router needs a fallback to `index.html` for deep
      links — Spring Boot's default static handler does **not** do this
      automatically; likely needs an error-page/forward rule. Flag as a
      decision point if it doesn't work out of the box.)
