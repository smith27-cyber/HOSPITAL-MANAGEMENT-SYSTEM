# Hospital Management System (HMS)

A comprehensive, full-stack healthcare management platform built with **Angular**, **Spring Boot**, and **PostgreSQL**.

**[📖 What is this good for?](./What-Is-This-Good-For.md)** — Learn about HMS capabilities and benefits

---

## Quick Start

### Prerequisites

- **Java 21+** (Backend)
- **Node.js 20+** (Frontend)
- **Docker & Docker Compose** (PostgreSQL)
- **Maven 3.8+** (Build tool)

### Setup & Run (5 minutes)

#### 1. Start PostgreSQL Database
```bash
docker compose up -d
# PostgreSQL runs on localhost:5432
# Database: hms_database
# User: hms_user
# Password: leahsm27
```

#### 2. Start Backend (Spring Boot)
```bash
cd hms-pom/hms-jar
mvn spring-boot:run
# Backend runs on http://localhost:8081
# API endpoints: http://localhost:8081/api
# Swagger docs: http://localhost:8081/swagger-ui/index.html
```

#### 3. Start Frontend (Angular) — two ways, pick one

**Development (fast loop — use this day to day):**
```bash
cd hms-pom/hms-webb/angular
npm install  # First time only
npm start
# Frontend runs on http://localhost:4200
# proxy.conf.json forwards /api to hms-jar on :8081 automatically
```
No hot-reload trade-off here — this is the loop for active development.
Editing a `.ts` file rebuilds and refreshes automatically.

**Packaged (production-like — for testing the real deployment shape):**
```bash
# Build the Angular app first — writes directly into hms-webb's static/
cd hms-pom/hms-webb/angular
npm run build

# Then run hms-webb, which serves that build + forwards /api to hms-jar
cd ../
mvn spring-boot:run
# Frontend + Web API run on http://localhost:8080
```
`hms-webb` does **not** hot-reload — a fresh `ng build` needs `hms-webb`
restarted (or at least `mvn compile`, then restarted) before it's served.
Nobody develops against this path directly; it exists to test the packaged
deployment shape. See [WEBB_MODULE.md](./dev/architecture/old/WEBB_MODULE.md)
for why.

#### 4. Access the Application
- **Web UI (dev):** http://localhost:4200
- **Web UI (packaged):** http://localhost:8080
- **API Docs:** http://localhost:8081/swagger-ui/index.html
- **OpenAPI JSON:** http://localhost:8081/api-docs

---

## Project Structure

