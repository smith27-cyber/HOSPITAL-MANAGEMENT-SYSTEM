# Phase 1 — Authentication & App Shell

**Plan:** [playwright-plan.md](../playwright-plan.md)
**Depends on:** [Phase 0](./phase-0-foundation.md) (auth fixtures)
**Status:** Done — 7/8 scenarios implemented and passing; 1 (token
expiry) confirmed a real gap, fix deferred to
[Phase 9](./phase-9-rbac-and-error-handling.md)'s scope

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

- [x] **Login — valid credentials.** Redirects to `/dashboard`, session
      stored, nav renders. Fixed a doc bug found along the way:
      `SECURITY.md` said `localStorage`, actually `sessionStorage`. See
      [task-1-1](../tasks/todo/task-1-1-login-valid.md).
- [x] **Login — invalid credentials.** Found and fixed a real app bug:
      the error message never rendered at all (missing change
      detection after the async HTTP error, same class of bug as
      [task-0-7](../tasks/todo/task-0-7-scaffold-suite-layout.md)'s
      finding). See [task-1-2](../tasks/todo/task-1-2-login-invalid.md).
- [x] **Login — empty/malformed input.** Confirmed: client-side
      validation blocks submission, no network call made. See
      [task-1-3](../tasks/todo/task-1-3-login-input-validation.md).
- [x] **Logout.** Confirmed: clears the session, redirects to `/login`
      via `replaceUrl: true`, no stale content on back-navigation. See
      [task-1-4](../tasks/todo/task-1-4-logout.md).
- [x] **Route guard — unauthenticated access.** Confirmed: redirects to
      `/login`. See
      [task-1-5](../tasks/todo/task-1-5-route-guard-unauthenticated.md).
- [x] **Route guard — post-login redirect target.** Confirmed from
      source: no return-url support, always plain `/login`. See
      [task-1-6](../tasks/todo/task-1-6-route-guard-redirect-target.md).
- [x] **Nav menu — role-based visibility, smoke-level only here.**
      9/9 identities pass. See
      [task-1-7](../tasks/todo/task-1-7-nav-role-visibility-smoke.md).
- [x] **Token expiry.** Confirmed a real gap, not deferred silently: an
      invalid/expired token does **not** redirect to login — the app
      renders the full authenticated shell on an empty dashboard while
      every API call fails with 403, visible only in the console. Fix
      deferred to [Phase 9](./phase-9-rbac-and-error-handling.md)'s
      global-exception-handler work, since a frontend redirect-on-401
      interceptor needs the backend to first distinguish auth failures
      (401) from permission failures (403) — currently both are an
      indistinguishable bare 403. See
      [task-1-8](../tasks/todo/task-1-8-token-expiry.md).
