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
- **`ng test` now verified passing: 74/74 tests, 73/73 files, exit 0.** It did not start that way — the
  first real run failed to even compile, then failed 42/74 tests at runtime. All of it has since been
  fixed:
  - **6 spec files imported the wrong class name** (`Receipts`, `HospitalSettings`,
    `NotificationSettings`, `UserManagement`, `Dashboard` instead of the real
    `ReceiptsComponent`/`HospitalSettingsComponent`/`NotificationSettingsComponent`/
    `UserManagementComponent`/`PlatformDashboard`) — a hard compile failure, not a runtime one, since
    Angular's template type-checker couldn't resolve the import at all.
  - **`appointment-register.spec.ts` was not a test.** It contained an entire stale, duplicate copy of
    the component's own `@Component` class (missing `isEditMode`, using loosely-typed literals instead of
    the real `Patient`/`Doctor` models) sharing the same `templateUrl` as the real component — so
    Angular's template checker validated the real template against this broken duplicate too, throwing
    unrelated-looking property-does-not-exist errors. Replaced with an actual `TestBed`-based spec.
  - **41 of 42 spec files had no router test provider.** Any component injecting `ActivatedRoute` or
    rendering a `routerLink` threw `NG0201: No provider found for ActivatedRoute` — this was never a
    per-component bug, just a missing `providers: [provideRouter(...)]` in each generated spec's
    `TestBed.configureTestingModule`. A first pass with `provideRouter([])` fixed the DI error but
    surfaced a second one: components whose HTTP-error handlers call `router.navigate(...)` (the HTTP
    calls fail immediately in the test environment — no backend, no mock) then failed with
    `NG04002: Cannot match any routes` against the empty route table. Fixed by giving the test router a
    wildcard catch-all (`provideRouter([{ path: '**', children: [] }])`).
  - **`app.spec.ts`'s "should render title" test asserted content that was never real** — it checked for
    an `<h1>` with `'Hello, hms-frontend'`, boilerplate from Angular's default generated template. The
    actual `app.html` is just `<router-outlet></router-outlet>`; the test was replaced to check for that
    instead.
  - **`main-layout.spec.ts` failed on `window.matchMedia is not a function`** — jsdom doesn't implement
    it, and `ThemeService` (injected by `MainLayout`) calls it in its constructor to detect the OS
    light/dark preference. Fixed with a standard `matchMedia` stub in that spec's `beforeEach`.

  None of this touched application source under `src/app/` except the two files that were never real
  tests to begin with (5 renamed-class specs' imports, `appointment-register.spec.ts`,
  `app.spec.ts`) — every other fix was additive (`providers: [...]`, a `matchMedia` stub), not a change
  to what the components themselves do.

## End-to-end (Playwright)

`dev/testing/playwright/` contains a Playwright + nyc coverage-merge setup (`playwright.config.ts`,
`.nycrc.json`, `merge-coverage.js`) but **only one spec file**, `tests/app.spec.ts`. It used to sit at
top-level `testing/playwright/`, duplicated alongside an identical copy already living under
`dev/testing/playwright/` (brought in from the `architecture/gsn-creating-a-new-pom-structure` reference
branch alongside the Playwright plan below); the two were merged into this single location. A much
larger Playwright test plan exists as planning documents under `dev/planning/playwright/` (10 phases,
dozens of task files) — but per this doc set's scope (architecture only, not planning), that plan
describes intended future coverage, not current coverage. As of this branch, only the one smoke-level
spec is implemented.

## Net assessment

Test coverage is thin, but what exists now genuinely passes. The frontend's 74 specs are CLI-scaffolded
`should create`/`toBeTruthy()` checks, not hand-written assertions of real behavior — they verify a
component instantiates without throwing, nothing about what it actually does. That's a real ceiling on
how much confidence 74/74 green should inspire, but at least the number is now honest: before this pass
it wasn't even compiling. The backend's actual business logic (the 1000–2000-line service implementations
handling billing, pharmacy dispense, lab workflows, multi-tenancy, and RBAC) still has **no automated
test coverage at all** beyond a context-load smoke test per module. That remains the single largest gap
between "code exists" and "code is verified to work" in the project.
