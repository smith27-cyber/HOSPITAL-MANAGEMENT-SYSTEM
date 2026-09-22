# HMS Testing Status

**Last Updated:** 2026-09-22

---

## Frontend

- Unit tests: ✅ Framework configured (Vitest)
- Component tests: 🟡 Partial coverage (58 `.spec.ts` files across components)
- Integration tests: 🟡 Partial coverage
- E2E tests: 🟡 Minimal — one Playwright test
  (`dev/testing/playwright/tests/app.spec.ts`) verifying the login page
  loads and collecting Istanbul code coverage; not a suite covering real
  user flows

## Backend

- Unit tests: 🔴 None — the only test file is the Spring Boot default
  (`HmsBackendApplicationTests.contextLoads()`), an empty smoke test with
  no assertions about actual behavior
- Integration tests: 🔴 None
- API tests: 🔴 None (Swagger UI exists for manual exploration, not automated tests)
- Database tests: 🟡 Partial coverage

---

## Related Documentation

- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — why test coverage matters for the open issues
- [STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md) — overall project status
