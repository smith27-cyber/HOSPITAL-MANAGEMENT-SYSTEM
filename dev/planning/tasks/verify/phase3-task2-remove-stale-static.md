# Task: Remove all frontend-serving code from `hms-jar`

**Phase:** [Phase 3 — Retire all frontend-serving code from `hms-jar`](../../phases/phase-3-retire-stale-copy.md)
**Depends on:** [phase3-task1-confirm-dependency](../verify/phase3-task1-confirm-dependency.md) (policy resolved) and [phase2-task3-verify-serving](../verify/phase2-task3-verify-serving.md) (`hms-webb` must work first)
**Status:** Done — `git rm -r` on `hms-jar/src/main/resources/static/`
(67 files) and `git rm` on `AngularForwardController.java`. Confirmed no
other code referenced the controller (`grep` came back empty), and
`hms-jar` still compiles cleanly (105 source files, `BUILD SUCCESS`) with
it gone. Also confirmed `hms-jar/target/classes/static/` had no stale
compiled leftovers to worry about.

Removed from `hms-jar` — both pieces, not just the static files:

- `hms-jar/src/main/resources/static/*` (the manually-copied Angular
  build and its committed files) via `git rm`.
- `hms-jar/src/main/java/com/hms/backend/config/AngularForwardController.java`
  — its SPA-routing-fallback logic has its equivalent in `hms-webb` now
  ([phase2-task4](../verify/phase2-task4-verify-routing.md)'s
  `SpaWebConfig`, done using a `PathResourceResolver` rather than a copy
  of this file's hardcoded-route-list approach).

`hms-webb` now serves the built app — and its own routing fallback —
entirely on its own.
