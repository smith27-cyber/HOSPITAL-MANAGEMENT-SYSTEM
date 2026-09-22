# Hospital Management System (HMS)

A comprehensive, full-stack healthcare management platform built with **Angular**, **Spring Boot**, and **PostgreSQL**.

**[📖 What is this good for?](./What-Is-This-Good-For.md)** — Learn about HMS capabilities and benefits

---

## Quick Start

### Prerequisites

* **Java 21+** (Backend)
* **Node.js 20+** (Frontend)
* **Docker & Docker Compose** (PostgreSQL)
* **Maven 3.8+** (Build tool)

### Setup & Run (5 minutes)

#### 1. Start PostgreSQL Database

```bash
docker compose up -d

# PostgreSQL runs on localhost:5432
# Database: hms_database
# User: hms_user
# Password: leahsm27
```

#### 2. Start the Backend API (`hms-jar`)

```bash
cd hms-pom
mvn -pl hms-jar spring-boot:run

# Backend API runs on http://localhost:8081
# API endpoints: http://localhost:8081/api
# Swagger docs: http://localhost:8081/swagger-ui/index.html
```

#### 3. Start the Frontend

There are two ways to run the frontend, depending on what you're doing:

**Fast dev loop** (recommended for day-to-day frontend work) — `ng serve` proxies `/api/**` to `hms-jar`
on 8081 and never touches `hms-webb`'s static output:

```bash
cd hms-pom/hms-webb/angular

npm install  # First time only
npm start

# Dev server runs on http://localhost:4200
```

**Packaged path** (to test the real production wiring — static serving + `hms-webb`'s `/api/**`
forwarding) — build the Angular app straight into `hms-webb`, then run `hms-webb` itself:

```bash
cd hms-pom/hms-webb/angular
npm run build            # writes directly into ../src/main/resources/static

cd ..
mvn spring-boot:run      # hms-webb runs on http://localhost:8080
```

Note: `hms-webb` has **no hot-reload** for the frontend — it serves whatever was in `static/` at the
last build. A fresh `ng build` requires restarting `hms-webb` to pick it up (Maven's resource copy is a
one-time build step, not a background sync).

#### 4. Access the Application

* **Web UI (dev loop):** http://localhost:4200
* **Web UI (packaged):** http://localhost:8080
* **API Docs:** http://localhost:8081/swagger-ui/index.html
* **OpenAPI JSON:** http://localhost:8081/api-docs

---

## Project Structure

```text
HMS/

├── hms-pom/                         # Maven multi-module reactor
│   ├── pom.xml                      # Parent POM (modules: hms-jar, hms-webb)
│   │
│   ├── hms-jar/                     # Backend API (Spring Boot)
│   │   ├── src/main/java/
│   │   │   └── com/hms/backend/
│   │   │       ├── auth/            # Authentication & JWT
│   │   │       ├── config/          # Configuration (Security, OpenAPI)
│   │   │       ├── controller/      # REST endpoints
│   │   │       ├── service/         # Business logic
│   │   │       ├── repository/      # Data access layer
│   │   │       ├── entity/          # JPA entities
│   │   │       ├── dto/             # Data transfer objects
│   │   │       ├── platform/        # SaaS platform admin (tenants, plans, subscriptions, modules)
│   │   │       ├── tenant/          # Tenant entity & context/module-access filters
│   │   │       ├── audit/           # Audit logging
│   │   │       └── settings/        # System preferences
│   │   ├── pom.xml
│   │   └── src/main/resources/application.properties
│   │
│   └── hms-webb/                    # Web module: static serving + /api/** forwarding
│       ├── src/main/java/
│       │   └── com/hms/webb/
│       │       ├── HmsWebbApplication.java
│       │       ├── config/SpaWebConfig.java          # SPA-routing fallback
│       │       └── controller/WebApiForwardController.java  # forwards /api/** to hms-jar
│       ├── src/main/resources/
│       │   ├── application.properties
│       │   └── static/              # `ng build` writes directly here (gitignored)
│       ├── pom.xml
│       └── angular/                 # Angular 22.1.0 UI
│           ├── src/app/
│           │   ├── auth/            # Login & authentication
│           │   ├── core/            # Shared services & guards
│           │   ├── features/        # Tenant-facing feature modules
│           │   ├── platform/        # Platform/SaaS administration UI
│           │   ├── layout/          # Main + platform layout wrappers
│           │   ├── shared/          # Shared models & utilities
│           │   └── app.routes.ts    # Route definitions
│           ├── proxy.conf.json      # ng serve dev proxy → hms-jar:8081
│           ├── package.json
│           └── angular.json         # outputPath → ../src/main/resources/static
│
├── architecture/                   # Comprehensive documentation
│   ├── README.md                   # Architecture overview
│   ├── ARCHITECTURE.md             # System design & patterns
│   ├── COMPONENTS.md               # Detailed component breakdown
│   ├── DATA_FLOW.md                # Data flow patterns & workflows
│   ├── API_DESIGN.md               # API specification
│   ├── PROJECT_STATE.md             # Current status
│   └── CLAUDE.md                   # Documentation fixes log
│
├── docker-compose.yml              # PostgreSQL container setup
├── CLAUDE.md                       # Project-specific guidance
├── What-Is-This-Good-For.md        # Business value document
└── README.md                       # This file
```

