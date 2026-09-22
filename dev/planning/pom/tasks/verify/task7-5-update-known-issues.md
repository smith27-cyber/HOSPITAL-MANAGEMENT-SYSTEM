# Task: Update `KNOWN_ISSUES.md`

**Phase:** [Phase 7 — Refresh dev/architecture/old for the new module layout](../../phases/phase-7-refresh-architecture-docs.md)
**Status:** Done

- **Resolve**: "`ConsultationController` allows any CORS origin" — CORS is now removed entirely from
  `hms-jar`; this finding no longer applies. Move it to a "Resolved" note rather than deleting it
  outright, so the history isn't lost (matching the reference plan's own `KNOWN_ISSUES.md` convention of
  recording resolved items rather than silently dropping them).
- **Resolve**: "Stray build artifacts at the repository root" — `index.html`, `main-V6MMLPDK.js`,
  `styles-4KNJEDFK.css` were deleted in Phase 6 of the pom migration.
- **Add**: the incidental finding from the pom migration's live verification — `test_doctor`'s tenant
  (`OLIVES-DEFAULT`) has zero enabled modules, `403 MODULE_NOT_ENABLED` on every module-gated endpoint
  tried, reproduced identically against `hms-jar` directly (not a proxy artifact). Likely an
  initializer-ordering issue between `RbacDataInitializer` (creates the tenant) and
  `PlatformDataInitializer`'s `initializeTenantDefaults` (enables modules only for tenants that already
  exist when it runs, at `@Order(100)`).
- Leave unrelated pre-existing items as-is (no global exception handling, dead `ErrorResponse`, etc. —
  none of that was touched by the pom migration).
