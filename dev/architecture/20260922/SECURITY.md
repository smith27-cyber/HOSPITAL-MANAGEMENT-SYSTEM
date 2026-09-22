# HMS Security & Authentication

**Version:** 1.1
**Last Updated:** 2026-09-22

---

## JWT Token Flow

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

## Security Layers

**Client-Side:**
- Route guards prevent unauthorized navigation
- Auth interceptor ensures token inclusion
- Local storage protects token

**Server-Side:**
- Spring Security validates tokens
- Controllers check authentication
- Services verify permissions
- Database constraints enforce data integrity

## Token Structure

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Header (Algorithm & Type)
  ↓
Payload (Claims - subject, name, issued at, expiration)
  ↓
Signature (HMAC SHA-256)
```

---

## Role-Based Access Control (RBAC)

- `Role`/`Permission` entities, seeded by `RbacDataInitializer.java`
- `@PreAuthorize` authority checks per endpoint (e.g. `ADMISSION_VIEW`,
  `SETTINGS_HOSPITAL_UPDATE`)
- Managed via `UserController`/`UserService`

---

## CORS

Blocked entirely. `hms-jar` has no CORS configuration at all — no global
`CorsConfigurationSource` bean, no per-controller `@CrossOrigin`
annotations. It never needs to allow a cross-origin request because the
browser never makes one: whichever server delivered the page also answers
`/api/**`, by forwarding server-side rather than relying on CORS:

- **Dev (`ng serve`, port 4200):** `hms-webb/angular/proxy.conf.json`
  forwards `/api` to `hms-jar` (`http://localhost:8081`).
- **Packaged (`hms-webb`, port 8080):** `com.hms.webb.controller.WebApiForwardController`
  forwards `/api/**` to `hms-jar` server-side.

See [WEBB_MODULE.md](./WEBB_MODULE.md) for how `hms-webb` does this.

This used to be a live gap (`ConsultationController`'s
`@CrossOrigin(origins = "*")` overrode a global `:4200`-only policy,
opening its endpoints to any origin) — both the global bean and all 15
per-controller `@CrossOrigin` annotations were removed once the proxy
mechanism made them unnecessary.

---

## Error Handling & Security

There is no global exception handler
(`@ExceptionHandler`/`@ControllerAdvice`) anywhere in the backend — see
[KNOWN_ISSUES.md](./KNOWN_ISSUES.md) (P1). This means unhandled exceptions
(including authentication/authorization failures in unexpected code
paths) fall through to Spring Boot's default error response rather than a
controlled, consistent one.

---

## Related Documentation

- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) — overall architecture
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — CORS and error-handling gaps
- [BACKEND_COMPONENTS.md](./BACKEND_COMPONENTS.md) — `SecurityConfig` and other config classes
- [API_DESIGN.md](./API_DESIGN.md) — authentication endpoints
