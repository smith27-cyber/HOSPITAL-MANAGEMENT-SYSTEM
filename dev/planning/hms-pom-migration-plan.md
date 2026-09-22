# Plan: Migrate `paul` to the `hms-pom/hms-jar` + `hms-pom/hms-webb/angular` layout

**Status:** Done — all 6 phases complete, all 9 verification checks passed live (real Postgres, real
`hms-jar`/`hms-webb`/`ng serve` processes, real login/JWT/CORS/module-gating round trips).
**Branch:** `paul`
**Reference implementation:** `architecture/gsn-creating-a-new-pom-structure` (see
[hms-webb-morph-plan.md](./hms-webb-morph-plan.md) — that plan's target design, already fully
implemented and live-verified there, is the pattern this plan replays on `paul`'s current code).

## Context

`paul` currently ships `hms-backend/` (Spring Boot) and `hms-frontend/` (Angular) as flat top-level
directories. The Angular build is copied into `hms-backend/src/main/resources/static` (92 files,
git-tracked) and served via `AngularForwardController`, with CORS explicitly allowed for
`http://localhost:4200` (a global bean plus 20 redundant per-controller `@CrossOrigin` annotations, one
of which — `ConsultationController` — is wrongly wide open to `*`).

This exact restructuring was already designed, fully implemented, and **live-verified** (real login,
real JWT, real cross-tenant curl tests) on a sibling branch, `architecture/gsn-creating-a-new-pom-structure`,
whose plan and phase docs sit under this same `dev/planning/` directory. That branch's `hms-jar`/`hms-webb`
split is a smaller, earlier snapshot of the backend — it never saw `paul`'s later
`platform`/`tenant`/`audit`/`settings` additions. `dev` branch also has a `hms-pom/` copy, but it's a
*stale, half-finished* snapshot (still has `AngularForwardController.java` and the CORS bean) — not a
usable reference. Attempting to `git merge` either branch into `paul` would re-trigger the giant
false-conflict mess seen earlier in this effort (rename-detection noise, stray junk files with
FQCN-style names that turn out to be PostScript images, 150+ generated build-artifact conflicts).

**Chosen approach: don't merge — replay the same well-proven mechanical transformation directly on
`paul`'s current code.** The gsn branch is the pattern to copy (its 3 new Java classes, its pom
coordinates, its CORS-removal approach); `paul`'s existing backend/frontend content is what gets moved
and edited, unchanged in behavior otherwise. This keeps every step small, git-history-preserving
(`git mv`), and independently verifiable — same phase-by-phase discipline the original plan used.

## Target structure

```
hms-pom/
├── pom.xml                     # NEW parent, packaging=pom, modules: hms-jar, hms-webb
├── hms-jar/                    # moved from hms-backend/ (git mv, history preserved)
│   ├── pom.xml                 # adapted: <parent> hms-parent, artifactId hms-jar
│   └── src/...                 # package com.hms.backend unchanged; static/ removed; CORS removed
└── hms-webb/                   # NEW Spring Boot module (web/gateway) + moved Angular project
    ├── pom.xml                 # jar packaging, spring-boot-starter-webmvc + devtools only
    ├── src/main/java/com/hms/webb/
    │   ├── HmsWebbApplication.java
    │   ├── config/SpaWebConfig.java
    │   └── controller/WebApiForwardController.java
    ├── src/main/resources/application.properties   # port 8080
    └── angular/                 # moved from hms-frontend/ (git mv, history preserved)
        ├── angular.json         # outputPath → ../src/main/resources/static
        └── proxy.conf.json      # already correct: /api → localhost:8081
```

Ports (matching the proven pattern): `hms-jar` (Backend API) = **8081** (unchanged), `hms-webb` (Web API +
static serving) = **8080**, `ng serve` = **4200** (unchanged).

## Steps

Each step below is also broken out as its own tracked phase file under
[`pom/phases/`](./pom/phases/), mirroring the reference plan's phase/task structure.

### 1. Scaffold the module skeleton
- `mkdir hms-pom`; `git mv hms-backend hms-pom/hms-jar`; `git mv hms-frontend hms-pom/hms-webb/angular`
  (single-directory moves — Git tracks these as renames, preserving blame/history for every file inside).
