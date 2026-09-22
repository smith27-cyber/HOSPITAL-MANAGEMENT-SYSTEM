# hms-jar / hms-webb Module — As-Built

**Last Updated:** 2026-09-23 (post-migration)

## Summary: applied and live-verified on `paul`

`dev/planning/hms-pom-migration-plan.md` (and its phases/tasks under `dev/planning/pom/`) replayed the
`architecture/gsn-creating-a-new-pom-structure` branch's proven `hms-jar`/`hms-webb` restructuring
directly against `paul`'s own, more advanced code. All 6 phases are done; all 9 plan verification checks
passed live (real Postgres, real `hms-jar`/`hms-webb`/`ng serve` processes, real login/JWT, CORS
genuinely blocked, module-gating round trips). See that plan's Results section for the full record.

`paul` now has:

```
hms-pom/
├── pom.xml              # parent, packaging=pom, modules: hms-jar, hms-webb
├── hms-jar/              # Backend API — package com.hms.backend unchanged
└── hms-webb/             # Web module: static serving + /api/** forwarding
    ├── src/main/java/com/hms/webb/
    │   ├── HmsWebbApplication.java
    │   ├── config/SpaWebConfig.java
    │   └── controller/WebApiForwardController.java
    ├── src/main/resources/
    │   ├── application.properties      # port 8080
    │   └── static/                     # ng build output (gitignored)
    └── angular/                        # Angular 22.1.0 UI
        ├── proxy.conf.json             # ng serve dev proxy -> hms-jar:8081
        └── angular.json                # outputPath -> ../src/main/resources/static
```

## Mechanics

- **`SpaWebConfig`** — overrides `PathResourceResolver` so any request that doesn't resolve to a real
  static file falls back to `classpath:/static/index.html`, letting Angular's router take over. Works
  for every route automatically; there is no hardcoded per-route list (unlike the retired
  `AngularForwardController`, which used to live in `hms-jar` for this purpose and has been deleted).
- **`WebApiForwardController`** — `@RequestMapping("/api/**")`, forwards every request (all methods,
  headers minus `Host`/`Content-Length`) to `hms-jar` at `http://localhost:8081` via
  `RestClient.exchange()` (not `.retrieve()`, so upstream error statuses pass through unmodified rather
  than being thrown and swallowed).
- **CORS**: `hms-jar` has none — no bean, no `@CrossOrigin` anywhere. The browser only ever talks to
  `hms-webb` (or `ng serve`'s dev proxy), both of which forward `/api/**` to `hms-jar` server-side, so
  there's never a legitimate cross-origin request to allow. Live-verified: a cross-origin `curl` directly
  against `hms-jar` on 8081 returns `403` (auth-related, unrelated to CORS) with no
  `Access-Control-Allow-Origin` header.
- **Ports**: `hms-jar` = 8081 (API only, no frontend awareness at all), `hms-webb` = 8080 (packaged
  serving), `ng serve` = 4200 (dev loop, unchanged CLI default).

## Two ways to run the frontend

- **Dev loop**: `cd hms-pom/hms-webb/angular && npm start` — proxies `/api/**` to `hms-jar` on 8081,
  never touches `hms-webb`'s `static/` output.
- **Packaged path**: `ng build` (writes directly into `hms-webb/src/main/resources/static/`), then
  `mvn -pl hms-webb spring-boot:run`. No hot-reload — a fresh `ng build` requires restarting `hms-webb`,
  since Maven's resource copy is a one-time build step, not a background sync.

## Related documentation

- [SECURITY.md](./SECURITY.md) — the CORS decision this module implements
- [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md) — `hms-jar`, the Backend API this forwards to
- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) — overall architecture
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — resolved CORS finding, plus an unrelated module-entitlement
  finding surfaced during this migration's live verification
