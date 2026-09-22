# Task: Document the dev-vs-packaged frontend workflow

**Phase:** [Phase 4 — Cross-cutting config decisions](../../phases/phase-4-cross-cutting-config.md)
**Status:** Done — content decided, tested, and applied to root
`README.md`'s Quick Start via
[phase5-task2](../verify/phase5-task2-update-readme.md).

State explicitly, somewhere a developer will actually read it (root
`README.md` Quick Start is the likely spot — see
[phase5-task2](../verify/phase5-task2-update-readme.md)):

- `ng serve` (port `4200`, proxies API calls to `hms-jar` on `8081` via
  `proxy.conf.json`) is the loop for active frontend development. Tested
  directly: `ng serve` never touches `hms-webb/src/main/resources/static/`
  at all (confirmed via unchanged file mtime while `ng serve` ran) — it
  compiles and serves everything from an in-memory Vite dev server,
  completely independent of `outputPath` (which only applies to
  `ng build`). This is why `hms-webb`'s static-serving limitation below
  doesn't affect day-to-day development: the fast loop never goes through
  `hms-webb` in the first place.
- `hms-webb` (the packaged Spring Boot module) is the
  production/packaged serving path — no hot-reload. Tested directly:
  editing `src/main/resources/static/index.html` directly while
  `hms-webb` was already running (same effect as a fresh `ng build`
  landing new output there) was **not** picked up — not immediately, not
  after several seconds, and `target/classes/static/` (what's actually
  served) was confirmed unchanged too. Maven's resource copy
  (`src/main/resources` → `target/classes`) is a build-time step, not a
  background sync, and Spring Boot devtools watches `target/classes` for
  restart triggers, not the raw source tree. A fresh `ng build` requires
  restarting `hms-webb` (or at least `mvn compile`, then a restart)
  before the new build is served.

Nobody should expect editing a `.ts` file, or even running a fresh
`ng build`, to be reflected through `hms-webb` without restarting it. That
expectation doesn't matter in practice, since nobody develops against
`hms-webb` directly — `ng serve` is the loop, `hms-webb` is only exercised
when explicitly testing the packaged path.
