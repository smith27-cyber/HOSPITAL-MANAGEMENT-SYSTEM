# Task: Verify client-side routing survives a hard refresh

**Phase:** [Phase 2 — Wire Angular's build output directly into `static/`](../../phases/phase-2-angular-output-wiring.md)
**Depends on:** [phase2-task3-verify-serving](./phase2-task3-verify-serving.md)
**Status:** Not started — likely to surface a real decision point

Navigate to a non-root Angular route (e.g. `/patients`) via in-app
navigation, then hard-refresh the browser on that URL.

Spring Boot's default static-resource handler serves exact file matches
only — it does **not** automatically fall back to `index.html` for
unknown paths the way `ng serve` or most SPA hosting does. A hard refresh
on `/patients` will likely 404 unless something forwards unmatched routes
to `index.html`.

**If it 404s:** this needs a decision, not just a fix — e.g. a
`WebMvcConfigurer` resource handler with a fallback, or an
`ErrorController` that forwards 404s to `index.html`. Don't silently patch
this without noting the choice made and why, since it affects how
`hms-webb` behaves for every route in the app.

A reference implementation already exists —
`hms-jar/src/main/java/com/hms/backend/config/AngularForwardController.java`
takes the explicit-route-list approach (`@RequestMapping` on each known
app path, forwarding to `/index.html`). It's useful as a *pattern* to
adapt, but the file itself must not be reused in place or copied as-is
into `hms-webb` without review — it hardcodes routes by name, so it goes
stale every time a new top-level route is added, and per the hard
constraint in [hms-webb-morph-plan.md](../../hms-webb-morph-plan.md), it
needs to be removed from `hms-jar` entirely
([phase3-task2](./phase3-task2-remove-stale-static.md)), not left
duplicated in both modules.
