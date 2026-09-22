# Task: Verify a real API call succeeds through `hms-webb`

**Phase:** [Phase 2 — Wire Angular's build output directly into `static/`](../../phases/phase-2-angular-output-wiring.md)
**Depends on:** [phase2-task3-verify-serving](../verify/phase2-task3-verify-serving.md), [phase2-task5-add-reverse-proxy](../verify/phase2-task5-add-reverse-proxy.md)
**Status:** Done — full end-to-end verification, with real data, real auth

Docker access became available in this environment (it wasn't earlier —
checked again rather than assumed still blocked). Started the project's
own `docker-compose.yml` Postgres, then `hms-jar` (port 8081) and
`hms-webb` (port 8080) together for a real test:

- **Public endpoint, both paths compared:** `curl http://localhost:8080/api/health`
  and `curl http://localhost:8081/api/health` returned the identical
  `200 HMS Backend is running successfully.` — `hms-webb` correctly
  relayed the real response body.
- **Auth-required endpoint, both paths compared:** `/api/departments`
  without a token returned an identical `403` through both `hms-webb` and
  `hms-jar` directly — same security behavior, not just same routing.
- **Full authenticated round-trip through `hms-webb` only:**
  `POST /api/auth/login` with a seeded test account
  (`test_doctor`/`doctor123`, from `RbacDataInitializer`) returned a real
  JWT. Using that token, `GET /api/departments` through `hms-webb`
  returned `200 []` — a real (if empty) authenticated response, not a
  connection error, not a 404, not a CORS failure.

This is the strongest form of verification available: real login, real
JWT, real protected data request, through the actual packaged path. Both
test servers stopped afterward; the Postgres container was left running
(the project's normal local dev database, not specific to this test).