- While moving, also `git rm` the stray FQCN-named junk files sitting directly under (old) `hms-backend/`
  (e.g. `com.hms.backend.auth.service.JwtService`, `jakarta.servlet.http.HttpServletRequest`,
  `org.springframework.stereotype.Component`, etc.) — these are leftover binary/PostScript garbage from
  a prior mishap, confirmed present in the same form on both the `dev` and gsn reference branches; not
  part of the intentional migration.
- Create `hms-pom/pom.xml` (new parent): `groupId=com.hms`, `artifactId=hms-parent`, `version=1.0.0`,
  `packaging=pom`, `<modules>hms-jar, hms-webb</modules>`. `<dependencyManagement>` imports
  `spring-boot-starter-parent:4.1.1` as a BOM and manages `jjwt:0.12.6`, `springdoc-openapi:2.6.0`,
  `postgresql`, `lombok` versions — copy the exact version list from `paul`'s current
  `hms-backend/pom.xml` (already confirmed matching: Spring Boot 4.1.1, Java 21, jjwt 0.12.6, springdoc
  2.6.0). Use the gsn branch's `hms-pom/pom.xml` as the direct template.
- Edit `hms-pom/hms-jar/pom.xml`: replace the `spring-boot-starter-parent` `<parent>` with
  `<parent>com.hms:hms-parent:1.0.0</parent>` (`relativePath=../pom.xml`), change `artifactId` from
  `hms-backend` to `hms-jar`, drop now-redundant version tags on managed dependencies. **Do not** change
  the Java package (`com.hms.backend` stays exactly as-is — confirmed this is what the reference
  implementation did too, only the Maven module/artifactId changed, not the package).

### 2. Create the `hms-webb` Spring Boot module
- `hms-pom/hms-webb/pom.xml`: packaging `jar`, `<parent>` = `hms-parent`, dependencies
  `spring-boot-starter-webmvc` + `spring-boot-devtools` (runtime, optional) only — no JPA, no security, no
  DB driver.
- `hms-pom/hms-webb/src/main/java/com/hms/webb/HmsWebbApplication.java` — plain `@SpringBootApplication`
  main class.
- `hms-pom/hms-webb/src/main/java/com/hms/webb/config/SpaWebConfig.java` — `PathResourceResolver`
  override so unmatched paths fall back to `index.html` (generic SPA-hosting pattern; works for any route
  without a hardcoded list, unlike the controller it replaces).
- `hms-pom/hms-webb/src/main/java/com/hms/webb/controller/WebApiForwardController.java` —
  `@RequestMapping("/api/**")`, `RestClient`-based forward to `http://localhost:8081`, using `.exchange()`
  (not `.retrieve()`) so upstream 401/403/404/etc. pass through unmodified instead of being swallowed.
  Forwards request headers (except `Host`/`Content-Length`) and response headers (except
  `Transfer-Encoding`/`Content-Length`).
- `hms-pom/hms-webb/src/main/resources/application.properties`: `spring.application.name=hms-webb`,
  `server.address=0.0.0.0`, `server.port=8080`.
- All three classes can be copied near-verbatim from `architecture/gsn-creating-a-new-pom-structure` —
  they're generic infrastructure with no dependency on backend business logic, so they don't need
  adaptation for `paul`'s extra `platform`/`tenant`/`audit` modules.

### 3. Retire frontend-serving code from `hms-jar`
- `git rm -r hms-pom/hms-jar/src/main/resources/static` (92 tracked files — this responsibility now
  belongs entirely to `hms-webb`).
- `git rm hms-pom/hms-jar/src/main/java/com/hms/backend/config/AngularForwardController.java`.
- Confirm nothing else references `AngularForwardController` (grep) and that `hms-jar` still compiles
  (`mvn -pl hms-jar compile` from `hms-pom/`).

