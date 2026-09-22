# Task: Update Angular's build `outputPath`

**Phase:** [Phase 5 — Wire the Angular build into hms-webb](../../phases/phase-5-wire-angular-output.md)
**Depends on:** Phase 2 (hms-webb's directory structure must exist)
**Status:** Done

In `hms-pom/hms-webb/angular/angular.json`, `architect.build.options.outputPath`, change:

```jsonc
"outputPath": {
  "base": "../hms-backend/src/main/resources/static",
  "browser": ""
}
```

to:

```jsonc
"outputPath": {
  "base": "../src/main/resources/static",
  "browser": ""
}
```

Now relative to `hms-webb/angular/`, landing at `hms-pom/hms-webb/src/main/resources/static/`. Keep the
`"browser": ""` override — required so Angular 22's `@angular/build:application` builder doesn't nest
output under a `browser/` subfolder that Spring Boot won't serve at `/` by default.
