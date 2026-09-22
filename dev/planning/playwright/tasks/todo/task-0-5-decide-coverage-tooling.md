# Task: Coverage tooling — drop instrument-serve.js (decided)

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [task-0-4-decide-auth-reuse](./task-0-4-decide-auth-reuse.md)
**Status:** Decided — drop the Istanbul setup, use Playwright's built-in
V8 coverage

Read `hms-pom/hms-webb/angular/instrument-serve.js` directly rather than
assuming it was still usable. It isn't — it's incompatible with what
[task-0-1](./task-0-1-decide-base-url.md) already decided, not just
outdated in style:

- It hardcodes port **4200** — the same port `ng serve` (the decided
  test target) needs. The two can't run at the same time.
- It has **zero `/api/**` proxying** to `hms-jar`. Every API call,
  including login, would 404 against it — it could never have actually
  worked as a test target once auth was involved.
- It serves a prebuilt `dist/hms-frontend/browser/` folder — a stale
  path from before the hms-webb restructuring — and needs a manual
  build step first; no live reload.

Drop the whole setup: `hms-pom/hms-webb/angular/instrument-serve.js`,
`dev/testing/playwright/.nycrc.json`, `dev/testing/playwright/merge-coverage.js`.
Use Playwright's built-in `page.coverage` (V8 coverage) instead when
frontend coverage is wanted — it works directly against the real
`ng serve` instance with zero extra infrastructure.

**Separate, not covered by this task:** this tooling only ever measured
*frontend* (browser JS) coverage. The dead-code-detection value this
plan actually cares about (see the top-down/UI-only reasoning in
[task-0-2](./task-0-2-decide-test-data-strategy.md)) is about *backend*
(`hms-jar` Java) coverage — which class/endpoint code never gets
exercised by a real UI-driven test. Nothing in Phase 0 currently sets
that up (would need something like JaCoCo attached to the `hms-jar`
instance the suite runs against). Flagging as a gap, not deciding it
here — raise separately if backend coverage is wanted.