---

## Technology Stack

| Layer                | Technology            | Version        |
| -------------------- | --------------------- | -------------- |
| **Frontend**         | Angular               | 22.1.0         |
| **Frontend UI**      | Material Design       | Latest         |
| **Frontend Build**   | TypeScript            | 6.0.2          |
| **Backend**          | Spring Boot           | 4.1.1          |
| **Backend API**      | Spring Web MVC        | 4.1.1          |
| **Data Access**      | Spring Data JPA       | 4.1.1          |
| **Security**         | Spring Security + JWT | 4.1.1 / 0.12.6 |
| **Database**         | PostgreSQL            | 15-Alpine      |
| **Containerization** | Docker                | Latest         |
| **API Docs**         | Swagger/OpenAPI       | 2.6.0          |

---

## Features (13 Core Modules)

✅ **Patient Management** — Register, track, view patient profiles

✅ **Doctor Management** — Doctor profiles, specializations, departments

✅ **Appointments** — Schedule, queue management, status tracking

✅ **Consultations** — Clinical notes, diagnoses, treatment plans

✅ **Pharmacy** — Prescriptions, medication inventory, stock tracking

✅ **Laboratory** — Lab tests, requests, results management

✅ **Billing** — Invoices, payment tracking, financial reports

✅ **Inventory** — Equipment and supply management

✅ **Reports** — Analytics, dashboards, metrics

✅ **Settings** — System configuration, preferences

✅ **Dashboard** — Real-time metrics and KPIs

✅ **Authentication** — Login, JWT tokens, security

✅ **Departments** — Department management and organization

> **Multi-tenant note:** Not every tenant necessarily receives every HMS feature. Modules are controlled through tenant-specific module entitlements.

---

# Multi-Tenant Architecture

The HMS is designed as a **multi-tenant healthcare platform**.

A single HMS deployment can serve multiple healthcare organizations while maintaining tenant-specific users, subscriptions, modules, permissions, and configuration.

A tenant can represent:

* Clinic
* Hospital
* Pharmacy
* Laboratory
* Medical Center
* Other healthcare organization

Each tenant can have its own:

* Tenant identity
* Users
* Roles
* Permissions
* Enabled modules
* Subscription
* Plan
* Subscription status
* Organization configuration

### Tenant Isolation

Normal tenant users operate within the tenant identified by their authenticated JWT.

The backend establishes the tenant context before protected business logic is executed.

```text
User Login
    ↓
JWT Authentication
    ↓
TenantContextFilter
    ↓
Current Tenant Identified
    ↓
ModuleAccessFilter
    ↓
Authorization
    ↓
Controller
    ↓
Service
    ↓
Repository / Database
```

