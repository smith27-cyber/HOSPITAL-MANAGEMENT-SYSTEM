# HMS Known Issues & Next Steps

**Last Updated:** 2026-09-22

---

## Critical (P0)

- None currently. The CORS misconfiguration previously listed here
  (`ConsultationController`'s `@CrossOrigin(origins = "*")` overriding a
  global `:4200`-only policy) is **resolved** — CORS is now blocked
  entirely on `hms-jar`, with `ng serve` and `hms-webb` each forwarding
  `/api/**` server-side instead of relying on cross-origin access. See
  [SECURITY.md](./SECURITY.md).

## High Priority (P1)

- **No global exception handling.** `API_DESIGN.md` documents a specific
  error response shape (`{"timestamp", "status", "error", "message",
  "path"}`) throughout, and `dto/ErrorResponse.java` exists to model it —
  but nothing constructs or returns it. There is no
  `@ExceptionHandler`/`@ControllerAdvice` anywhere in the backend, so
  unhandled exceptions currently fall through to Spring Boot's default
  error response, not the documented shape. Anyone integrating against
  the documented error contract will find it doesn't match reality. See
  [OPERATIONS.md](./OPERATIONS.md) and [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md).
- Final billing workflow validation
- Performance optimization on large datasets

## Medium Priority (P2)

- Edge case handling in lab requests
- Form validation refinements

## Low Priority (P3)

- UI/UX polish
- Accessibility improvements
- Loading state animations

---

## Next Steps (Priority Order)

1. **Complete bug fixes** from billing workflow validation
2. **Run full integration tests** across all modules
3. **Performance optimization** for large datasets
4. **Add comprehensive logging** for debugging
5. **Complete test coverage** for critical paths
6. **Security audit** for authentication/authorization
7. **Prepare deployment documentation**
8. **Load testing** for production readiness

---

## Related Documentation

- [SECURITY.md](./SECURITY.md) — the CORS design (resolved) in detail
- [OPERATIONS.md](./OPERATIONS.md) — the intended (unimplemented) error-handling shape
- [TESTING_STATUS.md](./TESTING_STATUS.md) — why "run full integration tests" is step 2, not step 0
- [STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md) — overall project status
