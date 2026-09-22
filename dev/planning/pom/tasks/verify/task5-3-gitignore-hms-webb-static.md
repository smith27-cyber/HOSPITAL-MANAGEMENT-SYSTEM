# Task: Gitignore `hms-webb`'s generated static output

**Phase:** [Phase 5 — Wire the Angular build into hms-webb](../../phases/phase-5-wire-angular-output.md)
**Status:** Done

Add `hms-pom/hms-webb/src/main/resources/static/` to `.gitignore`. This is generated build output, not
source — matching the reference implementation's decision (it hit this the moment `ng build` started
producing ~188 files there). Do this before the first `ng build` in Phase 5's verification task, to avoid
an accidental commit.
