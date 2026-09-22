# HMS Database Design — As-Built

**Last Updated:** 2026-09-23

## Engine & schema management

- **PostgreSQL 15** (`postgres:15-alpine` in `docker-compose.yml`), database `hms_database`, user
  `hms_user` — credentials are plaintext in both `docker-compose.yml` and
  `hms-backend/src/main/resources/application.properties` (see [SECURITY.md](./SECURITY.md)).
- **No Flyway or Liquibase.** Confirmed: no such dependency in `pom.xml`, no `db/migration` directory, no
  file matching `*migration*`/`*flyway*`/`*liquibase*` anywhere under `src/main/resources`.
- `spring.jpa.hibernate.ddl-auto=update` — the **entire schema is Hibernate-managed**. Every table,
  column, index, and constraint is derived from `@Table`/`@Column`/`@Index`/`@UniqueConstraint`/
  `@JoinColumn` annotations on the entities (see [DATA_MODEL.md](./DATA_MODEL.md)), and Hibernate
  creates/alters tables automatically at boot based on the current DB state. `update` mode is additive
  only — it adds missing columns/tables but never drops or safely renames existing ones, so a renamed
  entity field leaves the old column behind as an orphan.

## Notable constraints

- **Unique per-tenant, not globally**: `invoiceNumber` (`Billing`), `itemCode` (`Inventory`), `code`
  (`Department`), `nationalId`/`licenseNumber`/`email` (`Doctor`), `nationalId` (`Patient`),
  `receiptNumber` (`PaymentTransaction`), `prescriptionNumber` (`PharmacyPrescription`) — all scoped
  `(tenant_id, <field>)`.
- **Unique globally**: `username` (`User`), `code` (`Tenant`, `Plan`, `Permission` by different fields —
  `Role.name`, `Permission.code`), `code` (`PlatformModule`, on the enum column).
- **One-row-per-tenant tables**: `HospitalSettings` and `SystemPreferences` both enforce a unique
  `tenant_id`, and both follow an identical "get-or-create-default, update re-resolves tenant from
  context, reset restores hard-coded defaults" service pattern.
- **`AuditLog`** carries 5 indexes: tenant, user, action, entity_type, created_at — the only entity with
  explicit indexing beyond primary/foreign keys, since it's an append-heavy, query-by-filter table.
- **ID strategy is inconsistent**: some entities use `Long` IDENTITY (`AuditLog`, `BillingItem`,
  `LaboratoryRequest`, `LaboratoryTest`, `PharmacyPrescription`, `Permission`, `Role`, `User`, and all of
  `platform`/`tenant`/`settings`), others use a plain `String` primary key populated by application code
  (`Admission`, `Appointment`, `Consultation`, `Department`, `Doctor`, `Inventory`, `Patient` — with
  `Department`/`Doctor` generating sequential IDs like `DEP-2026-001` via native SQL queries in their
  repositories).

## Relationships summary

See [DATA_MODEL.md](./DATA_MODEL.md) for the full entity table. In ER terms: `Tenant` is the root of
nearly every foreign key in the schema; the only non-tenant-rooted object graphs are `User`↔`Role`↔
`Permission` (RBAC) and `Plan`↔`PlatformModule` (catalog). Most clinical-domain relationships
(patient↔doctor↔department↔appointment↔consultation↔billing) are **not** enforced at the database level —
they're plain string/long ID references without foreign key constraints, so referential integrity between
those tables depends entirely on application code being correct.