```
HMS/
├── hms-pom/                  # Maven multi-module parent
│   ├── hms-jar/               # Spring Boot REST API
│   │   ├── src/main/java/
│   │   │   └── com/hms/backend/
│   │   │       ├── auth/         # Authentication, JWT, RBAC (User/Role/Permission)
│   │   │       ├── config/       # Configuration (Security, OpenAPI)
│   │   │       ├── controller/   # REST endpoints
│   │   │       ├── service/      # Business logic (16 services)
│   │   │       ├── repository/   # Data access layer
│   │   │       ├── entity/       # JPA entities (18 entities)
│   │   │       └── dto/          # Data transfer objects
│   │   ├── pom.xml               # Maven dependencies
│   │   └── application.properties # Configuration
│   │
│   └── hms-webb/              # Frontend Spring Boot module (Web API + static serving)
│       ├── src/main/java/com/hms/webb/
│       │   ├── HmsWebbApplication.java
│       │   ├── config/SpaWebConfig.java              # SPA-routing fallback
│       │   └── controller/WebApiForwardController.java  # forwards /api/** to hms-jar
│       ├── src/main/resources/
│       │   └── static/           # `ng build` writes directly here (gitignored)
│       ├── pom.xml               # spring-boot-starter-webmvc + devtools, port 8080
│       └── angular/              # Angular 22.1.0 UI
│           ├── src/app/
│           │   ├── auth/             # Login & authentication
│           │   ├── core/             # Shared services & guards
│           │   ├── features/         # 13 feature modules
│           │   ├── layout/           # Main layout wrapper
│           │   ├── shared/           # Shared models & utilities
│           │   └── app.routes.ts     # Route definitions
│           ├── proxy.conf.json   # ng serve dev proxy → hms-jar:8081
│           ├── package.json
│           └── angular.json
│
├── dev/                       # Working docs not shipped as end-user docs
│   ├── architecture/          # Comprehensive documentation
│   │   ├── old/                # Docs describing the CURRENT system (13 concern-based files)
│   │   │   ├── README.md             # Navigation index
│   │   │   ├── KNOWN_ISSUES.md       # Open issues (P0-P3) — start here
│   │   │   ├── STATUS_OVERVIEW.md    # Current status
│   │   │   ├── FEATURE_COMPLETENESS.md
│   │   │   ├── TESTING_STATUS.md
│   │   │   ├── SYSTEM_DESIGN.md      # 3-tier architecture, patterns
│   │   │   ├── SECURITY.md           # Auth, JWT, RBAC, CORS
│   │   │   ├── DATABASE_DESIGN.md
│   │   │   ├── OPERATIONS.md         # Error handling, performance, deployment
│   │   │   ├── FRONTEND_COMPONENTS.md
│   │   │   ├── BACKEND_COMPONENTS.md
│   │   │   ├── DATA_MODEL.md
│   │   │   ├── API_DESIGN.md
│   │   │   ├── DATA_FLOW.md
│   │   │   └── CLAUDE.md             # Documentation fixes log
│   │   └── future/             # Proposed future-state designs (currently empty —
│   │                            # last proposal, hms-webb, was implemented & promoted)
│   └── planning/               # Implementation plans for proposed changes
│       ├── hms-webb-morph-plan.md    # Plan index
│       └── phases/                    # One file per phase, with checklists
│
├── docker-compose.yml        # PostgreSQL container setup
├── CLAUDE.md                 # Project-specific guidance
├── What-Is-This-Good-For.md  # Business value document
└── README.md                 # This file
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Angular | 22.1.0 |
| **Frontend UI** | Material Design | Latest |
| **Frontend Build** | TypeScript | 6.0.2 |
| **Backend** | Spring Boot | 4.1.1 |
| **Backend API** | Spring Web MVC | 4.1.1 |
| **Data Access** | Spring Data JPA | 4.1.1 |
| **Security** | Spring Security + JWT | 4.1.1 / 0.12.6 |
| **Database** | PostgreSQL | 15-Alpine |
| **Containerization** | Docker | Latest |
| **API Docs** | Swagger/OpenAPI | 2.6.0 |

---

## Features (14 Modules)

✅ **Patient Management** — Register, track, view patient profiles  
✅ **Doctor Management** — Doctor profiles, specializations, departments  
✅ **Appointments** — Schedule, queue management, status tracking  
✅ **Consultations** — Clinical notes, diagnoses, treatment plans  
✅ **Admissions** — Inpatient admission, ward/bed assignment, transfer, discharge  
✅ **Pharmacy** — Prescriptions, medication inventory, stock tracking  
✅ **Laboratory** — Lab tests, requests, results management  
✅ **Billing** — Invoices, payment tracking, financial reports  
✅ **Inventory** — Equipment and supply management  
✅ **Reports** — Analytics, dashboards, metrics  
✅ **Settings** — Hospital configuration (backend-backed), system preferences  
✅ **Dashboard** — Real-time metrics and KPIs  
✅ **Authentication & RBAC** — Login, JWT tokens, roles & permissions  
✅ **Departments** — Department management and organization  

---

## API Endpoints

### Base URL
```
http://localhost:8081/api
```

### Authentication
```
POST   /auth/login              # Login with credentials
POST   /auth/logout             # Logout
```

### Patients
```
GET    /patients                # List all patients
POST   /patients                # Create patient
GET    /patients/{id}           # Get patient details
PUT    /patients/{id}           # Update patient
DELETE /patients/{id}           # Delete patient
```

### Appointments
```
GET    /appointments            # List appointments
POST   /appointments            # Schedule appointment
GET    /appointments/{id}       # Get appointment details
PUT    /appointments/{id}       # Update appointment
DELETE /appointments/{id}       # Cancel appointment
GET    /appointments/queue      # Get queue
```

### Consultations
```
GET    /consultations           # List consultations
POST   /consultations           # Create consultation
GET    /consultations/{id}      # Get consultation
PUT    /consultations/{id}      # Update consultation
```

### Billing
```
GET    /billing                 # List invoices
POST   /billing                 # Create invoice
GET    /billing/{id}            # Get invoice details
POST   /billing/{id}/payments   # Record payment
```

**[Complete API Documentation →](./dev/architecture/old/API_DESIGN.md)**

---

## Database Schema

### Entities (18 Total)
- User (auth)
- Role (auth/RBAC)
- Permission (auth/RBAC)
- Patient
- Doctor
- Department
- Appointment
- Consultation
- Admission
- PharmacyPrescription
- PharmacyPrescriptionItem
- LaboratoryTest
- LaboratoryRequest
- Billing
- BillingItem
- BillingPayment
- Inventory
- HospitalSettings

**Relationships:**
- Patient → Appointments, Consultations, Admissions, Billing
- Doctor → Appointments, Consultations, Departments, Admissions
- Consultation → Prescriptions, Billing
- Appointment → Consultation
- User → Role → Permissions

---

## Authentication & Security

### JWT Token Flow
1. User logs in with username/password
2. Backend validates and generates JWT token
3. Frontend stores token in localStorage
4. Token sent with every request in `Authorization` header
5. Backend verifies token signature
6. Request proceeds if valid

### Security Features
✅ JWT token-based authentication  
✅ Spring Security for authorization  
✅ BCrypt password encryption  
🟡 CORS configured for frontend access — one controller currently overrides the global policy, see [dev/architecture/old/KNOWN_ISSUES.md](./dev/architecture/old/KNOWN_ISSUES.md)  
✅ SQL injection prevention via JPA  
✅ HTTPS ready for production  

---

## Development

### Backend Development

#### Add a New Feature
1. **Create Entity** — `src/main/java/com/hms/backend/entity/`
2. **Create Repository** — `src/main/java/com/hms/backend/repository/`
3. **Create Service** — `src/main/java/com/hms/backend/service/`
4. **Create Controller** — `src/main/java/com/hms/backend/controller/`
5. **Create DTO** — `src/main/java/com/hms/backend/dto/`
6. **Test with Swagger** — http://localhost:8081/swagger-ui/index.html

#### Build & Run
```bash
cd hms-pom/hms-jar

