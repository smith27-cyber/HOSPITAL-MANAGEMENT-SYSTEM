# HMS Testing Status — As-Built

**Last Updated:** 2026-09-23

## Backend

**`hms-jar`**: one test file, `HmsBackendApplicationTests.java` — the default Spring Boot context-load
smoke test. **No unit tests, no integration tests, no repository tests, no controller/`@WebMvcTest`
tests exist for any of the 24 entities, 24 repositories, 25 services, or 26 controllers**, despite
`pom.xml` declaring the full Boot 4 "split" test starters (`spring-boot-starter-data-jpa-test`,
`-security-test`, `-validation-test`, `-webmvc-test`).

**`hms-webb`**: also just one test file (`HmsWebbApplicationTests.java`, added in Phase 8 of the pom
migration, mirroring `hms-jar`'s own smoke-test pattern) — a context-load check only. No coverage for
`SpaWebConfig`'s fallback behavior or `WebApiForwardController`'s header-forwarding logic; both were only
checked manually (`curl`) during the migration's verification, not by an automated test.

## Frontend

- **73 `*.spec.ts` files** exist, one per component under `features/`, `platform/`, `layout/`, `auth/`
  (73 non-spec components, exact 1:1 file-existence coverage), plus `app.spec.ts` for the root — 74
  total spec files.
- **Zero spec files for `core/`** — no tests for `auth.service.ts`, any other core service, any of the 3
  guards, or the interceptor. The parts of the app that decide authentication and authorization are
  entirely untested.
- `layout/platform-layout/platform-layout.ts` is the one component without a matching spec.
- **Test runner**: Angular 22's native Vitest integration (`@angular/build:unit-test` builder), not
  classic Karma — `package.json` has `vitest@^4.0.8` and `jsdom@^28.0.0`; `tsconfig.spec.json` sets
  `"types": ["vitest/globals"]`.
- **`ng test` itself still not verified as passing.** `node_modules` is now installed and `npm run build`/
  `npm start` were both confirmed working during the pom migration's verification pass, but `ng test`
  (the Vitest suite specifically) was not run. The configuration looks complete and consistent, but "a
  spec file exists" has not been confirmed to mean "the suite currently passes."

## End-to-end (Playwright)

`testing/playwright/` (top-level, outside `hms-pom/`) contains a Playwright + nyc
coverage-merge setup (`playwright.config.ts`, `.nycrc.json`, `merge-coverage.js`) but **only one spec
file**, `tests/app.spec.ts`. A much larger Playwright test plan exists as planning documents under
`dev/planning/playwright/` (10 phases, dozens of task files) — but per this doc set's scope (architecture
only, not planning), that plan describes intended future coverage, not current coverage. As of this
branch, only the one smoke-level spec is implemented.

## Net assessment

Test coverage is thin and concentrated in one place: component-level frontend specs exist for nearly
every UI component (likely CLI-scaffolded alongside each component, not necessarily hand-written
assertions of real behavior — this was not verified spec-by-spec), while the backend's actual business
logic (the 1000–2000-line service implementations handling billing, pharmacy dispense, lab workflows,
multi-tenancy, and RBAC) has **no automated test coverage at all**. This is the single largest gap between
"code exists" and "code is verified to work" in the project.
