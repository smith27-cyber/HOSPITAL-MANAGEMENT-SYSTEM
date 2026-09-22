# Task: Remove the hardcoded Angular-route `permitAll()` whitelist

**Phase:** [Phase 4 — Remove CORS from hms-jar entirely](../../phases/phase-4-remove-cors.md)
**Depends on:** Phase 3 (AngularForwardController must already be gone)
**Status:** Done

In `SecurityConfig.java`'s `authorizeHttpRequests(...)`, remove the large `permitAll()` block listing
static assets and Angular client routes (`/`, `/index.html`, `/favicon.ico`, `/assets/**`, `*.js/.css/...`,
`/login`, `/dashboard`, `/patients/**`, ... `/platform/**`). This whitelist only existed to let
`hms-jar` serve the Angular SPA directly via `AngularForwardController`, which Phase 3 removed —
`hms-jar` no longer serves any frontend routes, so this whitelist is now dead weight (and, left in place,
would be a hard-constraint violation matching the one the reference plan found and fixed during its own
Phase 4).

Leave `/api/auth/**`, `/api/health`, `OPTIONS /**`, and `/error` `permitAll()` — those are unrelated to
Angular-route serving.
