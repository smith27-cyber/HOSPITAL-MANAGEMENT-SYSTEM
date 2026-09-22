# HMS Operations — Error Handling, Performance, Monitoring, Deployment

**Version:** 1.1
**Last Updated:** 2026-09-22

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

**⚠️ Not implemented.** This describes the *intended* pattern only. There
is no `@ExceptionHandler`/`@ControllerAdvice` anywhere in the backend —
see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) (P1). The structure below is the
target shape, not current behavior.

### Error Response Structure (intended)

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

See [STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md)'s Performance Status for
what's actually been done vs. planned.

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

**Note:** this diagram predates the proposed `hms-webb` frontend module —
see [../future/POM_STRUCTURE.md](../future/POM_STRUCTURE.md) for the
target deployment shape (two Spring Boot processes, not one JAR plus
static files on a separate web server).

---

## Related Documentation

- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — error handling gap, other open issues
- [STATUS_OVERVIEW.md](./STATUS_OVERVIEW.md) — current performance/deployment status
- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) — overall architecture
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) — scalability considerations