# Compile
mvn clean compile

# Run tests
mvn test

# Package
mvn clean package

# Run
mvn spring-boot:run
```

### Frontend Development

#### Add a New Component
1. Generate component: `ng generate component features/module-name/component-name`
2. Add service: `ng generate service core/services/module-name`
3. Add route in `app.routes.ts`
4. Implement template and logic
5. Test in browser: http://localhost:4200

#### Build & Run
```bash
cd hms-pom/hms-webb/angular

# Install dependencies
npm install

# Development server
npm start

# Build production
npm run build

# Run tests
npm test
```

---

## Common Tasks

### Restart Everything
```bash
# Kill all services
pkill -f "spring-boot:run"
pkill -f "ng serve"

# Start fresh
docker compose up -d         # Database
cd hms-pom/hms-jar && mvn spring-boot:run &
cd hms-pom/hms-webb/angular && npm start
```

### Reset Database
```bash
# Stop backend
pkill -f "spring-boot:run"

# Remove and recreate database
docker compose down -v
docker compose up -d

# Restart backend (schema auto-created)
cd hms-pom/hms-jar && mvn spring-boot:run
```

### View Logs
```bash
# Backend logs
tail -f /tmp/backend.log

# Frontend logs
# Watch the terminal where `npm start` is running

# Database logs
docker logs hms-postgres-dev -f
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| **What-Is-This-Good-For.md** | Business value & use cases |
| **CLAUDE.md** | Project notes & guidance |
| **dev/architecture/old/README.md** | Architecture doc navigation (13 concern-based docs) |
| **dev/architecture/old/KNOWN_ISSUES.md** | Open issues (P0–P3) — start here for the honest picture |
| **dev/architecture/old/STATUS_OVERVIEW.md** | Current project status |
| **dev/architecture/old/SYSTEM_DESIGN.md** | System design & patterns |
| **dev/architecture/old/SECURITY.md** | Auth, JWT, RBAC, CORS |
| **dev/architecture/old/FRONTEND_COMPONENTS.md** / **BACKEND_COMPONENTS.md** | Component breakdowns |
| **dev/architecture/old/DATA_MODEL.md** | Entities & relationships |
| **dev/architecture/old/API_DESIGN.md** | API specification |
| **dev/architecture/old/DATA_FLOW.md** | Data flow patterns & workflows |
| **dev/architecture/old/WEBB_MODULE.md** | The frontend Spring Boot module (`hms-webb`) — implemented |

