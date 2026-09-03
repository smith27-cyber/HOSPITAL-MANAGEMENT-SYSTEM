# HMS Architecture Documentation

**Last Updated:** 2026-09-03  
**Project:** Hospital Management System  
**Version:** 1.0

---

## Overview

This directory contains comprehensive architecture and design documentation for the Hospital Management System (HMS). These documents provide a complete understanding of the system's structure, components, data flow, and API design.

---

## Quick Start Guide

### New to HMS? Start Here:

1. **[PROJECT_STATE.md](./PROJECT_STATE.md)** - Current project status
   - What's complete, what's in progress
   - Status of all features and components
   - Known issues and roadmap

2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design overview
   - 3-tier architecture diagram
   - Layer responsibilities
   - Design patterns used
   - Security architecture

3. **[COMPONENTS.md](./COMPONENTS.md)** - Detailed component breakdown
   - All 13 feature modules explained
   - Frontend component structure
   - Backend service structure
   - Entity relationships

4. **[API_DESIGN.md](./API_DESIGN.md)** - API specifications
   - All REST endpoints documented
   - Request/response formats
   - Error handling
   - HTTP status codes

5. **[DATA_FLOW.md](./DATA_FLOW.md)** - How data flows through the system
   - Request/response patterns
   - Complex workflows (billing, consultations)
   - Error handling flow
   - Data transformation

---

## Document Directory

### Project Management
- **[PROJECT_STATE.md](./PROJECT_STATE.md)** (8 min read)
  - Feature completeness matrix
  - Component status
  - Integration status
  - Known issues and roadmap
  - **Best for:** Understanding what's done and what needs work

### System Design
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** (15 min read)
  - 3-tier architecture with diagrams
  - Detailed layer responsibilities
  - Core architectural patterns (DI, Repository, Service, DTO, Guard, Interceptor)
  - Authentication & security architecture
  - JWT token flow
  - Error handling architecture
  - **Best for:** Understanding overall system design and patterns

### Component Details
- **[COMPONENTS.md](./COMPONENTS.md)** (20 min read)
  - 13 feature modules detailed breakdown
  - Core infrastructure (auth, core, layout)
  - All backend services and repositories
  - Entity relationships and database design
  - Component communication patterns
  - **Best for:** Understanding specific components and their responsibilities

### API Reference
- **[API_DESIGN.md](./API_DESIGN.md)** (30 min reference)
  - Complete endpoint documentation
  - Request/response examples
  - Error response formats
  - HTTP status codes
  - Pagination and filtering
  - **Best for:** Implementing API integrations and understanding endpoints

### Data Flows
- **[DATA_FLOW.md](./DATA_FLOW.md)** (20 min read)
  - General request/response flow
  - Patient registration flow (detailed)
  - Appointment scheduling flow
  - Consultation & prescription flow
  - Billing workflow
  - Read/query flow
  - Error handling flow
  - Data transformation
  - **Best for:** Understanding how specific operations work end-to-end

---

## System at a Glance

### Technology Stack

**Frontend:**
- Angular 22.1.0
- TypeScript 6.0.2
- Material Design
- Chart.js for analytics
- RxJS for reactive programming

**Backend:**
- Spring Boot 4.1.1
- Java 21
- PostgreSQL
- Spring Data JPA
- Spring Security
- JWT Authentication

### Architecture Type
- **Pattern:** 3-tier client-server
- **API Style:** RESTful
- **Authentication:** JWT tokens
- **Database:** Relational (PostgreSQL)

### Key Statistics
- **13** feature modules
- **14** entity types (13 mapped + 1 auth)
- **13** services
- **80+** Java files
- **14** Angular services
- **6** core infrastructure components

---

## Feature Overview

### Core Modules

