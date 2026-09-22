# Task: Verify `ng build` output lands at the static root

**Phase:** [Phase 2 — Wire Angular's build output directly into `static/`](../../phases/phase-2-angular-output-wiring.md)
**Depends on:** [phase2-task1-set-output-path](./phase2-task1-set-output-path.md)
**Status:** Not started

Run `ng build` from `hms-webb/angular/` and confirm
`hms-webb/src/main/resources/static/index.html` exists directly — **not**
`.../static/browser/index.html`. If it's nested under `browser/`, the
`outputPath` object form in
[phase2-task1](./phase2-task1-set-output-path.md) wasn't applied
correctly (check for a typo or an Angular CLI version that doesn't support
this option).
