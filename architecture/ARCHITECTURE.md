# HMS System Architecture

**Version:** 1.0  
**Last Updated:** 2026-09-03

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
├── features/          # 14 feature modules
├── layout/            # Main layout wrapper
├── app.routes.ts      # Route definitions
└── app.config.ts      # App configuration
```

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
Base URL: http://localhost:8080/api

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
- Service classes (13 services)
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

### 4. Data Access Layer (Repositories)

**Technology:** Spring Data JPA with Hibernate ORM

**Responsibilities:**
- Database interaction
- Query building and execution
- Entity lifecycle management
- Relationship mapping
- Transaction coordination

**Key Components:**
- Repository interfaces (13+ repositories)
- JPA entity classes (14+ entities)
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

## Authentication & Security Architecture

### JWT Token Flow

```
1. User Login
   ↓
2. POST /api/auth/login (username, password)
   ↓
3. Backend validates credentials
   ↓
4. JWT token generated (header.payload.signature)
   ↓
5. Token returned to frontend
   ↓
6. Frontend stores in localStorage
   ↓
7. AuthInterceptor adds to Authorization header
   ↓
8. Subsequent requests include token
   ↓
9. Backend verifies token signature
   ↓
10. Request proceeds if valid
```

### Security Layers

**Client-Side:**
- Route guards prevent unauthorized navigation
- Auth interceptor ensures token inclusion
- Local storage protects token

**Server-Side:**
- Spring Security validates tokens
- Controllers check authentication
- Services verify permissions
- Database constraints enforce data integrity

### Token Structure

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Header (Algorithm & Token Type)
  ↓
Payload (Claims - subject, name, issued at, expiration)
  ↓
Signature (HMAC SHA-256)
```

---

## Data Flow Patterns

### Create Patient Flow

```
User Interface
    ↓
PatientForm Component
    ↓
Validates Input
    ↓
Calls PatientService.createPatient(data)
    ↓
AuthInterceptor adds JWT token
    ↓
HTTP POST /api/patients
    ↓
PatientController.createPatient()
    ↓
PatientService.create()
    ↓
Business validation
    ↓
PatientRepository.save(patient)
    ↓
Hibernate generates INSERT SQL
    ↓
PostgreSQL executes query
    ↓
Database returns generated ID
    ↓
Response with patient object + ID
    ↓
Frontend navigates to patient profile
    ↓
Dashboard updates with new count
```

### Read & Display Data Flow

```
PatientList Component
    ↓
OnInit calls PatientService.getAll()
    ↓
HTTP GET /api/patients
    ↓
AuthInterceptor adds token
    ↓
PatientController.getAllPatients()
    ↓
PatientService.findAll()
    ↓
PatientRepository.findAll()
    ↓
Hibernate generates SELECT SQL
    ↓
PostgreSQL executes query
    ↓
Returns list of Patient entities
    ↓
Frontend receives JSON array
    ↓
Component binds to template
    ↓
User sees patient list with filtering/sorting
```

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
8. **Error Handling** - Catch and format exceptions

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

**Error Response:**
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

## Database Design Principles

### Entity Relationships

**One-to-Many:**
- Doctor → Appointments
- Department → Doctors
- Patient → Appointments
- Patient → Consultations
- Consultation → Prescriptions

**Many-to-One:**
- Appointment → Patient
- Appointment → Doctor
- Consultation → Patient

**One-to-One:**
- Appointment → Consultation (optional)

### Key Design Decisions

1. **Surrogate Keys** - All entities use Long IDs
2. **Timestamps** - created_at, updated_at on all entities
3. **Soft Deletes** - Logical deletion where needed
4. **Normalization** - 3NF applied throughout
5. **Indexing** - Foreign keys and frequently searched fields indexed
6. **Constraints** - NOT NULL, UNIQUE where appropriate

---

## Scalability Considerations

### Current Implementation

- Single database instance
- Synchronous API calls
- In-memory session storage
- No caching layer

### Future Improvements

1. **Database:**
   - Read replicas for scaling queries
   - Partitioning for large tables
   - Query optimization and indexing

2. **Caching:**
   - Redis for session storage
   - Database query result caching
   - Frontend HTTP caching

3. **Asynchronous Processing:**
   - Message queues for heavy operations
   - Async report generation
   - Email notifications via queue

4. **API:**
   - API versioning support
   - Rate limiting
   - Request pagination
   - Response compression

5. **Frontend:**
   - Build time optimization
   - Tree-shaking
   - Lazy component loading
   - Service worker caching

---

## Error Handling Architecture

### Frontend Error Handling

1. **Interceptor Level** - Catch HTTP errors
2. **Service Level** - Handle API errors
3. **Component Level** - Display user messages
4. **Global Handler** - Catch unhandled errors

### Backend Error Handling

1. **Controller Level** - Catch validation errors
2. **Service Level** - Business rule violations
3. **Repository Level** - Database errors
4. **Global Handler** - Format all errors consistently

### Error Response Structure

```java
{
  "timestamp": "2026-09-03T10:00:00Z",
  "status": 400,
  "error": "Validation Error",
  "message": "Email already exists",
  "path": "/api/patients"
}
```

---

## Performance Optimization Strategy

### Frontend

- Lazy load feature routes
- OnPush change detection
- Unsubscribe from observables
- Minimize bundle size

### Backend

- Connection pooling
- Query result caching
- Lazy load relationships
- Pagination for large datasets

### Database

- Index optimization
- Query plan analysis
- Connection limits
- Backup/recovery strategy

---

## Monitoring & Logging

### Implemented

- Basic Spring Boot logging
- HTTP request logging
- Error stack traces
- User action logging (basic)

### Recommended Additions

- Application performance monitoring (APM)
- Distributed tracing
- Database query logging
- Frontend error tracking
- User behavior analytics

---

## Deployment Architecture

```
Developer Machine
    ↓
GitHub Repository
    ↓
CI/CD Pipeline (Optional)
    ↓
Build Artifacts
    ↓
Production Environment
    ├── Frontend (Static files on web server)
    ├── Backend (Spring Boot JAR)
    └── Database (PostgreSQL instance)
```

---

## Related Documentation

- See [PROJECT_STATE.md](./PROJECT_STATE.md) for current status
- See [COMPONENTS.md](./COMPONENTS.md) for detailed component breakdown
- See [DATA_FLOW.md](./DATA_FLOW.md) for data flow patterns
- See [API_DESIGN.md](./API_DESIGN.md) for API specifications
