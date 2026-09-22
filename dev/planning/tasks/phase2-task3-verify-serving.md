# Task: Verify `hms-webb` serves the built Angular app

**Phase:** [Phase 2 — Wire Angular's build output directly into `static/`](../phases/phase-2-angular-output-wiring.md)
**Depends on:** [phase2-task2-verify-build-output](./phase2-task2-verify-build-output.md)
**Status:** Not started

Restart `hms-webb` (`mvn -pl hms-webb spring-boot:run`) and open
`http://localhost:<webb-port>/` in a browser — confirm the actual Angular
app loads (not the Whitelabel error page from
[phase1-task6](./phase1-task6-verify-boot.md), and not a 404).
