# Task: Test isolation / uniquification convention (decided)

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [task-0-2-decide-test-data-strategy](./task-0-2-decide-test-data-strategy.md)
**Status:** Decided — one shared helper, used everywhere

The app persists real state in Postgres — tests running in parallel or
repeatedly would collide on unique fields (patient email, department
name, doctor license number, etc.) without uniquification.

One shared helper, e.g. `unique(label: string, testInfo: TestInfo)` in a
common test-utils module, reads the current test's own task ID (from
`testInfo` — the test file for `task-3-2-doctors.md`'s scenarios is
named/tagged so its task ID, `task-3-2`, is recoverable at runtime) and
prefixes it onto the label, then appends an 8-character suffix from
`crypto.randomUUID()`:
- `unique('Cardiology', testInfo)` → `"task-3-1-Cardiology-a3f9c2d1"`
- `unique('user@mymail.com', testInfo)` → recognizes the `@` and prefixes
  the local part only: `"task-0-6-user-a3f9c2d1@mymail.com"`

Every phase uses this same helper for every field with a uniqueness
constraint — no per-phase timestamp variants, no hand-rolled counters.

The task-ID prefix isn't for uniqueness (the random suffix alone already
guarantees that) — it's for **traceability**: any row found in Postgres
during debugging is immediately attributable to the exact task/test that
created it, without grepping through test files to find out.

Chosen the random suffix over a timestamp because parallel workers can
call `Date.now()` in the same millisecond; chosen over a worker-index
suffix because worker count/assignment isn't guaranteed stable across
retries or CI reruns, while `randomUUID()` collisions are practically
impossible regardless of parallelism.
