# Task: Update component/API/data docs

**Phase:** [Phase 7 — Refresh dev/architecture/old for the new module layout](../../phases/phase-7-refresh-architecture-docs.md)
**Status:** Done

Sweep these files for stale `hms-backend`/`hms-frontend` path references and update to
`hms-pom/hms-jar`/`hms-pom/hms-webb/angular` (Java package `com.hms.backend` is unchanged — only the
module/directory path moved):

- `BACKEND_COMPONENTS.md` — file paths throughout; remove the `AngularForwardController` entry from the
  Config Layer section (retired in Phase 3 of the pom migration); note the controller count drops by one
  as a result.
- `API_DESIGN.md` — any base-path or file-path mentions.
- `DATABASE_DESIGN.md` — any file-path mentions (schema/entity content itself is unaffected by the pom
  move, only paths).
- `FRONTEND_COMPONENTS.md` — update the Angular project's location and confirm nothing else changed
  (component structure, routing, services are all unaffected by the pom move).
