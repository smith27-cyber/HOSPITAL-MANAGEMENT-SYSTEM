# Task: Scaffold the real suite layout (done)

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [task-0-6-decide-ci](./task-0-6-decide-ci.md)
**Status:** Done — foundation pieces built and verified live; per-module
`tests/`/`pages/` content is each phase's own job, not built ahead of need

## What was actually built, in `dev/testing/playwright/`

- **`playwright.config.ts`** — rewritten: `baseURL` fixed to
  `http://localhost:4200` ([task-0-1](./task-0-1-decide-base-url.md));
  two `webServer` entries starting `hms-jar` (with
  `HMS_DEV_LOGIN_ENABLED=true`) and `ng serve` as plain processes
  ([task-0-6](./task-0-6-decide-ci.md)); a `setup` project
  (`auth.setup.ts`) that a `chromium` project depends on; `retries`,
  `trace`, `screenshot` per the CI decision.
- **`fixtures/auth.ts`** — the identity lists plus
  `captureSession`/`restoreSession` (see
  [task-0-4](./task-0-4-decide-auth-reuse.md) for why this exists
  instead of Playwright's built-in `storageState`).
- **`tests/auth.setup.ts`** — the 10 login tests, verified live: `10
  passed`, and (separately, since a passing login test doesn't itself
  prove the saved session is reusable) a fresh context + restored
  session reaching `/dashboard` authenticated.
- **Removed**, per [task-0-5](./task-0-5-decide-coverage-tooling.md):
  `hms-pom/hms-webb/angular/instrument-serve.js`,
  `dev/testing/playwright/.nycrc.json`,
  `dev/testing/playwright/merge-coverage.js`, and the now-dead
  `nyc`/`istanbul-lib-instrument` deps + coverage scripts from
  `package.json`.
- **`.gitignore`** — added `/dev/testing/playwright/.auth/`, since
  captured sessions contain real JWTs.

## Deliberately not built yet

- **Per-module `tests/*` and `pages/*`** — the plan's own recommendation
  (a `tests/` folder organized by phase, a `pages/` Page Object Model
  per module) isn't scaffolded as empty placeholder folders. Building
  the shared base page-object shape now, before any real module test
  exists to validate it against, would be exactly the kind of
  speculative abstraction worth avoiding — that's each phase's own
  first task once it actually starts.
- `dev/testing/playwright/tests/app.spec.ts` (the old smoke test) is
  untouched — Phase 1 replaces its content when it writes the real
  login tests, not this task.
