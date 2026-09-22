# Task: Add `HmsWebbApplication` main class

**Phase:** [Phase 2 — Create the hms-webb Spring Boot module](../../phases/phase-2-create-hms-webb-module.md)
**Status:** Done

Create `hms-pom/hms-webb/src/main/java/com/hms/webb/HmsWebbApplication.java`:

```java
package com.hms.webb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HmsWebbApplication {
    public static void main(String[] args) {
        SpringApplication.run(HmsWebbApplication.class, args);
    }
}
```

Mirrors `hms-jar`'s `HmsBackendApplication` convention, under package `com.hms.webb` (new, sibling to
`com.hms.backend` — not nested inside it).
