# Task: Fix known gap: implement the global exception handler in hms-jar

**Phase:** [Phase 9 — RBAC & Error/Validation UX (Cross-Cutting)](../../phases/phase-9-rbac-and-error-handling.md)
**Depends on:** [phase9-task4-network-error-handling](./phase9-task4-network-error-handling.md)
**Status:** Not started

Per `KNOWN_ISSUES.md` (P1), there's no global exception handler in
`hms-jar` — unhandled backend exceptions return Spring Boot's default
error shape, not the documented
`{"timestamp","status","error","message","path"}` contract.

Any test in
[phase9-task4-network-error-handling](./phase9-task4-network-error-handling.md)
that hits an unhandled error path should assert what **actually** comes
back, and confirm whether the frontend's error handling was built
assuming the documented (but unimplemented) shape. If it was — meaning
real users see broken/inconsistent error handling today — implementing
the actual `@ExceptionHandler`/`@ControllerAdvice` in `hms-jar` is in
scope here too, closing out `KNOWN_ISSUES.md` (P1) rather than leaving
it as a permanently-documented gap.
