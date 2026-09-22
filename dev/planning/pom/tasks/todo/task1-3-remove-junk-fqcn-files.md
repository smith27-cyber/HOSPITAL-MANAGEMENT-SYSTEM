# Task: Remove stray FQCN-named junk files

**Phase:** [Phase 1 — Scaffold the module skeleton](../../phases/phase-1-scaffold-module.md)
**Status:** Not started

`git rm` the binary/garbage files sitting directly under `hms-pom/hms-jar/` (moved there from
`hms-backend/` root) whose filenames look like fully-qualified Java/Spring class names but are actually
unrelated data (confirmed via `file`: at least one is a raw PostScript document, not source):

- `com.hms.backend.auth.service.JwtService`
- `com.hms.backend.tenant.context.TenantContext`
- `jakarta.servlet.http.HttpServletRequest`
- `jakarta.servlet.http.HttpServletResponse`
- `org.springframework.stereotype.Component`
- (and any siblings matching `^(com|org|jakarta)\.[A-Za-z.]+$` directly under `hms-pom/hms-jar/` — run
  the glob fresh rather than trusting this list, since more may exist)

These are not part of the intentional migration — the same files, in the same broken form, exist on both
the `dev` branch's `hms-pom/hms-jar` and the `architecture/gsn-creating-a-new-pom-structure` branch,
confirming a shared-ancestor mishap rather than anything paul-specific. Confirm each candidate with
`file <path>` before removing, in case any genuinely-named file was swept up by the glob.
