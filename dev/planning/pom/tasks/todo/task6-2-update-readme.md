# Task: Update root `README.md`

**Phase:** [Phase 6 — Repo-root cleanup and documentation](../../phases/phase-6-repo-cleanup.md)
**Depends on:** All of Phases 1–5 verified
**Status:** Not started

Update root `README.md`'s Quick Start and Project Structure sections to describe:

- The two-process model: `hms-jar` (Backend API, port 8081) and `hms-webb` (Web API + static serving,
  port 8080), both under `hms-pom/`.
- Two ways to run the frontend: `ng serve` (fast dev loop, proxies to `hms-jar` on 8081, never touches
  `hms-webb`'s `static/`) vs. `ng build` + `mvn -pl hms-webb spring-boot:run` (packaged path — **no
  hot-reload**; a fresh `ng build` requires restarting `hms-webb`, since Maven's resource copy is a
  one-time build step, not a background sync).
- The new module tree (`hms-pom/pom.xml`, `hms-pom/hms-jar/`, `hms-pom/hms-webb/` incl. `angular/`).
