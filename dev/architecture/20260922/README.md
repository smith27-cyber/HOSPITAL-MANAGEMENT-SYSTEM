# HMS Architecture Documentation

**Last Updated:** 2026-09-22
**Project:** Hospital Management System
**Version:** 1.2 — split into concern-based documents

---

## Overview

This directory describes the system **as it actually exists today**,
split into one document per concern instead of a few large files that
mixed unrelated topics together. For proposed future changes not yet
implemented, see `../future/` instead (currently empty — its last
proposal, `hms-webb` becoming a real Spring Boot module, was implemented
and promoted here; see [WEBB_MODULE.md](./WEBB_MODULE.md)).

---

## Document Directory

### Status & Planning
- **[STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md)** — executive summary, component status, tech versions, deployment readiness
- **[FEATURE_COMPLETENESS.md](./FEATURE_COMPLETENESS.md)** — per-module feature checklist
- **[KNOWN_ISSUES.md](./KNOWN_ISSUES.md)** — open issues (P0–P3) and next steps — **start here if you want the honest picture**
- **[TESTING_STATUS.md](./TESTING_STATUS.md)** — actual test coverage, not aspirational

### System Design
- **[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)** — 3-tier architecture, layers, core patterns, request lifecycle
- **[SECURITY.md](./SECURITY.md)** — JWT flow, RBAC, CORS (including the known gap)
- **[DATABASE_DESIGN.md](./DATABASE_DESIGN.md)** — design principles, scalability considerations
- **[OPERATIONS.md](./OPERATIONS.md)** — error handling (intended shape), performance, monitoring, deployment

### Components
- **[FRONTEND_COMPONENTS.md](./FRONTEND_COMPONENTS.md)** — all 13 Angular feature modules
- **[BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md)** — `hms-jar`'s config/repository/service/controller/DTO layers
- **[WEBB_MODULE.md](./WEBB_MODULE.md)** — `hms-webb`, the frontend Spring Boot module (Web API forwarder + static serving)
- **[DATA_MODEL.md](./DATA_MODEL.md)** — 18 entities and their relationships

### Reference
- **[API_DESIGN.md](./API_DESIGN.md)** — full REST endpoint specification
- **[DATA_FLOW.md](./DATA_FLOW.md)** — step-by-step flows for key operations

---

## Quick Start Guide

### New to HMS? Start here, in order:

1. **[KNOWN_ISSUES.md](./KNOWN_ISSUES.md)** — what's actually broken, before anything else
2. **[STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md)** — what's built, what's in progress
3. **[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)** — how the pieces fit together
4. **[FRONTEND_COMPONENTS.md](./FRONTEND_COMPONENTS.md)** / **[BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md)** — the components themselves
5. **[API_DESIGN.md](./API_DESIGN.md)** — for integrating against the API

---

## System at a Glance

### Technology Stack

**Frontend:** Angular 22.1.0, TypeScript 6.0.2, Material Design, Chart.js, RxJS
**Backend:** Spring Boot 4.1.1, Java 21, PostgreSQL, Spring Data JPA, Spring Security, JWT

### Key Statistics
- **13** feature modules
- **18** entity types (17 domain + 1 auth `User`; includes RBAC `Role`/`Permission`)
- **16** services (13 domain + 3 auth)
- **17** REST controllers in `hms-jar` (the Backend API)
- **15** Angular services
- **2** classes in `hms-webb` (the Web API / static-serving module) — see [WEBB_MODULE.md](./WEBB_MODULE.md)

See [DATA_MODEL.md](./DATA_MODEL.md) and [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md) for the detail behind these numbers.

---

## Common Use Cases

**"What's actually broken right now?"**
→ [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)

**"How do I add a new feature?"**
→ [SYSTEM_DESIGN.md - Core Architectural Patterns](./SYSTEM_DESIGN.md#core-architectural-patterns)

**"What are all the API endpoints?"**
→ [API_DESIGN.md](./API_DESIGN.md)

**"How does authentication work?"**
→ [SECURITY.md](./SECURITY.md)

**"Where is the Patient entity defined?"**
→ [DATA_MODEL.md](./DATA_MODEL.md)

**"How does a consultation get created?"**
→ [DATA_FLOW.md - Consultation & Prescription Flow](./DATA_FLOW.md#consultation--prescription-flow)

**"What's the current project status?"**
→ [STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md)

**"Is the documented error format real?"**
→ No — see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) (P1) and [OPERATIONS.md](./OPERATIONS.md)

---

## Development Environment Setup

### Frontend
```bash
cd hms-pom/hms-webb/angular
npm install
npm start  # Runs on http://localhost:4200
```

### Backend
```bash
cd hms-pom/hms-jar
mvn clean install
mvn spring-boot:run  # Runs on http://localhost:8081
```

### Database
```
PostgreSQL running on localhost:5432
Default database: hms
```

---

## Common Development Tasks

### Adding a New Feature
1. Create entity in `hms-pom/hms-jar/src/main/java/com/hms/backend/entity/`
2. Create repository in `repository/` folder
3. Create service in `service/` folder
4. Create controller for API endpoints
5. Create Angular service in `hms-pom/hms-webb/angular/src/app/core/services/`
6. Create components in `hms-pom/hms-webb/angular/src/app/features/`
7. Add routes in `app.routes.ts`

### Adding an API Endpoint
1. Update service to call new endpoint
2. Add controller method in backend
3. Implement business logic in service layer
4. Add database query in repository
5. Document in [API_DESIGN.md](./API_DESIGN.md)

### Debugging Data Flow
1. Enable browser DevTools network tab
2. Check interceptor in Auth tab
3. Monitor Network tab for requests
4. Review backend logs for errors
5. Check database with SQL queries

---

## Document Maintenance

When something changes, update the **one** document whose concern it
belongs to — not a duplicate copy elsewhere:

| Change | Update |
|--------|--------|
| Feature completed/started | [FEATURE_COMPLETENESS.md](./FEATURE_COMPLETENESS.md), [STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md) |
| New/resolved issue | [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) |
| Design/pattern change | [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) |
| New entity/repository/service/controller | [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md), [DATA_MODEL.md](./DATA_MODEL.md) |
| New frontend module/component | [FRONTEND_COMPONENTS.md](./FRONTEND_COMPONENTS.md) |
| New/changed endpoint | [API_DESIGN.md](./API_DESIGN.md) |
| New workflow | [DATA_FLOW.md](./DATA_FLOW.md) |
| Test coverage changes | [TESTING_STATUS.md](./TESTING_STATUS.md) |

Cross-link between documents rather than repeating content — that's what
caused several of the inconsistencies logged in `KNOWN_ISSUES.md`'s
history (see the root `CLAUDE.md` for that story).

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-03 | Initial architecture documentation complete |
| 1.1 | 2026-09-22 | Reconciled docs with actual code (Admissions, RBAC, counts, paths, port) |
| 1.2 | 2026-09-22 | Split ARCHITECTURE.md/COMPONENTS.md/PROJECT_STATE.md into 13 concern-based documents; found and documented CORS override, missing global error handling, undocumented OpenApiConfig, DTO layer mismatch |

---

## Related Resources

- Main README in project root
- Root `CLAUDE.md` for the doc-consistency history
- `../future/` for proposed, not-yet-implemented designs (currently empty)
- [Angular Documentation](https://angular.io/docs)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
