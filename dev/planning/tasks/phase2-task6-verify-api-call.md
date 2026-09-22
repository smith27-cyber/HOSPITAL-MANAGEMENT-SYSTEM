# Task: Verify a real API call succeeds through `hms-webb`

**Phase:** [Phase 2 — Wire Angular's build output directly into `static/`](../phases/phase-2-angular-output-wiring.md)
**Depends on:** [phase2-task3-verify-serving](./phase2-task3-verify-serving.md), [phase2-task5-add-reverse-proxy](./phase2-task5-add-reverse-proxy.md)
**Status:** Not started

[phase2-task3](./phase2-task3-verify-serving.md) only confirms `index.html`
loads — it doesn't prove the app actually works. With `hms-jar` still
running, open the app served by `hms-webb` and perform a real action that
round-trips through the API (e.g. log in, or list patients). Confirm in
the browser's network tab that the request went to `hms-webb`'s own origin
(`/api/...`, no CORS preflight) and got a real response, not a 404 or a
CORS error.

This is the task that actually proves
[phase2-task5](./phase2-task5-add-reverse-proxy.md)'s proxy works, not
just that it was configured.
