# Task: Remove all frontend-serving code from `hms-jar`

**Phase:** [Phase 3 — Retire all frontend-serving code from `hms-jar`](../../phases/phase-3-retire-stale-copy.md)
**Depends on:** [phase3-task1-confirm-dependency](../verify/phase3-task1-confirm-dependency.md) (policy resolved) and [phase2-task3-verify-serving](../verify/phase2-task3-verify-serving.md) (`hms-webb` must work first)
**Status:** Not started

Remove from `hms-jar` — both pieces, not just the static files:

- `hms-jar/src/main/resources/static/*` (the manually-copied Angular
  build and its committed files) via `git rm`.
- `hms-jar/src/main/java/com/hms/backend/config/AngularForwardController.java`
  — its SPA-routing-fallback logic needs an equivalent in `hms-webb`
  (tracked separately as an open decision in
  [phase2-task4](../verify/phase2-task4-verify-routing.md), which can now use this
  file as a reference for *what* it needs to do — forward known app routes
  to `index.html` — without keeping the file itself in `hms-jar`, per the
  hard constraint that `hms-jar` carries zero Angular-awareness).

`hms-webb` now serves the built app — and its own routing fallback —
entirely on its own.
