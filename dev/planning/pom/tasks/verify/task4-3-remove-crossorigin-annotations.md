# Task: Remove `@CrossOrigin` from all controllers

**Phase:** [Phase 4 — Remove CORS from hms-jar entirely](../../phases/phase-4-remove-cors.md)
**Status:** Done

Remove the `@CrossOrigin(...)` annotation (and its now-unused import where it's the only reason for the
import) from all 20 controllers under `hms-pom/hms-jar` that carry one — this includes 19 controllers
using `@CrossOrigin(origins = "http://localhost:4200")` and, notably,
**`ConsultationController`'s `@CrossOrigin(origins = "*")`**, which was the one real gap (wide open to
any origin, not just `:4200`) rather than redundant boilerplate.

`ReceiptController` and `SystemPreferencesController` already have no `@CrossOrigin` — nothing to do for
those two.

This can be done as one grep-driven pass since it's the same one-line annotation in each file:
`grep -rl "@CrossOrigin" hms-pom/hms-jar/src/main/java` to enumerate, then remove the annotation line
(and the `org.springframework.web.bind.annotation.CrossOrigin` import) from each.
