# Task: Scaffold the real suite layout

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [phase0-task6-decide-ci](./phase0-task6-decide-ci.md)
**Status:** Not started

Replace `dev/testing/playwright/`'s single-purpose structure with a real
suite layout:
- A `tests/` folder organized by feature module, matching this plan's
  phases.
- A `fixtures/` folder for the per-role auth fixtures (see
  [phase0-task4-decide-auth-reuse](./phase0-task4-decide-auth-reuse.md)).
- A `pages/` (or similar) folder for a Page Object Model per feature
  module, if that pattern is adopted — recommended, given 13 modules
  with repeated list/create/edit/detail shapes, where a shared base page
  object avoids massive duplication.

Depends on the base-URL and test-data-strategy decisions being made
first so the scaffold is built around the right assumptions.