Platform-level users such as `SUPER_ADMIN` operate at the platform level rather than being restricted to one normal tenant.

---

# Platform Administration

The HMS contains a separate platform administration layer for managing the entire HMS platform.

The platform administrator can manage:

* Tenants
* Tenant administrators/users
* Modules
* Plans
* Subscriptions
* Tenant module entitlements
* Platform users
* Platform configuration

### Platform Routes

```text
/platform/dashboard
/platform/tenants
/platform/tenants/create
/platform/tenants/:id/modules
/platform/tenants/:id/admin
/platform/users
/platform/plans
/platform/plans/create
/platform/subscriptions
/platform/subscriptions/create
/platform/modules
```

### Platform User API

```text
GET    /api/platform/users
GET    /api/platform/users/{id}
PATCH  /api/platform/users/{id}/status
DELETE /api/platform/users/{id}
```

Platform users are protected by dedicated permissions such as:

```text
PLATFORM_USER_VIEW
PLATFORM_USER_MANAGE
PLATFORM_USER_STATUS_UPDATE
PLATFORM_USER_DELETE
```

`SUPER_ADMIN` receives the platform-level permissions required to manage the platform.

---

# Role-Based Access Control (RBAC)

The HMS uses Role-Based Access Control to determine what individual users can do inside their tenant.

### Default Roles

```text
SUPER_ADMIN
ADMIN
DOCTOR
NURSE
RECEPTIONIST
PHARMACIST
LAB_TECHNICIAN
ACCOUNTANT
RECORDS_OFFICER
HOSPITAL_MANAGER
```

### Example Permissions

```text
PATIENT_VIEW
PATIENT_CREATE
PATIENT_UPDATE

APPOINTMENT_VIEW
APPOINTMENT_CREATE
APPOINTMENT_UPDATE

PHARMACY_VIEW
PHARMACY_CREATE

LABORATORY_VIEW
LABORATORY_REQUEST_VIEW

BILLING_VIEW
BILLING_CREATE

INVENTORY_VIEW
REPORT_VIEW
SETTINGS_VIEW
```

Permissions answer:

> **Is this individual user allowed to perform this operation?**

Tenant modules answer:

> **Is this functionality available to this tenant?**

These are separate security decisions.

---

# Module Entitlement System

The HMS separates **module availability** from **user permissions**.

For example, a user may have:

```text
PHARMACY_VIEW
```

but the tenant must also have:

```text
PHARMACY
```

enabled.

Therefore:

```text
Tenant Module Enabled
        +
User Permission Granted
        ↓
Feature Available
```

If either condition fails, access should not be granted.

### Example

A pharmacy tenant may have:

```text
DASHBOARD       ✅
PHARMACY        ✅
INVENTORY       ✅
BILLING         ✅
REPORTS         ✅
LABORATORY      ❌
CONSULTATIONS   ❌
ADMISSIONS      ❌
```

Disabled modules should not appear in the tenant's navigation.

More importantly, disabled modules must also be blocked by the backend.

---

# Tenant Module Data Model

The module entitlement system uses platform modules and tenant-specific module records.

Main entities include:

```text
Tenant
PlatformModule
TenantModule
```

### PlatformModule

Defines a module available on the HMS platform.

Examples include:

```text
DASHBOARD
PATIENTS
APPOINTMENTS
DOCTORS
DEPARTMENTS
CONSULTATIONS
PHARMACY
LABORATORY
ADMISSIONS
BILLING
INVENTORY
REPORTS
SETTINGS
```

### TenantModule

Associates a tenant with a platform module and records whether that module is enabled.

Example:

```text
Tenant: ATAMBA-PHARMACY

Module             Enabled
--------------------------------
DASHBOARD          YES
PHARMACY           YES
INVENTORY          YES
BILLING            YES
REPORTS            YES
LABORATORY         NO
ADMISSIONS         NO
CONSULTATIONS      NO
```

---

# Tenant Module API

The authenticated tenant can retrieve its enabled modules through:

```text
GET /api/tenant/modules
```

Example response:

```json
[
  "BILLING",
  "DASHBOARD",
  "INVENTORY",
  "PHARMACY",
  "REPORTS"
]
```

The endpoint derives the tenant from the authenticated tenant context rather than allowing the frontend to request another tenant's modules.

### Backend Module Service

The platform module service provides functionality including:

```text
getModules()
getTenantModules(tenantId)
getEnabledTenantModuleCodes(tenantId)
setTenantModule(tenantId, moduleId, enabled)
isEnabled(tenantId, moduleCode)
initializeTenantDefaults(tenant)
enableOnly(tenantId, moduleCodes)
```

---

# Backend Module Enforcement

Backend module access is enforced by:

```text
ModuleAccessFilter
```

The filter maps protected API paths to HMS modules.

Examples:

```text
/api/pharmacy/...
        ↓
PHARMACY

/api/laboratory/...
        ↓
LABORATORY

/api/billing/...
        ↓
BILLING

/api/inventory/...
        ↓
INVENTORY
```

If the current tenant does not have the required module enabled, the request is rejected.

### Example

Atamba Pharmacy has:

```text
LABORATORY = DISABLED
```

A request such as:

```text
GET /api/laboratory/tests
```

must return:

```text
HTTP 403
MODULE_NOT_ENABLED
```

This is the actual backend security boundary.

> **Important:** Hiding a menu item in Angular is not a security mechanism. The backend must always enforce module entitlements.

---

# Frontend Module Visibility

The Angular frontend uses:

```text
src/app/core/services/tenant/tenant-module.service.ts
```

The `TenantModuleService` retrieves the enabled modules for the current tenant.

It provides checks such as:

```ts
hasModule(moduleCode)
hasAnyModule(moduleCodes)
```

The HMS sidebar combines module entitlement with user permissions.

Example:

```text
PHARMACY module enabled
        +
PHARMACY_VIEW permission
        ↓
Show Pharmacy menu
```

If the module is disabled:

```text
PHARMACY module disabled
        ↓
Hide Pharmacy menu
```

The frontend improves the user experience, while the backend remains the authoritative security layer.

### Module + Permission Helpers

The sidebar can use checks such as:

```ts
hasModulePermission(
    'PHARMACY',
    'PHARMACY_VIEW'
)
```

or:

```ts
hasModuleAnyPermission(
    'LABORATORY',
    [
        'LABORATORY_VIEW',
        'LABORATORY_REQUEST_VIEW'
    ]
)
```

This ensures that a menu item is shown only when both the tenant module and the user's permission requirements are satisfied.

---

# Module + Permission Security Model

The HMS therefore has two complementary access-control layers.

### Layer 1 — Tenant Module Entitlement

Determines whether the tenant has access to a feature.

```text
Tenant
  ↓
Subscription / Entitlement
  ↓
Module Enabled?
```

### Layer 2 — User Permission

Determines whether the individual user may use that feature.

```text
User
  ↓
Role
  ↓
Permissions
  ↓
Permission Granted?
```

### Final Access Rule

```text
Tenant Module Enabled
          AND
User Permission Granted
          ↓
       ACCESS
```

Otherwise:

```text
       DENY
```

---

# Plans & Subscriptions

The platform supports subscription plans that can determine which modules are available to a tenant.

Current example plans include:

```text
PHARMACY_STARTER
CLINIC_STARTER
CLINIC_PROFESSIONAL
HOSPITAL_ENTERPRISE
```

### Example — PHARMACY_STARTER

```text
Monthly Price:
UGX 150,000

Trial:
14 days

Modules:
- Dashboard
- Inventory
- Reports
- Pharmacy
- Billing
```

Subscription information includes:

* Tenant
* Plan
* Subscription status
* Start date
* End date
* Trial period
* Billing period

The platform administration layer can manage subscriptions and tenant module entitlements.

---

# Example Tenant — Atamba Pharmacy

Atamba is currently configured as a pharmacy tenant.