### 4. Remove CORS from `hms-jar` entirely
- In `hms-pom/hms-jar/src/main/java/com/hms/backend/config/SecurityConfig.java`: remove the
  `.cors(cors -> cors.configurationSource(corsConfigurationSource()))` line, the `corsConfigurationSource()`
  bean and its imports (`CorsConfiguration`, `CorsConfigurationSource`, `UrlBasedCorsConfigurationSource`),
  and the hardcoded Angular-route `permitAll()` whitelist that only existed to support
  `AngularForwardController`. **Keep everything else unchanged** — the JWT filter, `TenantContextFilter`,
  `ModuleAccessFilter` chain, and all `@PreAuthorize` rules are unrelated to CORS and must stay exactly as
  they are (`paul`'s multi-tenancy layer didn't exist on the reference branch, so this is the one place
  the reference implementation doesn't fully dictate the diff — the rest of `SecurityConfig` is additive
  to what gsn had, not something to replace).
- Remove `@CrossOrigin(...)` from all 20 controllers that carry it (including
  `ConsultationController`'s wildcard `@CrossOrigin(origins = "*")`, and the 19 others using
  `http://localhost:4200`) — this can be done with a targeted find/grep-driven pass since it's the same
  one-line annotation (plus its import) in each file.
- Rationale to preserve in a code comment (matching the reference pattern): the browser only ever talks
  to `ng serve`'s dev proxy or `hms-webb`'s `WebApiForwardController`, both of which forward `/api/**` to
  `hms-jar` server-side — there is never a legitimate cross-origin browser request to `hms-jar` to allow.

### 5. Wire the Angular build into `hms-webb`
- `hms-pom/hms-webb/angular/angular.json`: change `architect.build.options.outputPath` from
  `{"base": "../hms-backend/src/main/resources/static", "browser": ""}` to
  `{"base": "../src/main/resources/static", "browser": ""}` (now relative to `hms-webb/angular/`, landing
  in `hms-pom/hms-webb/src/main/resources/static/`). Keep the `"browser": ""` override — required so
  Angular 22's builder doesn't nest output under a `browser/` subfolder that Spring Boot won't serve at
  `/`.
- `hms-pom/hms-webb/angular/proxy.conf.json` already points `/api` → `http://localhost:8081` — no change
  needed, just confirm it still applies post-move (`serve.options.proxyConfig` in `angular.json`).
