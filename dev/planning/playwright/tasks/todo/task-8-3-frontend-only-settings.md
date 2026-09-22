# Task: Test: system preferences & notification settings — known frontend-only limitation

**Phase:** [Phase 8 — Reports & Settings](../../phases/phase-8-reports-settings.md)
**Depends on:** [task-8-2-hospital-settings](./task-8-2-hospital-settings.md)
**Status:** Not started

`SystemPreferencesComponent` and `NotificationSettingsComponent` have no
backend persistence per `STATUS_OVERVIEW.md`/`FEATURE_COMPLETENESS.md`.
Test this like a feature with a known, documented limitation, not like
a bug:
- Change a setting, **reload the page**, and confirm the *actual*
  behavior — the expected result is that the change does **not**
  survive a reload.
- Write the test to assert the documented reality, and flag it clearly
  as testing a known limitation.
- If it turns out these settings *do* persist (e.g. via `localStorage`),
  that's a documentation-vs-reality mismatch worth reporting back, not
  silently accepting either way.
