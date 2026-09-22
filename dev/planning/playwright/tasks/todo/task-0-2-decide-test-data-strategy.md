# Task: Test data seeding strategy — UI-only (decided)

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [task-0-1-decide-base-url](./task-0-1-decide-base-url.md)
**Status:** Decided — all test data, including prerequisites, is created
through the real UI

All test data — including reference/prerequisite data a later step
depends on (a department before a doctor can be registered into it, a
patient before an appointment, etc.) — is created by driving the actual
Angular UI, never via a direct API call or a direct DB insert.

This is a deliberate consequence of staying strictly top-down: any
backend code path exercised only through seeding (API or DB) would show
up as "covered" without ever being proven reachable by a real user
action, hiding exactly the dead-code/unreachable-endpoint signal this
suite is meant to surface. UI-only seeding means every byte of backend
coverage this suite produces is coverage a real user's browser actually
triggered — no exceptions, no shortcuts for setup convenience.

Accepted trade-off: slower and more repetitive test setup (a chain of
UI actions before the "real" assertion of a given test even starts).
Mitigate with shared setup helpers/fixtures that drive the UI
programmatically (e.g. a `createDepartmentViaUi()` helper reused across
tests) rather than hand-rolling the same UI steps in every test file —
still 100% UI-driven, just not duplicated.