```text
Tenant Code:
ATAMBA-PHARMACY

Tenant Type:
PHARMACY

Subscription:
PHARMACY_STARTER

Status:
TRIAL
```

Current trial period:

```text
Start:
2026-09-14

Trial End:
2026-09-28
```

Enabled modules:

```text
DASHBOARD
INVENTORY
REPORTS
PHARMACY
BILLING
```

Therefore, the Atamba tenant should primarily experience the HMS as a pharmacy management system rather than seeing the complete hospital feature set.

### Expected Atamba Sidebar

```text
Dashboard
Pharmacy
Billing
Inventory
Stock Management
Reports
```

Modules such as:

```text
Patients
Appointments
Doctors
Departments
Consultations
Laboratory
Lab Requests
Admissions
Settings
```

should not appear when those modules are disabled for the tenant or when the current user lacks the required permissions.

---

# Consultation Workflow

The HMS clinical workflow is designed so that registering or saving a consultation does not automatically mean that the consultation is complete.

The intended workflow is:

```text
Appointment
    ↓
Consultation
    ↓
Lab / Pharmacy / Billing
    ↓
Laboratory Results
    ↓
Doctor Reviews Results
    ↓
Final Diagnosis / Treatment
    ↓
Complete Consultation
```

### Consultation Rules

* Saving a consultation does not mean it is completed.
* Laboratory tests are sent to the Laboratory Queue.
* Prescriptions are sent to the Pharmacy Queue.
* Consultation, laboratory, and pharmacy charges are combined into the appropriate billing invoice.
* Laboratory results can be reviewed by the doctor.
* The doctor can finalize diagnosis and treatment.
* The consultation is completed only after the clinical workflow is finalized.

### Consultation Billing

The consultation workflow is intended to keep billing synchronized with clinical activity.

```text
Consultation
     │
     ├── Laboratory Requests
     │        ↓
     │   Laboratory Queue
     │
     ├── Prescriptions
     │        ↓
     │   Pharmacy Queue
     │
     └── Charges
              ↓
          Billing Invoice
```

The system should not treat a consultation as completed simply because it was saved.

---

# API Endpoints

## Base URL

```text
http://localhost:8081/api
```

## Authentication

```text
POST   /auth/login              # Login with credentials
POST   /auth/logout             # Logout
```

## Tenant Modules

```text
GET    /tenant/modules          # Get enabled modules for current tenant
```

## Platform Users

```text
GET    /platform/users
GET    /platform/users/{id}
PATCH  /platform/users/{id}/status
DELETE /platform/users/{id}
```

## Patients

```text
GET    /patients                # List all patients
POST   /patients                # Create patient
GET    /patients/{id}           # Get patient details
PUT    /patients/{id}           # Update patient
DELETE /patients/{id}           # Delete patient
```

## Appointments

```text
GET    /appointments            # List appointments
POST   /appointments             # Schedule appointment
GET    /appointments/{id}       # Get appointment details
PUT    /appointments/{id}       # Update appointment
DELETE /appointments/{id}       # Cancel appointment
GET    /appointments/queue      # Get queue
```

## Consultations

```text
GET    /consultations           # List consultations
POST   /consultations            # Create consultation
GET    /consultations/{id}      # Get consultation
PUT    /consultations/{id}      # Update consultation
```

## Billing

```text
GET    /billing                 # List invoices
POST   /billing                 # Create invoice
GET    /billing/{id}            # Get invoice details
POST   /billing/{id}/payments   # Record payment
```

**[Complete API Documentation →](./architecture/API_DESIGN.md)**

---

# Database Schema

## Entities

The database currently contains the core healthcare entities together with authentication, tenant, subscription, and module-entitlement entities.

Core healthcare entities include:

```text
User
Patient
Doctor
Department
Appointment
Consultation
PharmacyPrescription
PharmacyPrescriptionItem
LaboratoryTest
LaboratoryRequest
Billing
BillingItem
BillingPayment
Inventory
```

Multi-tenant/platform entities include concepts such as:

