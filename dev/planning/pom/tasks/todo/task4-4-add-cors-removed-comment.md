# Task: Document why CORS is absent

**Phase:** [Phase 4 — Remove CORS from hms-jar entirely](../../phases/phase-4-remove-cors.md)
**Depends on:** task4-1, task4-2
**Status:** Done

Add a short comment block in `SecurityConfig.java`, where the CORS configuration used to be, explaining
the decision for future readers — matching the reference branch's own comment:

```java
// =================================================
// CORS — blocked entirely, no configuration.
//
// The delivering server (ng serve's dev proxy, or
// hms-webb's Web API forwarding layer when packaged)
// is the only thing the browser ever talks to; both
// forward /api/** to hms-jar server-side. There is
// never a legitimate cross-origin request to allow.
// =================================================
```
