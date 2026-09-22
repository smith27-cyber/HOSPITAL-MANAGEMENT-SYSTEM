# Task: Add `HmsWebbApplication` main class

**Phase:** [Phase 1 — Scaffold the Spring Boot module](../../phases/phase-1-scaffold-module.md)
**Depends on:** [phase1-task1-convert-packaging](./phase1-task1-convert-packaging.md)
**Status:** Done

Create `hms-webb/src/main/java/com/hms/webb/HmsWebbApplication.java`:

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

Mirrors `hms-jar`'s `HmsBackendApplication` convention, just under the
`com.hms.webb` package instead of `com.hms.backend`.