```text
Tenant
Role
Permission
PlatformModule
TenantModule
Plan
Subscription
```

### Core Relationships

```text
Patient
   ├── Appointments
   ├── Consultations
   ├── Admissions
   └── Billing

Doctor
   ├── Appointments
   ├── Consultations
   └── Departments

Appointment
   └── Consultation

Consultation
   ├── Prescriptions
   └── Billing

Tenant
   ├── Users
   ├── TenantModules
   └── Subscription

PlatformModule
   └── TenantModules
```

---

# Development

## Backend Development

### Add a New Feature

1. **Create Entity** — `src/main/java/com/hms/backend/entity/`
2. **Create Repository** — `src/main/java/com/hms/backend/repository/`
3. **Create Service** — `src/main/java/com/hms/backend/service/`
4. **Create Controller** — `src/main/java/com/hms/backend/controller/`
5. **Create DTO** — `src/main/java/com/hms/backend/dto/`
6. **Add Security/Permissions** where required.
7. **Add Module Entitlement** if the feature belongs to a restricted HMS module.
8. **Test with Swagger** — http://localhost:8081/swagger-ui/index.html

### Build & Run

```bash
cd hms-pom

# Compile
./mvnw -pl hms-jar clean compile

# Run tests
./mvnw -pl hms-jar test

# Package
./mvnw -pl hms-jar clean package

# Run
./mvnw -pl hms-jar spring-boot:run
```

## Frontend Development

### Add a New Component

1. Generate component:

```bash
ng generate component features/module-name/component-name
```

2. Add service:

```bash
ng generate service core/services/module-name
```

3. Add route in `app.routes.ts`.
4. Implement template and logic.
5. Add required permissions.
6. Add module visibility checks when applicable.
7. Test in browser: http://localhost:4200

### Frontend Module Rule

When adding a tenant-restricted feature:

1. Add the module code.
2. Add the required permissions.
3. Add the backend module mapping.
4. Protect the API with `ModuleAccessFilter`.
5. Add the module to the tenant's available entitlements.
6. Add module + permission checks to the Angular sidebar.
7. Test both enabled and disabled tenant scenarios.

---

# Common Tasks

## Restart Everything

```bash
# Kill all services
pkill -f "spring-boot:run"
pkill -f "ng serve"

# Start fresh
docker compose up -d

cd hms-pom && ./mvnw -pl hms-jar spring-boot:run &

cd hms-pom/hms-webb/angular && npm start
```

## Reset Database

```bash
# Stop backend
pkill -f "spring-boot:run"

# Remove and recreate database
docker compose down -v
docker compose up -d

# Restart backend
cd hms-pom
./mvnw -pl hms-jar spring-boot:run
```

> **Warning:** `docker compose down -v` removes the PostgreSQL volume and therefore destroys the development database data.

## View Logs

### Backend

```bash
tail -f /tmp/backend.log
```

### Frontend

Watch the terminal where `npm start` is running.

### Database

```bash
docker logs hms-postgres-dev -f
```

---

# LAN Testing

The HMS can be tested from another device on the same local network.

For example, if the development/server computer has:

```text
192.168.1.68
```

the HMS may be accessed from another LAN device using:

```text
http://192.168.1.68:8081
```

The testing device and HMS server must:

* Be connected to the same LAN/Wi-Fi.
* Be able to reach the server's IP address.
* Have the required port accessible through the host firewall.
* Have the backend configured to listen on an appropriate network interface when LAN access is required.

### Important Development Note

During LAN testing, avoid permanently hardcoding a development machine IP into the application.

The preferred future approach is for the Angular application to derive or receive its API base URL through environment/deployment configuration.

Example environments:

```text
Local Development
http://localhost:8081

LAN Testing
http://192.168.x.x:8081

Production
https://hms.yourdomain.com
```

LAN testing is intended for development/testing only.

Production deployments should use:

* Domain name
* HTTPS
* Reverse proxy
* Firewall rules
* Production database configuration
* Secure secrets
* Monitoring and backups

---

# Module Entitlement Testing

