# Task: Test: laboratory — catalog, requests, results

**Phase:** [Phase 6 — Pharmacy & Laboratory](../../phases/phase-6-pharmacy-laboratory.md)
**Depends on:** [task-6-1-pharmacy](./task-6-1-pharmacy.md)
**Status:** Not started

- Test catalog — list existing tests, register a new test (name, type,
  cost), confirm it's selectable when submitting a request afterward.
- Submit a lab request for a patient (optionally linked to a
  consultation, per `API_DESIGN.md`'s documented `consultationId` field)
  with one or more tests selected.
- Request list — filter by status; a submitted request should show as
  pending/submitted.
- Enter/view results on a request — confirm the UI for entering results
  exists and works. This is the actual clinical value of the module,
  don't skip it for being harder to script than a simple form.
- Completed request shows results correctly formatted, with reference
  ranges if the UI displays them (per `API_DESIGN.md`'s example
  payload).
- From a patient's profile or a consultation, confirm a link to related
  lab requests exists and works, if the app provides one.
