# Task: Decide the test isolation / uniquification convention

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [task-0-2-decide-test-data-strategy](./task-0-2-decide-test-data-strategy.md)
**Status:** Not started

The app persists real state in Postgres — tests running in parallel or
repeatedly will collide on unique fields (patient email, department
name, etc.) unless test data is uniquified (e.g. a timestamp or UUID
suffix per test run). Decide the convention now and apply it
everywhere, rather than letting each phase invent its own.