The module entitlement system should be tested at both API and UI levels.

## Test 1 — Enabled Module

Atamba has:

```text
PHARMACY = ENABLED
```

A request to a protected pharmacy endpoint should be allowed when the user also has the required permission.

## Test 2 — Disabled Module

Atamba has:

```text
LABORATORY = DISABLED
```

A request to:

```text
/api/laboratory/...
```

should return:

```text
HTTP 403
MODULE_NOT_ENABLED
```

## Test 3 — Tenant Module List

Request:

```text
GET /api/tenant/modules
```

Expected response:

```json
[
  "BILLING",
  "DASHBOARD",
  "INVENTORY",
  "PHARMACY",
  "REPORTS"
]
```

This verifies that tenant-specific module configuration is being loaded from the database.

## Test 4 — Frontend Sidebar

When logged in as an Atamba user:

Expected visible modules:

```text
Dashboard
Pharmacy
Billing
Inventory
Stock Management
Reports
```

Disabled modules should not appear.

## Test 5 — Backend Security

Even if a disabled module is manually requested through the browser or an API client, the backend must reject the request.

Example:

```text
GET /api/laboratory/tests
```

Expected:

```text
403 MODULE_NOT_ENABLED
```

---

# Troubleshooting

## Backend won't start

```bash
# Check database connection
docker ps | grep postgres

# Should see:
# hms-postgres-dev running

# Check logs
tail -50 /tmp/backend.log | grep -i error
```

## Frontend won't start

```bash
cd hms-pom/hms-webb/angular

rm -rf node_modules package-lock.json

npm install
npm start
```

## Port already in use

### Backend — 8081

```bash
lsof -i :8081 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Frontend — 4200

```bash
lsof -i :4200 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Database — 5432

```bash
docker compose down
docker compose up -d
```

## Database connection issues

```bash
# Verify database is running
docker ps | grep postgres

# Check database configuration
cat hms-pom/hms-jar/src/main/resources/application.properties | grep datasource

# Test connection
docker exec hms-postgres-dev \
psql -U hms_user -d hms_database -c "SELECT 1"
```

## Tenant Module Endpoint Fails

If:

```text
GET /api/tenant/modules
```

fails:

1. Confirm the user is authenticated.
2. Confirm the JWT contains tenant information for a normal tenant user.
3. Confirm `TenantContextFilter` establishes the tenant.
4. Confirm the tenant exists in the database.
5. Confirm `TenantModule` records exist.
6. Confirm the modules are enabled.
7. Check browser Network/Console logs.
8. Check backend logs.
9. Confirm CORS configuration if frontend and backend are running on different origins.

---

# Performance Tips

## Frontend

* Use Chrome/Firefox DevTools Network tab to monitor requests.
* Check Application → LocalStorage for JWT token.
* Use Angular DevTools extension for component debugging.
* Avoid repeatedly requesting tenant module configuration.
* Keep module entitlement state in a shared service.

## Backend

* Monitor database queries in logs.
* Check Swagger UI to test endpoints directly.
* Use Spring Boot Actuator for metrics: `/actuator`.
* Keep tenant/module authorization close to the backend request pipeline.
* Index frequently queried tenant and foreign-key columns.

## Database

* Queries are indexed on primary/foreign keys.
* Connection pool should be configured for the deployment environment.
* Schema creation strategy should be appropriate for the environment.
* Production databases must use migrations/backups rather than relying on destructive development resets.

---

# Deployment Checklist

## Application

* [ ] Environment variables configured
* [ ] Production configuration reviewed
* [ ] Frontend built for production
* [ ] Backend packaged as JAR
* [ ] Docker images built
* [ ] Health checks configured
* [ ] Monitoring/logging set up

## Database

* [ ] Database backed up
* [ ] Database credentials secured
* [ ] Production schema verified
* [ ] Database access restricted
* [ ] Backup and recovery procedure tested

## Security