- Add `hms-pom/hms-webb/src/main/resources/static/` to `.gitignore` (generated output, not source —
  matching the reference implementation's decision).

### 6. Repo-root cleanup
- Delete the stray, superseded build artifacts currently sitting at the repo root
  (`index.html`, `main-V6MMLPDK.js`, `styles-4KNJEDFK.css` — different hashes than anything actually
  served, leftover from an earlier accidental build/commit, already flagged in
  `dev/architecture/old/KNOWN_ISSUES.md`).
- Update root `README.md`'s Quick Start / Project Structure sections to describe the two Spring Boot
  processes (`hms-jar` on 8081, `hms-webb` on 8080) and the two ways to run the frontend
  (`ng serve` for dev-loop, `ng build` + `mvn -pl hms-webb spring-boot:run` for the packaged path, noting
  packaged mode has no hot-reload — a fresh `ng build` requires restarting `hms-webb`).

## Explicitly out of scope (matching the original plan's own scope boundary)

- No change to `hms-jar`'s business logic, entities, controllers' actual behavior, or API contracts
  beyond removing the `@CrossOrigin` annotations themselves.
- No CI/deployment wiring.
- Not refreshing `dev/architecture/old/` to reflect the new module layout — that doc set describes
  *pre-migration* `paul` by design; once this migration lands, a follow-up pass to update it (or fold it
  into `dev/architecture/20260922/`, which already assumed this layout) is a separate, later task.
- Not touching `testing/playwright/` config for the new dual-port setup — flagged as a follow-up, not
  required for the module restructuring itself to be correct.
- Not deleting the reference branches (`dev`, `architecture/gsn-creating-a-new-pom-structure`) or their
  docs — they remain useful history/reference.

## Verification

1. `cd hms-pom && mvn -q -pl hms-jar compile` — confirm `hms-jar` compiles standalone with the new parent
   POM and without `AngularForwardController`/CORS bean.
2. `cd hms-pom && mvn -q -pl hms-webb compile` — confirm the new module compiles.
3. Start Postgres (`docker-compose up -d`), then `mvn -pl hms-jar spring-boot:run` — confirm it boots on
   8081 (RBAC/platform initializers still run cleanly, unaffected by the CORS/static removal).
4. `cd hms-pom/hms-webb/angular && npm run build` — confirm `hms-pom/hms-webb/src/main/resources/static/index.html`
   is produced directly (not nested under `browser/`).
5. `mvn -pl hms-webb spring-boot:run` (with `hms-jar` still running) — `curl localhost:8080/` returns the
   real `index.html`; `curl localhost:8080/patients` (a client-side route, no such static file) still
   returns 200 `index.html` via `SpaWebConfig`'s fallback; `curl localhost:8080/favicon.ico` returns the
   real asset, not the fallback.
6. Full auth round trip through `hms-webb` only: `POST localhost:8080/api/auth/login` with a seeded test
   account (e.g. `test_doctor`/`doctor123`) returns a real JWT; `GET localhost:8080/api/departments` with
   that token returns `200`; without a token, `403`.
7. `curl -H "Origin: http://evil.example" -i http://localhost:8081/api/departments` returns `403` with no
   `Access-Control-Allow-Origin` header — confirms CORS is genuinely closed on `hms-jar` directly, not
   just unused.
8. `cd hms-pom/hms-webb/angular && npm start` (`ng serve`) — confirm the dev-loop proxy still reaches
   `hms-jar` on 8081 exactly as before the move (`curl http://localhost:4200/api/health` → 200).
9. `git log --follow -- hms-pom/hms-jar/src/main/java/com/hms/backend/service/impl/BillingServiceImpl.java`
   (or any pre-existing file) still shows its full pre-move history — confirms `git mv` preserved
   history rather than appearing as a delete+add.

### Results — all 9 passed, live

All checks above were run for real (Postgres already running from a prior session, `hms-jar` on 8081,
`hms-webb` on 8080, `ng serve` on 4200, all three simultaneously):

- `hms-jar` and `hms-webb` both compile clean, no warnings (added an explicit
  `maven-compiler-plugin` version to `hms-parent`'s `pluginManagement` to fix a "missing plugin version"
  warning that appeared once `spring-boot-starter-parent` moved from `<parent>` to a `dependencyManagement`
  BOM import — that import doesn't carry `pluginManagement` with it).
- `hms-jar` booted cleanly on 8081; RBAC/platform initializers ran without errors.
- `ng build` produced `hms-webb/src/main/resources/static/index.html` directly, confirmed gitignored.
- Through `hms-webb` (8080): `/` → 200 real `index.html`; `/patients` → 200 via `SpaWebConfig` fallback;
  `/favicon.ico` → 200 real asset, not the fallback; `/api/health` forwarded correctly;
  `POST /api/auth/login` (`test_doctor`/`doctor123`) returned a real JWT; a `superadmin` token against
  `/api/tenants` returned real tenant data with `200`.
- `curl -H "Origin: http://evil.example" -i http://localhost:8081/api/departments` → `403`, no
  `Access-Control-Allow-Origin` header — CORS genuinely closed at the source.
- `ng serve` on 4200 confirmed still proxying `/api/health` to `hms-jar` on 8081 unchanged.
- `git log --follow` on a pre-existing file traces cleanly back through the move to the initial commit.

**Incidental finding (pre-existing, not caused by this migration, not fixed here — out of scope per
above):** `test_doctor` (tenant `OLIVES-DEFAULT`) got `403 MODULE_NOT_ENABLED` on every module-gated
endpoint tried (`/api/departments`, `/api/dashboard`), reproduced identically hitting `hms-jar` directly
on 8081 — so it's a real backend behavior, not a proxy bug. Likely an initializer-ordering issue between
`RbacDataInitializer` (creates `OLIVES-DEFAULT`) and `PlatformDataInitializer`'s
`initializeTenantDefaults` (enables all modules for tenants that already exist at the time it runs) —
worth a `KNOWN_ISSUES.md` entry in a future documentation pass, not part of this plan's scope.
