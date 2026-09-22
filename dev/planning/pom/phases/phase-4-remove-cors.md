# Phase 4 — Remove CORS from `hms-jar` entirely

**Plan:** [../../hms-pom-migration-plan.md](../../hms-pom-migration-plan.md)
**Depends on:** Phase 2 (same-origin proxying must exist before CORS can be safely removed)
**Status:** Done

## Tasks

1. [Remove the global CORS bean and registration](../tasks/verify/task4-1-remove-cors-bean-and-config.md) — Done
2. [Remove the Angular-route `permitAll()` whitelist](../tasks/verify/task4-2-remove-permitall-angular-whitelist.md) — Done
3. [Remove `@CrossOrigin` from all controllers](../tasks/verify/task4-3-remove-crossorigin-annotations.md) — Done
4. [Document why CORS is absent](../tasks/verify/task4-4-add-cors-removed-comment.md) — Done
5. [Verify CORS is genuinely blocked](../tasks/verify/task4-5-verify-cors-blocked.md) — Done

**Explicit non-goal:** do not touch `JwtAuthenticationFilter`, `TenantContextFilter`,
`ModuleAccessFilter`, or any `@PreAuthorize` rule — none of that is CORS-related and all of it postdates
the reference branch this phase is modeled on.
