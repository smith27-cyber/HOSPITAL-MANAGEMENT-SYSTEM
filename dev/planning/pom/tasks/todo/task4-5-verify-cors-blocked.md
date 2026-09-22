# Task: Verify CORS is genuinely blocked

**Phase:** [Phase 4 — Remove CORS from hms-jar entirely](../../phases/phase-4-remove-cors.md)
**Depends on:** All prior Phase 4 tasks
**Status:** Not started

With `hms-jar` running on 8081 (Postgres up via `docker-compose up -d`):

```
curl -H "Origin: http://evil.example" -i http://localhost:8081/api/departments
```

Expect `403` (JWT required — this endpoint was never reachable unauthenticated) with **no**
`Access-Control-Allow-Origin` header in the response — confirming CORS is closed at the source, not
just unused because nothing calls it cross-origin. Also test an actual preflight (`OPTIONS` with
`Origin` + `Access-Control-Request-Method` headers) and confirm the response still carries no CORS
headers even though `OPTIONS /**` is `permitAll()`.
