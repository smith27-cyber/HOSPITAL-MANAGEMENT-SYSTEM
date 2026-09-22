# Task: Verify `ng build` output lands at the static root

**Phase:** [Phase 5 — Wire the Angular build into hms-webb](../../phases/phase-5-wire-angular-output.md)
**Depends on:** task5-1, task5-3
**Status:** Not started

From `hms-pom/hms-webb/angular/`: `ng build --configuration development`. Confirm
`hms-pom/hms-webb/src/main/resources/static/index.html` exists directly — not nested under a `browser/`
subfolder.
