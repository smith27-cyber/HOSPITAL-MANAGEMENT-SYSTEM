# Task: Verify `hms-webb` serves the built Angular app

**Phase:** [Phase 2 — Wire Angular's build output directly into `static/`](../../phases/phase-2-angular-output-wiring.md)
**Depends on:** [phase2-task2-verify-build-output](./phase2-task2-verify-build-output.md)
**Status:** Done — restarted `hms-webb`, log showed `Adding welcome page:
class path resource [static/index.html]`, `curl localhost:8080/` returned
HTTP 200 with the real Angular `index.html`, not a 404.

Restart `hms-webb` (`mvn -pl hms-webb spring-boot:run`) and open
`http://localhost:<webb-port>/` in a browser — confirm the actual Angular
app loads (not the Whitelabel error page from
[phase1-task6](./phase1-task6-verify-boot.md), and not a 404).
