# Task: CI execution details (decided)

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [task-0-5-decide-coverage-tooling](./task-0-5-decide-coverage-tooling.md)
**Status:** Decided

## Startup sequence — and a hard constraint from dev-login

1. Start Postgres via the project's `docker-compose.yml` (matches local
   dev exactly — this is the only containerized piece).
2. Start `hms-jar` **as a plain process on the CI runner itself, not in
   its own container**, with `HMS_DEV_LOGIN_ENABLED=true`. Wait for
   `/api/health` to return 200.
3. Start `ng serve` (`hms-pom/hms-webb/angular`), also a plain process
   on the same runner. Wait for port 4200.
4. Run the Playwright suite (`auth.setup.ts` runs first via Playwright's
   project `dependencies`).

**Why hms-jar can't be its own container:** dev-login
([task-0-4](./task-0-4-decide-auth-reuse.md)) requires the caller to be
loopback (`127.0.0.1`/`::1`). That only holds if `ng serve` and
`hms-jar` share the same network namespace — true for plain processes
on one runner, **false** for separate Docker containers on a bridge
network, where cross-container requests arrive from the bridge IP, not
loopback. Containerizing `hms-jar` separately in CI would silently
break every `auth.setup.ts` login. Only Postgres gets containerized.

## Playwright config

- Two `webServer` entries (`hms-jar` via `mvn spring-boot:run` with the
  env var above, `ng serve` via `npm start`) so Playwright manages
  start/wait/teardown for both — Postgres is started as a separate CI
  step before Playwright runs, not via `webServer` (it's a persistent
  service with its own health-check needs, not a fit for that option).
- Headless always on in CI (`headless: true`); local runs can stay
  headed for debugging.
- `retries: process.env.CI ? 2 : 0` — Playwright's standard convention,
  retry flakiness in CI, fail fast locally.
- `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'` — enough to
  debug a CI failure without recording full traces/screenshots for
  every green run.
