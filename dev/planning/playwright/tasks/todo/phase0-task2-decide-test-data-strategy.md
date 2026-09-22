# Task: Decide the test data seeding strategy

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [phase0-task1-decide-base-url](./phase0-task1-decide-base-url.md)
**Status:** Not started

Many flows need existing reference data (a department before a doctor can
be registered into it, a patient before an appointment, etc.). Decide
between:
- Seeding via direct API calls in a `beforeAll`/fixture — fast, bypasses
  the UI, but that's fine since the UI is the *subject* under test, not
  the setup.
- Creating everything through the UI in each test — slower and more
  brittle, but exercises create-flows as a side effect.

Recommendation from the plan: API-seeded data for prerequisites,
UI-driven only for the thing actually being tested in a given test.
