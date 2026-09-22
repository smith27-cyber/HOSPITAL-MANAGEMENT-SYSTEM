# HMS Webb Module — Frontend Spring Boot Module

**Version:** 1.0
**Last Updated:** 2026-09-22

---

## What it is

`hms-webb` (`hms-pom/hms-webb/`) is a real Spring Boot module — not a
copy of the Backend API, just a thin **Web API** layer plus static
serving. It has no entities, no repositories, no business logic. It
exists so `hms-jar` (the Backend API) never has to know anything about
the frontend.

**Port:** `8080` (Spring Boot's conventional default — `hms-jar` uses
`8081` instead, freeing this one up; standard ports throughout).

```
hms-webb/
├── pom.xml                              # packaging: jar, spring-boot-starter-webmvc + devtools
├── src/main/java/com/hms/webb/
│   ├── HmsWebbApplication.java          # @SpringBootApplication entry point
│   ├── config/SpaWebConfig.java         # SPA-routing fallback
│   └── controller/WebApiForwardController.java  # /api/** forwarder
├── src/main/resources/
│   └── static/                          # `ng build` writes directly here (gitignored)
└── angular/                             # the Angular 22 project
    ├── angular.json                     # outputPath → ../src/main/resources/static
    └── proxy.conf.json                  # ng serve dev proxy → hms-jar:8081
```

---

## SpaWebConfig — client-side routing fallback

Spring Boot's default static-resource handler serves exact file matches
only; it doesn't fall back to `index.html` for unknown paths the way
`ng serve` or most SPA hosting does. Without this, a hard refresh on a
deep link (e.g. `/patients`) would 404.

`SpaWebConfig` overrides `PathResourceResolver` to fall back to
`index.html` for any path that isn't a real static file — the standard
Spring Boot SPA-hosting pattern. This works for every route automatically,
present or future, unlike the hardcoded-route-list approach the old
(removed) `hms-jar` `AngularForwardController` used.

Verified: `/patients` (no such static file) returns `index.html` (200);
`/favicon.ico` (a real file) still returns the actual file, not the
fallback.

---

## WebApiForwardController — the Web API

A `RestClient`-based catch-all on `/api/**`, forwarding every request to
`hms-jar`'s Backend API at `http://localhost:8081`. Not a copy of any
business logic — just relays the request and response as-is, including
headers (JWT `Authorization` included) and status codes.

Uses `.exchange()` rather than `.retrieve()` specifically so upstream
error statuses (401/404/400/etc.) pass through unchanged instead of being
thrown as exceptions and swallowed — a real bug class for a proxy that
`.retrieve()`'s default behavior would have introduced silently.

This is what makes the "CORS blocked entirely" decision work (see
[SECURITY.md](./SECURITY.md)): the browser only ever talks to `hms-webb`;
from its point of view, `hms-webb` *is* the API.

Verified fully end-to-end, not just the mechanism: with a live `hms-jar` +
Postgres running, a real login (`POST /api/auth/login` with a seeded test
account) through `hms-webb` returned a real JWT, and an authenticated
`GET /api/departments` using that token returned `200` with real (if
empty) data — the same response `hms-jar` gives directly. Public
endpoints (`/api/health`) and auth-rejection behavior (`403` without a
token) also matched exactly between `hms-webb` and `hms-jar` directly.

---

## The `ng build` → static/ mechanism

No Maven copy step, no `frontend-maven-plugin`. `angular.json`'s
`outputPath` points directly at `hms-webb/src/main/resources/static/`:

```jsonc
"outputPath": {
  "base": "../src/main/resources/static",
  "browser": ""
}
```

The `browser: ""` override matters — Angular 22's
`@angular/build:application` builder nests output under a `browser/`
subfolder by default, and Spring Boot needs `index.html` sitting directly
under `static/`, not `static/browser/`.

`ng build` (or `ng build --configuration production`) writes there
directly. Running `hms-webb` (`mvn -pl hms-webb spring-boot:run`) does
**not** pick up a fresh build automatically — Maven's resource copy
(`src/main/resources` → `target/classes`) is a one-time build step, not a
background sync, and Spring Boot devtools watches `target/classes` for
restart triggers, not the raw source tree. A fresh `ng build` requires
restarting `hms-webb` (verified directly: editing the static `index.html`
while `hms-webb` was running was not picked up, immediately or after
several seconds).

This doesn't affect day-to-day development, since `ng serve` (the fast
loop) never touches `hms-webb` at all — verified directly: `ng serve`
never wrote to `src/main/resources/static/` throughout a live session
(file mtime unchanged). `ng serve` compiles and serves everything from an
in-memory dev server, completely independent of `outputPath`.

---

## Related Documentation

- [SECURITY.md](./SECURITY.md) — the CORS decision this module implements
- [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md) — `hms-jar`, the Backend API this forwards to
- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) — overall architecture
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — what's still unverified
