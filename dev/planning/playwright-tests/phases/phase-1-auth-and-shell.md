# Phase 1 — Authentication & App Shell

**Plan:** [plan.md](../plan.md)
**Depends on:** [Phase 0](./phase-0-foundation.md) (auth fixtures)
**Status:** Not started

Everything else depends on being able to log in reliably — this is the
first real test content written, deliberately small and foundational.

## Scope

- `LoginComponent` (`src/app/auth/`) — the only component in the Auth
  module.
- `auth.guard.ts` — route protection.
- `auth.interceptor.ts` — JWT injection (tested indirectly: if it's
  broken, every authenticated request in every later phase fails).
- `MainLayoutComponent` — nav menu, layout wrapper for all authenticated
  pages.

## Test Scenarios

- [ ] **Login — valid credentials.** Submit a seeded test account's
      credentials, confirm redirect to `/dashboard` (or wherever the
      post-login route actually is — confirm, don't assume), confirm the
      JWT is stored (check `localStorage`, per `SECURITY.md`'s documented
      flow) and the nav menu renders.
- [ ] **Login — invalid credentials.** Wrong password → error message
      shown, no redirect, no token stored.
- [ ] **Login — empty/malformed input.** Client-side validation (empty
      username/password) blocks submission before a network call is even
      made, if that's how the form is built — confirm actual behavior.
- [ ] **Logout.** Clears the stored token, redirects to `/login`, and a
      subsequent back-navigation to a protected route doesn't show stale
      authenticated content.
- [ ] **Route guard — unauthenticated access.** Directly navigating to a
      protected route (e.g. `/patients`) with no session redirects to
      `/login`, not a blank page or a console error.
- [ ] **Route guard — post-login redirect target.** If the guard supports
      "redirect back to where you were going" after login, test that;
      otherwise confirm it goes to a sensible default.
- [ ] **Nav menu — role-based visibility, smoke-level only here.** Confirm
      the nav renders *something* per role and every visible link
      navigates to a real page (no 404s, no blank routes). The detailed
      per-permission comparison across roles belongs in
      [Phase 9](./phase-9-rbac-and-error-handling.md), not duplicated here.
- [ ] **Token expiry (if feasible to test).** An expired/invalid JWT on a
      protected request results in a redirect to login, not a silent
      failure or an infinite spinner. May need a way to force an expired
      token (e.g. a fixture with a pre-expired one) — flag as
      possibly-hard-to-test rather than skip silently if it turns out to
      be impractical.
