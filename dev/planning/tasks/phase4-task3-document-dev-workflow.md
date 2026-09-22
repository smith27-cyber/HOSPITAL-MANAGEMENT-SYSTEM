# Task: Document the dev-vs-packaged frontend workflow

**Phase:** [Phase 4 — Cross-cutting config decisions](../phases/phase-4-cross-cutting-config.md)
**Status:** Not started

State explicitly, somewhere a developer will actually read it (root
`README.md` Quick Start is the likely spot — see
[phase5-task2](../tasks/phase5-task2-update-readme.md)):

- `ng serve` (port `4200`, fast reload, proxies API calls to `hms-jar` on
  `8081`) is the loop for active frontend development.
- `hms-webb` (the packaged Spring Boot module) is the
  production/packaged serving path — no hot-reload, requires a fresh
  `ng build` to pick up changes.

Nobody should expect editing a `.ts` file to hot-reload through
`hms-webb`.
