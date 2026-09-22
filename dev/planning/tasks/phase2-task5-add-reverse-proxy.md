# Task: Add a Web API layer in `hms-webb` that forwards to the Backend API

**Phase:** [Phase 2 — Wire Angular's build output directly into `static/`](../phases/phase-2-angular-output-wiring.md)
**Depends on:** [phase1-task6-verify-boot](../tasks/phase1-task6-verify-boot.md)
**Status:** Not started

## Naming

To avoid ambiguity: `hms-jar` is the **Backend API** (owns all business
logic, entities, the 17 controllers listed in
`dev/architecture/old/BACKEND_COMPONENTS.md`). `hms-webb` gets its own thin **Web
API** — not a copy of any business logic, just a forwarding layer that
receives `/api/**` requests and relays them to the Backend API. This
avoids refactoring any of the existing Backend API controllers or any of
the ~15 Angular services (which already call relative `/api/...` URLs
correctly).

## Why

Once `hms-webb` serves the built app on its own port, the Angular app's
existing relative API calls resolve against `hms-webb`'s own origin, not
`hms-jar`'s — they'll 404 unless something in `hms-webb` forwards them.

## Implementation

Add the Web API forwarding layer in `hms-webb` (itself running on `8080`,
per [phase4-task1](./phase4-task1-choose-port.md)) — any request under
`/api/**` gets relayed to `hms-jar`'s Backend API at
`http://localhost:8081`. Implementation options to pick between:
- A `RestTemplate`/`WebClient`-based forwarding controller/filter in
  `hms-webb` — the minimal-dependency option.
- Spring Cloud Gateway, if pulling in that dependency is acceptable for
  what is otherwise a minimal static-file-serving module.

This keeps the packaged path same-origin — from the browser's point of
view, `hms-webb`'s Web API *is* the API. The Backend API's origin is never
seen by the browser at all, which is what lets
[phase4-task2](./phase4-task2-resolve-cors.md) block CORS on `hms-jar`
entirely, with no allow-list needed for either serving mode.
