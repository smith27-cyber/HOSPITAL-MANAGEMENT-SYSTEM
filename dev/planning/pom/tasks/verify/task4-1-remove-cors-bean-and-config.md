# Task: Remove the global CORS bean and registration

**Phase:** [Phase 4 — Remove CORS from hms-jar entirely](../../phases/phase-4-remove-cors.md)
**Depends on:** Phase 2 (same-origin proxying must exist first)
**Status:** Done

In `hms-pom/hms-jar/src/main/java/com/hms/backend/config/SecurityConfig.java`:

- Remove `.cors(cors -> cors.configurationSource(corsConfigurationSource()))` from the filter chain.
- Remove the `corsConfigurationSource()` `@Bean` method entirely.
- Remove now-unused imports: `CorsConfiguration`, `CorsConfigurationSource`,
  `UrlBasedCorsConfigurationSource`.

**Do not touch** `.csrf(disable)`, `.sessionManagement(STATELESS)`, the JWT/tenant/module filter
registrations, or any `authorizeHttpRequests` rule other than the Angular-route whitelist (removed in the
next task) — those are unrelated to CORS.
