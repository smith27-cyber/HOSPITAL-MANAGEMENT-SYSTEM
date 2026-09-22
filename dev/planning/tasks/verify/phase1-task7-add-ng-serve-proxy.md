# Task: Add a dev-server proxy for `ng serve`

**Phase:** [Phase 1 — Scaffold the Spring Boot module](../../phases/phase-1-scaffold-module.md)
**Status:** Done, including live verification. Added
`hms-webb/angular/proxy.conf.json` (forwards `/api` to `http://localhost:8081`)
and wired it into `angular.json`'s `serve.options.proxyConfig`. Docker
access became available in this environment (rechecked rather than
assumed still blocked); started the project's own Postgres + `hms-jar`,
then `ng serve`, and tested for real:
- `curl http://localhost:4200/api/health` → `200 HMS Backend is running
  successfully.` — the exact real response from `hms-jar`, reached through
  the dev proxy.
- `POST http://localhost:4200/api/auth/login` with a seeded test account
  → a real JWT and user data, same as calling `hms-jar` directly.

## Decision

Neither `ng serve` nor `hms-webb` should need CORS. Both are proxies in
front of `hms-jar`: from the browser's point of view, whichever server
delivered the page also answers `/api/**` — the delivering server *is* the
API, as far as any client can tell. `hms-jar` itself allows no
cross-origin access at all ([phase4-task2](./phase4-task2-resolve-cors.md)).

This also means the existing relative-URL pattern in every Angular
service (`API_URL = '/api/departments'`, no host/port) is already correct
and needs **no changes** — it works as-is once something forwards `/api`
to `hms-jar` in both dev and packaged modes.

## Implementation

- Add `hms-webb/angular/proxy.conf.json` forwarding `/api` to `hms-jar`
  (`http://localhost:8081`, or whatever
  [phase4-task1](./phase4-task1-choose-port.md) settles on).
- Wire it into `angular.json`'s `serve` target (`proxyConfig`), so plain
  `npm start` / `ng serve` picks it up without an extra flag.
- Verify: with `hms-jar` running, `ng serve`, and a call to e.g.
  `/api/departments` from the running app — confirm it reaches `hms-jar`
  and returns real data, not a 404.
