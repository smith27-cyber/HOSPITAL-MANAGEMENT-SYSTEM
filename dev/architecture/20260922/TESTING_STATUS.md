# HMS Testing Status

**Version:** 1.2
**Last Updated:** 2026-09-23

---

## Backend

**`hms-jar`**: one test file, `HmsBackendApplicationTests.java` — the default Spring Boot context-load
smoke test. **No unit tests, no integration tests, no repository tests, no controller/`@WebMvcTest`
tests exist for any of the 24 entities, 24 repositories, 25 services, or 26 controllers**, despite
`pom.xml` declaring the full Boot 4 "split" test starters (`spring-boot-starter-data-jpa-test`,
`-security-test`, `-validation-test`, `-webmvc-test`).

**`hms-webb`**: also just one test file (`HmsWebbApplicationTests.java`, added during the pom migration,
mirroring `hms-jar`'s own smoke-test pattern) — a context-load check only. No coverage for
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
  classic Karma.
- **`ng test` verified passing: 74/74 tests, 73/73 files, exit 0.** It did not start that way — the first
  real run failed to even compile, then failed 42/74 tests at runtime. All of it was fixed as part of
  this reconciliation pass:
  - **6 spec files imported the wrong class name** (`Receipts`, `HospitalSettings`,
    `NotificationSettings`, `UserManagement`, `Dashboard` instead of the real
    `ReceiptsComponent`/`HospitalSettingsComponent`/`NotificationSettingsComponent`/
    `UserManagementComponent`/`PlatformDashboard`) — a hard compile failure.
  - **`appointment-register.spec.ts` was not a test.** It contained a stale, duplicate copy of the
    component's own `@Component` class (missing `isEditMode`, using loosely-typed literals instead of the
    real `Patient`/`Doctor` models) sharing the same `templateUrl` as the real component — so Angular's
    template checker validated the real template against this broken duplicate too. Replaced with an
    actual `TestBed`-based spec.
  - **41 of 42 spec files had no router test provider.** Any component injecting `ActivatedRoute` or
    rendering a `routerLink` threw `NG0201`. Fixed with `providers: [provideRouter([{ path: '**', children: [] }])]`
    (a plain empty route array first fixed the DI error but surfaced `NG04002` from HTTP-error handlers
    calling `router.navigate(...)` — the wildcard catch-all fixes both).
  - **`app.spec.ts`'s "should render title" test asserted content that was never real** — boilerplate
    `<h1>Hello, hms-frontend</h1>` from Angular's default generated template; the actual `app.html` is
    just `<router-outlet></router-outlet>`.
  - **`main-layout.spec.ts` failed on `window.matchMedia is not a function`** — jsdom doesn't implement
    it, and `ThemeService` (injected by `MainLayout`) calls it in its constructor. Fixed with a standard
    stub.

  None of this touched application source under `src/app/` except the files that were never real tests
  to begin with — every other fix was additive test scaffolding, not a change to component behavior.

## End-to-end (Playwright)

`dev/testing/playwright/` contains a Playwright + nyc coverage-merge setup (`playwright.config.ts`,
`.nycrc.json`, `merge-coverage.js`) but **only one spec file**, `tests/app.spec.ts`, verifying the login
page loads and collecting Istanbul code coverage — not a suite covering real user flows. A much larger
Playwright test plan exists as planning documents under `dev/planning/playwright/` (10 phases, dozens of
task files) describing intended future coverage, not current coverage.

## Net assessment

Test coverage is thin, but what exists now genuinely passes. The frontend's 74 specs are CLI-scaffolded
`should create`/`toBeTruthy()` checks, not hand-written assertions of real behavior — they verify a
component instantiates without throwing, nothing about what it actually does. That's a real ceiling on
how much confidence 74/74 green should inspire, but at least the number is now honest: before this pass
it wasn't even compiling. The backend's actual business logic (the 1000–2000-line service implementations
handling billing, pharmacy dispense, lab workflows, multi-tenancy, and RBAC) still has **no automated
test coverage at all** beyond a context-load smoke test per module. That remains the single largest gap
between "code exists" and "code is verified to work" in the project.

## Related Documentation

- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — why test coverage matters for the open issues
- [STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md) — overall project status
