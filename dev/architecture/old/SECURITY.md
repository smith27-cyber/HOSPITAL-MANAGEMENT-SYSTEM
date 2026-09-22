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

`SecurityConfig.java` registers a global `CorsConfigurationSource` bean on
`/**`, restricting cross-origin access to `http://localhost:4200`. This is
**not consistently enforced** — see
[KNOWN_ISSUES.md](./KNOWN_ISSUES.md) (P0): `ConsultationController`
overrides it with `@CrossOrigin(origins = "*")`, opening its endpoints to
any origin. 15 of the other 17 controllers redundantly re-declare the same
`http://localhost:4200` origin (harmless boilerplate); `HealthController`
and `LoginFormController` carry no `@CrossOrigin` at all.

A future redesign of this policy — blocking CORS entirely in favor of
same-origin proxying in both dev and packaged modes — is proposed in
[../future/POM_STRUCTURE.md](../future/POM_STRUCTURE.md); not yet
implemented.

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
