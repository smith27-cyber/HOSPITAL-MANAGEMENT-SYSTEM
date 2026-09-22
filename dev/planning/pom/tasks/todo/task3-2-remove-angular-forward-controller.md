# Task: Remove `AngularForwardController`

**Phase:** [Phase 3 — Retire frontend-serving code from hms-jar](../../phases/phase-3-retire-stale-frontend-code.md)
**Status:** Not started

`git rm hms-pom/hms-jar/src/main/java/com/hms/backend/config/AngularForwardController.java`.

Its SPA-fallback responsibility is replaced by `hms-webb`'s `SpaWebConfig` (Phase 2), which uses a
generic `PathResourceResolver` override instead of this class's hardcoded per-route whitelist.
