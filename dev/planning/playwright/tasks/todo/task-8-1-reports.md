# Task: Test: reports — rendering and filters

**Phase:** [Phase 8 — Reports & Settings](../../phases/phase-8-reports-settings.md)
**Depends on:** [Phase 0 — Foundation & Test Infrastructure](../../phases/phase-0-foundation.md), [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md)
**Status:** Not started

- Each report type (patient statistics, appointment analytics, financial
  reports, department performance, doctor performance) actually renders
  something (not a blank page or perpetual loading state) — confirm
  which report types are genuinely implemented vs. placeholders, since
  `FEATURE_COMPLETENESS.md`'s description of this module is one of the
  thinner ones in the codebase.
- If reports take filters (date range, department, doctor), confirm
  changing a filter actually changes the displayed data, not just the
  control's own state.
