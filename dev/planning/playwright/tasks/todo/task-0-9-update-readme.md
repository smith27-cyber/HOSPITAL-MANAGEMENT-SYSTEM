# Task: Update dev/testing/playwright/README.md for the new structure (done)

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [task-0-8-confirm-admin-login](./task-0-8-confirm-admin-login.md)
**Status:** Done

Rewrote `dev/testing/playwright/README.md`: prerequisites (Postgres
only — `hms-jar`/`ng serve` are launched by Playwright's `webServer`
config), how to run, the actual directory structure, how the auth
fixtures work (including the `storageState()` correction from
[task-0-4](./task-0-4-decide-auth-reuse.md), with a usage example), and
a **History** section explaining the removed Istanbul tooling instead
of documenting it as if still current.
