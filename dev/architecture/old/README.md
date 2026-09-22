# HMS Architecture Documentation — As-Built (branch `paul`)

**Last Updated:** 2026-09-23
**Verified against:** branch `paul`, commit `9f5abdb` (code) — docs added on top at `ff68a3d`
**Scope:** `hms-backend/` and `hms-frontend/` only. Does **not** cover `dev/planning/` or `dev/testing/`.

---

## Why this doc set exists

`dev/architecture/20260922/` (the sibling directory) documents a *different* line of work: a planned
migration to an `hms-jar`/`hms-webb` module layout, carried out on the
`architecture/gsn-creating-a-new-pom-structure` branch. Its counts (18 entities, 16 repositories, 16
services) were accurate for that branch at the time they were written, but `paul` never received that
restructuring — it still uses the `hms-backend`/`hms-frontend` layout — and `paul` separately gained an
entire multi-tenant SaaS platform layer (`platform`, `tenant`, `audit` packages) that the `20260922` set
never saw. The two doc sets ended up describing two different, divergent codebases while sitting side by
side in the same repo.

This directory (`old/`) documents what is **actually in `paul`'s working tree right now**, verified by
reading the source directly (not by trusting any prior doc). "Old" here follows the repo's established
naming convention (as-built/current state), not "outdated."

## Tech stack

- **Backend:** Spring Boot 4.1.1, Java 21, Maven. Spring Data JPA, Spring Security (method security via
  `@PreAuthorize`), JWT auth (`io.jsonwebtoken` 0.12.6), PostgreSQL, springdoc-openapi 2.6.0.
- **Frontend:** Angular 22 (100% standalone components, no NgModules), Angular Material, chart.js, jspdf,
  xlsx. Tests via Angular's native Vitest integration (not Karma).
- **Database:** PostgreSQL 15 (via `docker-compose.yml`), schema entirely Hibernate-managed
  (`ddl-auto=update`) — no Flyway/Liquibase.
- **Deployment model:** dual — `ng serve` + `proxy.conf.json` for dev, or `ng build` compiled straight into
  `hms-backend/src/main/resources/static` for a single-jar production deploy (see
  [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)).

## What HMS actually is, as of this branch

A single-jar-deployable, **multi-tenant** hospital management system: one Spring Boot backend serves
both a tenant-facing HMS application (patients, doctors, appointments, consultations, pharmacy,
laboratory, admissions, billing, inventory, reports, hospital/system settings) and a separate
platform/SaaS administration surface ("Olives Tech" platform) for managing tenants, subscription plans,
and per-tenant module entitlements. Tenant isolation and module gating are enforced per-request by two
custom servlet filters, not by a database-level mechanism (see [SECURITY.md](./SECURITY.md)).

## Document index

| Doc | Covers |
|---|---|
| [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) | High-level architecture, deployment model, filter chain |
| [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md) | Full entity/repository/service/controller inventory |
| [FRONTEND_COMPONENTS.md](./FRONTEND_COMPONENTS.md) | Angular app structure, routing, guards, services |
| [DATA_MODEL.md](./DATA_MODEL.md) | Entity table, relationships, enums |
| [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) | Schema management, constraints, indexes |
| [DATA_FLOW.md](./DATA_FLOW.md) | Key request flows (auth, tenant provisioning, billing, module gating) |
| [API_DESIGN.md](./API_DESIGN.md) | Endpoint reference per controller |
| [SECURITY.md](./SECURITY.md) | Auth, RBAC, CORS, tenant isolation, known gaps |
| [OPERATIONS.md](./OPERATIONS.md) | Running the app, configuration, no-CI status |
| [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) | Concrete, verified defects and inconsistencies |
| [FEATURE_COMPLETENESS.md](./FEATURE_COMPLETENESS.md) | Backend vs. frontend coverage per module |
| [TESTING_STATUS.md](./TESTING_STATUS.md) | What test coverage actually exists |
| [STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md) | One-page summary of all of the above |
| [WEBB_MODULE.md](./WEBB_MODULE.md) | Status of the planned hms-jar/hms-webb migration (not yet applied here) |
| [CLAUDE.md](./CLAUDE.md) | Provenance note for this doc set |
