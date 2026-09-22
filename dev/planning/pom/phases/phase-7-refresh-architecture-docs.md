# Phase 7 — Refresh `dev/architecture/old/` for the new module layout

**Plan:** [../../hms-pom-migration-plan.md](../../hms-pom-migration-plan.md)
**Depends on:** Phases 1–6 complete and verified
**Status:** Done

`dev/architecture/old/` documents `paul`'s as-built architecture as it stood *before* this migration
(flat `hms-backend`/`hms-frontend`, CORS enabled, `AngularForwardController`). That snapshot is now
stale in exactly the way the doc set's own `KNOWN_ISSUES.md`/root `CLAUDE.md` warn about — 13 of its 16
files reference `hms-backend`, `hms-frontend`, `@CrossOrigin`, `corsConfigurationSource`, or
`AngularForwardController` and need updating to match the real, current code.

Not touching `dev/architecture/20260922/` — that set already assumed the `hms-jar`/`hms-webb` layout
(it was written for a different, earlier branch that had it), so it's closer to correct than before,
though it still doesn't know about `paul`'s `platform`/`tenant`/`audit` additions (a separate,
already-known gap, out of scope here).

## Tasks

1. [Update `WEBB_MODULE.md`](../tasks/verify/task7-1-update-webb-module-doc.md) — Done
2. [Update `SYSTEM_DESIGN.md` and `SECURITY.md`](../tasks/verify/task7-2-update-system-design-and-security.md) — Done
3. [Update component/API/data docs](../tasks/verify/task7-3-update-component-and-api-docs.md) — Done
4. [Update `OPERATIONS.md`](../tasks/verify/task7-4-update-operations.md) — Done
5. [Update `KNOWN_ISSUES.md`](../tasks/verify/task7-5-update-known-issues.md) — Done
6. [Update remaining path references](../tasks/verify/task7-6-update-remaining-references.md) — Done
7. [Verify no stale path references remain](../tasks/verify/task7-7-verify-no-stale-references.md) — Done
