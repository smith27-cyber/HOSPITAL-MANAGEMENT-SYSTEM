# Task: Gitignore `hms-webb`'s generated static output

**Phase:** [Phase 3 — Retire the stale manual copy in `hms-jar`](../../phases/phase-3-retire-stale-copy.md)
**Depends on:** [phase2-task2-verify-build-output](./phase2-task2-verify-build-output.md)
**Status:** Done — done early (out of phase order), during Phase 2, once
`ng build` actually generated ~188 files there and leaving them untracked
was an immediate accidental-commit risk, not something worth waiting on.
Added `hms-pom/hms-webb/src/main/resources/static/` to `.gitignore`;
verified with `git check-ignore -v` that the generated files are now
correctly ignored. No `.gitkeep` placeholder added — `ng build` creates
the directory on demand, matching the existing precedent for
`hms-webb/angular/dist/` (also no placeholder).
