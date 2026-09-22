# Task: Decide the fate of the existing coverage-instrumentation tooling

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** [task-0-4-decide-auth-reuse](./task-0-4-decide-auth-reuse.md)
**Status:** Not started

`dev/testing/playwright/instrument-serve.js`-adjacent setup (also
referenced in `hms-pom/hms-webb/angular/instrument-serve.js`,
`.nycrc.json`, `merge-coverage.js`) instruments JS with Istanbul for
coverage collection. The test it was built for is being replaced, but
the instrumentation itself may still be valuable for the new suite.

Decide: keep and reconnect it to the new suite, or drop it in favor of
Playwright's own built-in V8 coverage APIs, which are more standard for
this Playwright version and don't require a custom instrumented
server.
