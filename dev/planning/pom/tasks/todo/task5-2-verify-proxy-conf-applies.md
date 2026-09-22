# Task: Confirm `proxy.conf.json` still applies post-move

**Phase:** [Phase 5 — Wire the Angular build into hms-webb](../../phases/phase-5-wire-angular-output.md)
**Status:** Not started

`hms-pom/hms-webb/angular/proxy.conf.json` already forwards `/api` → `http://localhost:8081` (carried
over unchanged from `hms-frontend/proxy.conf.json` by the Phase 1 move — no edit needed). Just confirm
`angular.json`'s `serve.options.proxyConfig` still points at it correctly after the directory move (the
path is relative to the Angular project root, which didn't change internally, only its parent path did).
