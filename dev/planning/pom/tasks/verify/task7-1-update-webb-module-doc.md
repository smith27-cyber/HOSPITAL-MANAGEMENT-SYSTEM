# Task: Update `WEBB_MODULE.md`

**Phase:** [Phase 7 — Refresh dev/architecture/old for the new module layout](../../phases/phase-7-refresh-architecture-docs.md)
**Status:** Done

`dev/architecture/old/WEBB_MODULE.md` currently says the hms-jar/hms-webb migration "is not applied
here" and describes `paul` as still using the flat `hms-backend`/`hms-frontend` layout. That's now wrong
— the migration is done and live-verified (see `dev/planning/hms-pom-migration-plan.md`'s Results
section).

Rewrite the file to describe the **actual, current** state on `paul`:

- Drop the "not applied here" framing entirely.
- Describe `hms-webb` exactly as it now exists: `com.hms.webb.HmsWebbApplication`,
  `com.hms.webb.config.SpaWebConfig`, `com.hms.webb.controller.WebApiForwardController`, port 8080,
  `angular/` nested inside it with `outputPath` → `../src/main/resources/static`.
- Update the "Recommendation" section — there's nothing left to recommend; the migration happened.
