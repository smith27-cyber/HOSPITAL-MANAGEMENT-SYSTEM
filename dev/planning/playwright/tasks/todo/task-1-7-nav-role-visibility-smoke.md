# Task: Test: nav menu renders per role (smoke-level only) — done

**Phase:** [Phase 1 — Authentication & App Shell](../../phases/phase-1-auth-and-shell.md)
**Depends on:** [task-1-6-route-guard-redirect-target](./task-1-6-route-guard-redirect-target.md)
**Status:** Done — `dev/testing/playwright/tests/auth/nav-smoke.spec.ts`,
9/9 identities pass

Confirms the nav renders *something* per role and every visible link
navigates to a real page (no 404s, no blank routes). Loops all 9
dev-login identities via `restoreSession`. The detailed per-permission
comparison across roles belongs in
[Phase 9](../../phases/phase-9-rbac-and-error-handling.md),
not duplicated here.

Caught and fixed a **test bug**, not an app bug: `.count()` doesn't
auto-retry like `toBeVisible()` does, so it raced the sidebar's render
on 4 of 9 identities (confirmed via failure screenshot — the nav was
actually fully rendered). Fixed with an `await expect(...).toBeVisible()`
before counting.
