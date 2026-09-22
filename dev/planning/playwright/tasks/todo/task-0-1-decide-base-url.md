# Task: Base URL — ng serve only (decided)

**Phase:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md)
**Depends on:** nothing — this blocks everything else
**Status:** Decided — the suite targets the Angular dev server exclusively

The suite is a **UI test suite for the Angular app** — it shoots solely
against `ng serve` (`hms-pom/hms-webb/angular`) at
`http://localhost:4200`. There is no dual-target parametrization and the
packaged `hms-webb` Spring Boot module (port 8080, static-serving +
`/api/**` forwarding) is not a test target for this suite.

`ng serve`'s own `proxy.conf.json` forwards `/api/**` to `hms-jar` on
`:8081`, so API calls still reach the real backend — the fixed base URL
for every test is `http://localhost:4200`.
