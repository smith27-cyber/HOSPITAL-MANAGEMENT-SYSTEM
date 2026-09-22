# HMS System Design

**Version:** 1.1
**Last Updated:** 2026-09-22

---

## System Overview

The Hospital Management System follows a **3-tier client-server architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│     Presentation Layer (Angular)        │
│   - Components                          │
│   - Services                            │
│   - Guards & Interceptors               │
│   - Material UI Components              │
└──────────────────┬──────────────────────┘
                   │
        HTTP/REST API (JSON)
        JWT Token Authentication
                   │
┌──────────────────▼──────────────────────┐
│  API Gateway & Business Logic           │
│  (Spring Boot Controllers & Services)   │
│   - Request Validation                  │
│   - Authentication/Authorization        │
│   - Business Logic Processing           │
│   - Exception Handling                  │
└──────────────────┬──────────────────────┘
                   │
        JDBC Connections
        JPA ORM Mapping
                   │
┌──────────────────▼──────────────────────┐
│  Data Access & Persistence Layer        │
│  (Spring Data JPA & Repositories)       │
│   - Entity Mapping                      │
│   - Query Building                      │
│   - Transaction Management              │
└──────────────────┬──────────────────────┘
                   │
      SQL Queries
                   │
┌──────────────────▼──────────────────────┐
│     PostgreSQL Database                 │
│   - Relational Data Storage             │
│   - ACID Transactions                   │
│   - Complex Relationships               │
└─────────────────────────────────────────┘
```

**Two separate Spring Boot processes**, not one: `hms-jar` (the Backend
API, port 8081 — everything in the "API Gateway & Business Logic" and
"Data Access" layers above) and `hms-webb` (port 8080 — serves the
Angular build and forwards `/api/**` to `hms-jar`). The diagram above
describes logical layers, not physical deployment — see
[WEBB_MODULE.md](./WEBB_MODULE.md) for how the two processes fit
together, and why `hms-jar` has no knowledge of the frontend at all.

---

## Architectural Layers

### 1. Presentation Layer (Frontend)

**Technology:** Angular 22.1.0 with TypeScript

**Responsibilities:**
- User interface rendering
- User interaction handling
- Form validation and submission
- State management
- Navigation and routing

**Key Components:**
- Standalone Angular components
- Material Design UI components
- Chart.js for data visualization
- Lazy-loaded feature modules

**Structure:**
```
src/app/
├── auth/              # Authentication feature
├── core/              # Shared services & guards
├── features/          # 13 feature modules
├── layout/            # Main layout wrapper
├── app.routes.ts      # Route definitions
└── app.config.ts      # App configuration
```

See [FRONTEND_COMPONENTS.md](./FRONTEND_COMPONENTS.md) for the full breakdown.

### 2. API Gateway Layer (Backend)

**Technology:** Spring Boot 4.1.1 with Spring Web MVC

**Responsibilities:**
- HTTP request handling
- Route management
- Request validation
- Authentication verification
- Exception handling and response formatting

**Key Components:**
- REST Controllers
- Exception handlers
- Request/response DTOs
- Input validation using annotations

**REST Endpoint Pattern:**
```
Base URL: http://localhost:8081/api

Endpoints:
- GET    /api/{resource}           # List all
- GET    /api/{resource}/{id}      # Get by ID
- POST   /api/{resource}           # Create new
- PUT    /api/{resource}/{id}      # Update
- DELETE /api/{resource}/{id}      # Delete
```

### 3. Business Logic Layer (Services)

**Technology:** Spring Services with Dependency Injection

**Responsibilities:**
- Business rule implementation
- Data validation and processing
- Cross-entity operations
- Transaction management
- Workflow orchestration

**Key Components:**
- Service classes (16 services)
- Business rule implementation
- Data transformation
- Transaction boundaries

**Service Architecture:**
```
Controllers
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
Entities (Models)
```

See [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md) for the full breakdown.

### 4. Data Access Layer (Repositories)

**Technology:** Spring Data JPA with Hibernate ORM

**Responsibilities:**
- Database interaction
- Query building and execution
- Entity lifecycle management
- Relationship mapping
- Transaction coordination

**Key Components:**
- Repository interfaces (16 repositories)
- JPA entity classes (18 entities)
- Custom query methods
- Lazy/Eager loading strategies

**Data Access Pattern:**
```
Repository Interface extends JpaRepository
    ↓
Spring Data provides CRUD operations
    ↓
Hibernate ORM handles SQL generation
    ↓
JDBC executes on PostgreSQL
```

See [DATA_MODEL.md](./DATA_MODEL.md) for entities and relationships.

### 5. Database Layer

**Technology:** PostgreSQL

**Responsibilities:**
- Persistent data storage
- Transaction management
- Relationship enforcement
- Data integrity
- Query optimization

**Key Features:**
- ACID transactions
- Foreign key constraints
- Composite keys where needed
- Indexes for performance

See [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) for design principles.

---

## Core Architectural Patterns

### 1. Dependency Injection (DI)

**Implementation:** Spring DI Container

**Benefits:**
- Loose coupling between components
- Easy testing with mock objects
- Centralized configuration
- Automatic lifecycle management

**Example:**
```java
@Service
public class PatientService {
    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }
}
```

### 2. Repository Pattern

**Implementation:** Spring Data JPA

**Benefits:**
- Abstraction of data access logic
- Database agnostic operations
- Reusable query methods
- Transaction management

**Example:**
```java
public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByNameContaining(String name);
    Optional<Patient> findByEmail(String email);
}
```

### 3. Service Layer Pattern

**Implementation:** Standalone service classes

**Benefits:**
- Business logic isolation
- Reusability across controllers
- Easy testing
- Transaction management at service level

### 4. DTO Pattern

**Implementation:** Data Transfer Objects

**Benefits:**
- Separation of API contract from entities
- Selective data exposure
- API versioning flexibility
- Security through data filtering

**Note:** this pattern is inconsistently applied in practice — see
[BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md)'s DTO Layer section; most
controllers currently bind `@RequestBody` directly to the JPA entity
instead.

### 5. Guard Pattern (Frontend)

**Implementation:** Angular CanActivate guards

**Benefits:**
- Route protection
- Authentication verification
- Authorization checks
- Redirect unauthenticated users

### 6. Interceptor Pattern (Frontend)

**Implementation:** Angular HTTP Interceptors

**Benefits:**
- Automatic JWT token injection
- Request/response transformation
- Error handling centralization
- Logging and monitoring

---

## API Gateway Responsibilities

### Request Processing

1. **Route Matching** - Determine handler based on path/method
2. **Authentication** - Verify JWT token validity
3. **Authorization** - Check user permissions
4. **Validation** - Validate request body structure and content
5. **Transformation** - Convert JSON to DTOs
6. **Processing** - Pass to service layer
7. **Response Formatting** - Convert response to JSON
8. **Error Handling** - Catch and format exceptions (see
   [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — this step is not yet implemented)

### Response Format

**Success Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2026-09-03T10:00:00Z"
}
```

**Error Response (intended, not yet implemented — see
[KNOWN_ISSUES.md](./KNOWN_ISSUES.md)):**
```json
{
  "error": "Invalid patient data",
  "message": "Email already exists",
  "status": 400,
  "timestamp": "2026-09-03T10:00:00Z"
}
```

---

## Service Layer Responsibilities

### Core Functions

1. **Business Rule Implementation** - Enforce hospital workflows
2. **Data Validation** - Validate beyond structure
3. **Data Transformation** - Convert between entities and DTOs
4. **Cross-Entity Operations** - Handle multi-entity transactions
5. **Workflow Orchestration** - Coordinate complex operations
6. **Error Handling** - Convert technical errors to business exceptions
7. **Transaction Management** - Manage @Transactional boundaries

### Service Examples

**PatientService:**
- Create patient with validations
- Update patient information
- Find patients by criteria
- Retrieve patient medical history

**AppointmentService:**
- Schedule appointment with conflict checking
- Cancel appointment
- Update appointment status
- Retrieve appointment history

**BillingService:**
- Create invoice from consultation
- Record payment
- Calculate totals
- Generate billing reports

---

## Component Communication Pattern

```
Frontend Component
    ↓
Calls Service Method
    ↓
HTTP Request (with JWT)
    ↓
AuthInterceptor adds token
    ↓
Backend Controller receives
    ↓
Validates request
    ↓
Calls Service method
    ↓
Service calls Repository
    ↓
Repository queries Database
    ↓
Data returned
    ↓
Service processes data
    ↓
Controller formats response
    ↓
HTTP Response
    ↓
AuthInterceptor processes
    ↓
Frontend Service handles
    ↓
Component updates UI
```

---

## Related Documentation

- [FRONTEND_COMPONENTS.md](./FRONTEND_COMPONENTS.md) — Angular feature modules
- [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md) — `hms-jar`'s Spring Boot layers
- [WEBB_MODULE.md](./WEBB_MODULE.md) — `hms-webb`, the frontend Spring Boot module
- [DATA_MODEL.md](./DATA_MODEL.md) — entities and relationships
- [SECURITY.md](./SECURITY.md) — authentication & authorization
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) — schema design, scalability
- [OPERATIONS.md](./OPERATIONS.md) — error handling, performance, deployment
- [API_DESIGN.md](./API_DESIGN.md) — API specifications
- [DATA_FLOW.md](./DATA_FLOW.md) — data flow patterns
- [STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md) — current project status