---

## Troubleshooting

### Backend won't start
```bash
# Check database connection
docker ps | grep postgres
# Should see: hms-postgres-dev running

# Check logs
tail -50 /tmp/backend.log | grep -i error
```

### Frontend won't start
```bash
# Clear node_modules and reinstall
cd hms-pom/hms-webb/angular
rm -rf node_modules package-lock.json
npm install
npm start
```

### Port already in use
```bash
# Backend (8081)
lsof -i :8081 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Frontend (4200)
lsof -i :4200 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Database (5432)
docker compose down
docker compose up -d
```

### Database connection issues
```bash
# Verify database is running
docker ps | grep postgres

# Check database credentials in application.properties
cat hms-pom/hms-jar/src/main/resources/application.properties | grep datasource

# Test connection
docker exec hms-postgres-dev psql -U hms_user -d hms_database -c "SELECT 1"
```

---

## Performance Tips

### Frontend
- Use Chrome DevTools Network tab to monitor requests
- Check Application → LocalStorage for JWT token
- Use Angular DevTools extension for component debugging

### Backend
- Monitor database queries in logs (JPA SQL logging enabled)
- Check Swagger UI to test endpoints directly
- Use Spring Boot actuator for metrics: `/actuator`

### Database
- Queries are indexed on primary/foreign keys
- Connection pool configured for performance
- Schema auto-created on first run

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backed up
- [ ] SSL/HTTPS certificates installed
- [ ] Secrets (JWT key) updated
- [ ] Frontend built for production
- [ ] Backend packaged as JAR
- [ ] Docker images built
- [ ] Health checks configured
- [ ] Monitoring/logging set up
- [ ] Load testing completed

---

## Support & Contribution

### Reporting Issues
1. Check [dev/architecture/old/KNOWN_ISSUES.md](./dev/architecture/old/KNOWN_ISSUES.md) for known issues
2. Check logs for error messages
3. Review [CLAUDE.md](./CLAUDE.md) for project notes

### Code Quality
- Follow Spring Boot conventions
- Use meaningful variable names
- Add comments for complex logic
- Keep methods focused and small
- Write tests for new features

---

## License & Credits

**Hospital Management System (HMS)**  
Built with modern technologies and best practices.

---

## Quick Links

- 🌐 **Frontend:** http://localhost:4200
- 🔌 **Backend:** http://localhost:8081/api
- 📚 **API Docs:** http://localhost:8081/swagger-ui/index.html
- 📖 **Architecture:** [./dev/architecture/](./dev/architecture/)
- 💼 **About HMS:** [./What-Is-This-Good-For.md](./What-Is-This-Good-For.md)

---

**Ready to get started?** → [What Is This Good For?](./What-Is-This-Good-For.md)
