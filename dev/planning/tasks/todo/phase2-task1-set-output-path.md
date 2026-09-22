# Task: Set Angular's `outputPath` to write into `static/`

**Phase:** [Phase 2 — Wire Angular's build output directly into `static/`](../../phases/phase-2-angular-output-wiring.md)
**Depends on:** [phase1-task6-verify-boot](../verify/phase1-task6-verify-boot.md)
**Status:** Not started

Edit `hms-webb/angular/angular.json`,
`architect.build.options.outputPath`:

```jsonc
"outputPath": {
  "base": "../src/main/resources/static",
  "browser": ""
}
```

The empty `browser` override is required — without it, Angular's
`@angular/build:application` builder nests output under `<base>/browser/`,
which Spring Boot won't serve at `/` by default.