* [ ] SSL/HTTPS certificates installed
* [ ] JWT secret updated
* [ ] Secrets removed from source code
* [ ] CORS restricted to approved production origins
* [ ] Firewall configured
* [ ] Platform administration protected
* [ ] Tenant isolation tested
* [ ] Module entitlement enforcement tested
* [ ] RBAC permissions reviewed

## Multi-Tenant

* [ ] Tenant creation tested
* [ ] Tenant user creation tested
* [ ] Tenant isolation tested
* [ ] Plans configured
* [ ] Subscriptions configured
* [ ] Tenant modules configured
* [ ] Disabled modules return `403`
* [ ] Disabled modules are hidden in the frontend
* [ ] Platform admin can manage tenant modules

## Production

* [ ] Domain configured
* [ ] Reverse proxy configured
* [ ] HTTPS enabled
* [ ] Database backup schedule configured
* [ ] Monitoring configured
* [ ] Logging configured
* [ ] Load testing completed

---

# Architectural Rules

These rules should be followed when continuing development.

### Rule 1 — Backend is the Security Authority

Never rely only on Angular guards or hidden sidebar items.

Every protected feature must be enforced by the backend.

### Rule 2 — Module and Permission Are Different

A permission does not automatically mean the tenant has access to the module.

Both must be considered.

```text
Module Enabled
      +
Permission Granted
      =
Access
```

### Rule 3 — Tenant Context Comes From Authentication

Normal tenant users should not be allowed to simply provide an arbitrary `tenantId` and access another tenant's data.

The authenticated tenant context should be used.

### Rule 4 — New Paid Modules Must Be Entitlement-Aware

Any feature that may be sold as part of a plan should be integrated with:

* `ModuleCode`
* `PlatformModule`
* `TenantModule`
* `ModuleAccessFilter`
* Required permissions
* Angular module visibility

### Rule 5 — UI Visibility Is Not Authorization

The following:

```text
Hide menu
```

is a user-experience feature.

The following:

```text
Backend returns 403
```

is the actual security enforcement.

### Rule 6 — Preserve the Multi-Tenant Architecture

New features should be designed so they can operate for:

```text
Tenant A
Tenant B
Tenant C
...
```

without requiring a separate application codebase for each customer.

---

# Documentation

| Document                          | Purpose                            |
| --------------------------------- | ---------------------------------- |
| **What-Is-This-Good-For.md**      | Business value & use cases         |
| **CLAUDE.md**                     | Project notes & guidance           |
| **architecture/README.md**        | Architecture overview & navigation |
| **architecture/ARCHITECTURE.md**  | System design & patterns           |
| **architecture/COMPONENTS.md**    | Detailed component breakdown       |
| **architecture/API_DESIGN.md**    | API specification                  |
| **architecture/DATA_FLOW.md**     | Data flow patterns & workflows     |
| **architecture/PROJECT_STATE.md** | Current project status             |

---

# Support & Contribution

## Reporting Issues

1. Check `architecture/PROJECT_STATE.md` for known issues.
2. Check logs for error messages.
3. Review `CLAUDE.md` for project notes.
4. Check tenant/module configuration if the issue involves restricted functionality.
5. Verify both user permissions and tenant module entitlement.

## Code Quality

* Follow Spring Boot conventions.
* Follow Angular conventions.
* Use meaningful variable names.
* Add comments for complex logic.
* Keep methods focused and small.
* Write tests for new features.
* Keep backend authorization separate from frontend presentation logic.
* Maintain tenant isolation.
* Document architectural changes.

---

# License & Credits

**Hospital Management System (HMS)**

Built with modern technologies and best practices.

---

# Quick Links

* 🌐 **Frontend:** http://localhost:4200
* 🔌 **Backend:** http://localhost:8081/api
* 📚 **API Docs:** http://localhost:8081/swagger-ui/index.html
* 📖 **Architecture:** [./architecture/](./architecture/)
* 💼 **About HMS:** [./What-Is-This-Good-For.md](./What-Is-This-Good-For.md)

---

**Ready to get started?** → [What Is This Good For?](./What-Is-This-Good-For.md)