| Module | Status | Purpose |
|--------|--------|---------|
| **Dashboard** | ✅ Complete | Analytics and KPIs |
| **Patients** | ✅ Complete | Patient management |
| **Doctors** | ✅ Complete | Doctor profiles and assignments |
| **Departments** | ✅ Complete | Department management |
| **Appointments** | ✅ Complete | Scheduling with queue management |
| **Consultations** | ✅ Complete | Consultation records and notes |
| **Pharmacy** | ✅ Complete | Prescriptions and stock management |
| **Laboratory** | ✅ Complete | Lab tests and request tracking |
| **Billing** | ✅ Complete | Invoicing and payment processing |
| **Inventory** | ✅ Complete | Equipment and supply tracking |
| **Reports** | ✅ Complete | Analytics and reporting |
| **Settings** | ⚠️ Frontend Only | System configuration (frontend only) |
| **Authentication** | ✅ Complete | Login and JWT management |

---

## Architecture Layers Explained

### Presentation Layer (Angular)
- User interface components
- Form validation
- Routing and navigation
- Material Design components
- Lazy-loaded feature modules

### API Gateway Layer (Spring Boot Controllers)
- HTTP endpoint handling
- Request validation
- Authentication verification
- Response formatting
- Error handling

### Business Logic Layer (Spring Services)
- Business rule implementation
- Data validation
- Cross-entity operations
- Transaction management
- Workflow orchestration

### Data Access Layer (Spring Data JPA)
- Repository interfaces
- Query building
- Entity lifecycle management
- Relationship mapping
- Transaction coordination

### Database Layer (PostgreSQL)
- Persistent data storage
- ACID transactions
- Relationship enforcement
- Data integrity
- Query optimization

---

## Common Use Cases

### Looking for Information About...

