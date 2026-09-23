# HMS Feature Completeness Matrix

**Version:** 1.2
**Last Updated:** 2026-09-23

Backend vs. frontend coverage, verified directly (not inferred from either side alone). The `Platform:*`
and `Audit logging` rows below did not exist in earlier drafts of this document — they postdate the
branch it was originally written against. Two claims from those earlier drafts were also simply wrong
and are corrected here: there is no logout endpoint (JWT is stateless), and "System preferences"/
"Notification settings" were previously marked frontend-only — both are actually backend-persisted.

| Domain | Backend | Frontend | Notes |
|---|---|---|---|
| Patients | Full CRUD | Full CRUD UI | Entity bound directly, no DTO |
| Doctors | Full CRUD | Full CRUD UI | Entity bound directly |
| Departments | Full CRUD | Full CRUD UI | Entity bound directly |
| Appointments | Full CRUD + queue + status | Full UI incl. queue | Uses DTOs both sides |
| Consultations | Full workflow (open→complete) | Full UI | — |
| Pharmacy prescriptions | Full 5-stage dispense workflow | Full UI incl. dispense flow | Largest service impl (2020 lines) |
| Laboratory (tests + requests) | Full CRUD both | Full UI both | `testId`↔`LaboratoryTest` has no FK |
| Admissions | Full CRUD + ward/bed logic | Full UI | No `ADMISSION_DELETE` permission (reuses UPDATE) |
| Billing | Full CRUD + payments + invoice sync | Full UI incl. receipts | Largest impl (1685 lines) |
| Receipts | Full read API | Full UI | **No `@PreAuthorize` on the controller at all** |
| Inventory | Full CRUD + stock/search | Full UI incl. stock view | |
| Reports | Dashboard aggregate endpoint | Single report component | Tenant always server-resolved |
| Dashboard | Aggregate endpoint | Full UI | |
| Hospital settings | Full CRUD (backend-backed) | Full UI | 1-row-per-tenant pattern |
| System preferences | Full CRUD (backend-backed) | Full UI | 1-row-per-tenant pattern |
| Notification settings | Backend-backed, but via `SystemPreferences` | UI exists (`notification-settings` component) | Not a separate backend feature — the component calls `SettingsService.getSystemSettings()`/`updateSystemSettings()`, the same `/api/settings/system` endpoint as System Preferences, and edits its `enableNotifications`/`enableEmailNotifications`/`enableSmsNotifications` fields |
| User management (tenant-scoped) | Full CRUD, class-level RBAC | Full UI | |
| **Audit logging** | Entity + repo + service + controller exist | **None** | See below — effectively non-functional end-to-end |
| **Platform: Tenants** | Full CRUD + admin creation | Full UI | |
| **Platform: Plans** | Full CRUD | Full UI | Concrete service, no interface |
| **Platform: Subscriptions** | Full create/status-change, drives module entitlement | Full UI | Concrete service, no interface |
| **Platform: Modules** | Full catalog + per-tenant toggle | Full UI | Concrete service, no interface |
| **Platform: Users** | List/status/delete (no create endpoint) | Full UI | |
| **Multi-tenant module gating** | Enforced per-request (`ModuleAccessFilter`) | Nav-item hiding only (`TenantModuleService`) | Frontend hiding is convenience, not security — backend filter is the real gate |

## Audit logging: why it's effectively non-functional today

Three independent gaps compound:
1. **Write coverage is partial** — `AuditLogService.log(...)` is only called from
   `PharmacyPrescriptionServiceImpl` (8 call sites). No other domain (billing, admissions, consultations,
   patients, users, tenants, platform actions) writes an audit entry.
2. **Read is unreachable** — `AuditLogController` requires `AUDIT_LOG_VIEW`, which no RBAC initializer
   ever seeds. No role, including SUPER_ADMIN, can currently call `/api/audit-logs`.
3. **No frontend surface** — no component, service, or route in the Angular app (`hms-pom/hms-webb/angular`)
   references audit logs at all.

If audit logging is meant to be a real compliance/security feature rather than a partial, currently
inert scaffold, all three gaps need addressing together. See
[KNOWN_ISSUES.md](./KNOWN_ISSUES.md) and [DATA_FLOW.md](./DATA_FLOW.md).

## DTO consistency

Only 4 of the ~15 core-domain controllers use dedicated request/response DTOs
(`Appointment`, `Consultation`, `Billing`+`Payment`, `Dashboard`); the rest bind JPA entities directly as
`@RequestBody`/response bodies. This is a consistent pattern across the whole core domain, not a
per-feature gap — see [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md).

## Related Documentation

- [FRONTEND_COMPONENTS.md](./FRONTEND_COMPONENTS.md) — implementation detail per module
- [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md) — DTO usage detail
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — gaps not reflected in the table above
- [STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md) — overall project status
