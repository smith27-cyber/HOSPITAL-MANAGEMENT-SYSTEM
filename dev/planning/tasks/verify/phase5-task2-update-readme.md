# Task: Update root README.md for the new frontend workflow

**Phase:** [Phase 5 — Documentation catch-up](../../phases/phase-5-documentation-catchup.md)
**Depends on:** [phase4-task3-document-dev-workflow](./phase4-task3-document-dev-workflow.md)
**Status:** Done

Updated root `README.md`'s Quick Start (both ways to run the frontend —
`ng serve` for development, `ng build` + `mvn -pl hms-webb
spring-boot:run` for the packaged path, with the no-hot-reload caveat
stated explicitly) and Project Structure (rewrote the `hms-webb` tree
entry to show it's a real Spring Boot module now — `HmsWebbApplication`,
`SpaWebConfig`, `WebApiForwardController`, `static/`, `proxy.conf.json` —
not just a folder containing `angular/`).
