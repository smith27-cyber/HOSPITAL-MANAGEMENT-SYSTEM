# Task: Add `WebApiForwardController`

**Phase:** [Phase 2 — Create the hms-webb Spring Boot module](../../phases/phase-2-create-hms-webb-module.md)
**Status:** Done

Create `hms-pom/hms-webb/src/main/java/com/hms/webb/controller/WebApiForwardController.java` — a
`RestClient`-based catch-all on `/api/**`, forwarding every request (all HTTP methods) to `hms-jar` at
`http://localhost:8081`. Copies request headers (excluding `Host`/`Content-Length`) and response headers
(excluding `Transfer-Encoding`/`Content-Length`).

**Must use `.exchange()`, not `.retrieve()`** — `.exchange()` passes upstream error statuses
(401/403/404/etc.) through unchanged; `.retrieve()`'s default behavior would throw on non-2xx responses
and silently swallow them, a real bug class for a proxy.

This is not a copy of any business logic — purely a relay. It's also the mechanism that makes Phase 4's
"CORS blocked entirely" decision viable: the browser only ever talks to `hms-webb` (or `ng serve`'s dev
proxy), so from the browser's point of view `hms-webb` *is* the API.

Copy from `architecture/gsn-creating-a-new-pom-structure`'s
`hms-pom/hms-webb/src/main/java/com/hms/webb/controller/WebApiForwardController.java` — generic
infrastructure, no adaptation needed for `paul`'s extra `platform`/`tenant`/`audit` endpoints (it forwards
`/api/**` unconditionally, so new backend routes need no changes here).
