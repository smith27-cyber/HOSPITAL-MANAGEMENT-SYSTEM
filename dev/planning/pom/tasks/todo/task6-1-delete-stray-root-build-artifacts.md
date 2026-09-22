# Task: Delete stray build artifacts at the repo root

**Phase:** [Phase 6 — Repo-root cleanup and documentation](../../phases/phase-6-repo-cleanup.md)
**Status:** Not started

Delete `index.html`, `main-V6MMLPDK.js`, and `styles-4KNJEDFK.css` from the repository root — these carry
different content hashes than anything actually served from either module's `static/` folder, and
predate this migration as leftover clutter from an earlier accidental build/commit (already flagged in
`dev/architecture/old/KNOWN_ISSUES.md`). Not required for the migration to function; included here
because we're already touching build output in this area.