**"How do I add a new feature?"**
→ See [ARCHITECTURE.md - Architectural Patterns](./ARCHITECTURE.md#core-architectural-patterns)

**"What are all the API endpoints?"**
→ See [API_DESIGN.md - All Endpoints](./API_DESIGN.md)

**"How does authentication work?"**
→ See [ARCHITECTURE.md - Authentication & Security](./ARCHITECTURE.md#authentication--security-architecture)

**"Where is the Patient entity defined?"**
→ See [COMPONENTS.md - Entity Layer](./COMPONENTS.md#entity-layer-database-models)

**"How does a consultation get created?"**
→ See [DATA_FLOW.md - Consultation & Prescription Flow](./DATA_FLOW.md#consultation--prescription-flow)

**"What's the current project status?"**
→ See [PROJECT_STATE.md - Current Status](./PROJECT_STATE.md#current-status-overview)

**"How do payments get processed?"**
→ See [DATA_FLOW.md - Billing Flow](./DATA_FLOW.md#billing-flow)

**"What are the database relationships?"**
→ See [DATA_FLOW.md - Database Relationships](./DATA_FLOW.md#database-relationships)

---

## Key Architectural Concepts

### Dependency Injection
All services use Spring's DI container for loose coupling and testability.

### Repository Pattern
Each entity has a repository for data access, abstracting the database layer.

### Service Layer Pattern
Business logic is isolated in service classes, separate from controllers and entities.

### DTO Pattern
Data Transfer Objects separate the API contract from database entities.

### Guard Pattern
Angular route guards protect routes and verify authentication before navigation.

### Interceptor Pattern
HTTP interceptors automatically add JWT tokens to requests and handle responses.

---

## Security Highlights

### Authentication
- JWT tokens issued on login
- Tokens stored in browser localStorage
- Automatic injection via HTTP interceptor
- Server-side token verification

### Authorization
- Route guards check authentication status
- Spring Security validates on backend
- Role-based access control ready (if needed)

### Data Protection
- HTTPS recommended for production
- Password encryption with BCrypt
- SQL injection prevention (JPA)
- CSRF protection (if enabled)

---

## Performance Considerations

### Frontend
- Lazy-loaded routes for code splitting
- Async pipe for reactive data binding
- Unsubscribe from observables to prevent memory leaks
- Material UI optimized for performance

### Backend
- Connection pooling for database
- JPA query optimization
- Pagination for large datasets
- Caching-ready architecture

### Database
- Indexed primary keys and foreign keys
- Proper schema normalization
- Query optimization with indices
- ACID transactions for data integrity

---

## Testing Strategy

### Frontend Testing
- Unit tests with Vitest
- Component tests for UI logic
- Integration tests for services
- E2E tests for workflows (recommended)

### Backend Testing
- Unit tests for services
- Integration tests with database
- API tests for endpoints
- Transaction tests for complex operations

---

## Deployment Readiness

### Pre-Deployment Checklist
- ✅ Code quality reviewed
- ✅ Security configuration in place
- ✅ Database schema finalized
- ✅ API endpoints tested
- ✅ Authentication working
- ✅ Error handling implemented
- ⏳ Full test coverage recommended
- ⏳ Performance testing recommended
- ⏳ Security audit recommended

### Production Requirements
- HTTPS/SSL certificates
- Environment-specific configuration
- Database backup strategy
- Monitoring and logging setup
- API rate limiting (recommended)

---

## Development Environment Setup

### Frontend
```bash
cd hms-frontend
npm install
npm start  # Runs on http://localhost:4200
```

### Backend
```bash
cd hms-backend
mvn clean install
mvn spring-boot:run  # Runs on http://localhost:8080
```

### Database
```
PostgreSQL running on localhost:5432
Default database: hms
```

---

## Common Development Tasks

### Adding a New Feature
1. Create entity in `hms-backend/src/main/java/com/hms/backend/entity/`
2. Create repository in `repository/` folder
3. Create service in `service/` folder
4. Create controller for API endpoints
5. Create Angular service in `hms-frontend/src/app/core/services/`
6. Create components in `hms-frontend/src/app/features/`
7. Add routes in `app.routes.ts`

### Adding an API Endpoint
1. Update service to call new endpoint
2. Add controller method in backend
3. Implement business logic in service layer
4. Add database query in repository
5. Document in API_DESIGN.md

### Debugging Data Flow
1. Enable browser DevTools network tab
2. Check interceptor in Auth tab
3. Monitor Network tab for requests
4. Review backend logs for errors
5. Check database with SQL queries

---

## Related Resources

### In This Project
- Main README in project root
- CLAUDE.md for project-specific guidance

### External Documentation
- [Angular Documentation](https://angular.io/docs)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Introduction](https://jwt.io/)

---

## Document Maintenance

### How to Update This Documentation

1. **Project State Changes**
   - Update [PROJECT_STATE.md](./PROJECT_STATE.md) when features complete
   - Update status tables and progress indicators

2. **Architecture Changes**
   - Update [ARCHITECTURE.md](./ARCHITECTURE.md) when design changes
   - Add diagrams for new patterns

3. **New Components**
   - Add to [COMPONENTS.md](./COMPONENTS.md) component table
   - Add routes and services documentation

4. **API Changes**
   - Update [API_DESIGN.md](./API_DESIGN.md) with new endpoints
   - Update request/response examples

5. **New Workflows**
   - Add flow diagrams to [DATA_FLOW.md](./DATA_FLOW.md)
   - Document step-by-step process

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-03 | Initial architecture documentation complete |

---

## Questions or Contributions?

For questions about this documentation or to suggest improvements:

1. Review relevant documentation section
2. Check if your question is answered in the docs
3. If not, check the PROJECT_STATE.md for known issues
4. Update documentation to clarify for next person

---

## Summary

The HMS (Hospital Management System) is a well-architected, feature-complete healthcare management platform built with modern technologies. This documentation provides everything needed to understand, maintain, and extend the system.

**Start with:** [PROJECT_STATE.md](./PROJECT_STATE.md) to understand current status  
**Understand system:** [ARCHITECTURE.md](./ARCHITECTURE.md) for design overview  
**Deep dive:** [COMPONENTS.md](./COMPONENTS.md) for detailed component information  
**Integrate with API:** [API_DESIGN.md](./API_DESIGN.md) for endpoint specifications  
**Debug workflows:** [DATA_FLOW.md](./DATA_FLOW.md) for operation flows  

---

**Last Updated:** 2026-09-03  
**Maintained by:** Development Team
