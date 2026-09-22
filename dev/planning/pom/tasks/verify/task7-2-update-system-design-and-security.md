# Task: Update `SYSTEM_DESIGN.md` and `SECURITY.md`

**Phase:** [Phase 7 — Refresh dev/architecture/old for the new module layout](../../phases/phase-7-refresh-architecture-docs.md)
**Status:** Done

**`SYSTEM_DESIGN.md`**: currently describes a single Spring Boot process (`hms-backend`) serving both
the API and the compiled Angular bundle via `AngularForwardController`. Update to describe the real
two-process model: `hms-jar` (8081, API only, no frontend awareness) and `hms-webb` (8080, static
serving + `/api/**` forwarding via `WebApiForwardController`), plus the dev-loop alternative (`ng serve`
on 4200 proxying to `hms-jar`). Update the request-lifecycle diagram/description accordingly.

**`SECURITY.md`**: currently documents a global CORS bean restricted to `http://localhost:4200`, 21
controllers redundantly repeating `@CrossOrigin`, and `ConsultationController`'s wildcard `@CrossOrigin`
as an open issue. All of that is gone. Replace the CORS section with: CORS is blocked entirely on
`hms-jar` (no bean, no annotations); explain why (the browser only ever talks to `ng serve`'s proxy or
`hms-webb`'s forwarder); note this was live-verified (`curl` with a cross-origin `Origin` header → 403,
no `Access-Control-Allow-Origin` header).
