# HMS Database Design

**Version:** 1.1
**Last Updated:** 2026-09-22

---

## Key Design Decisions

1. **Surrogate Keys** - All entities use Long IDs
2. **Timestamps** - created_at, updated_at on all entities
3. **Soft Deletes** - Logical deletion where needed
4. **Normalization** - 3NF applied throughout
5. **Indexing** - Foreign keys and frequently searched fields indexed
6. **Constraints** - NOT NULL, UNIQUE where appropriate

See [DATA_MODEL.md](./DATA_MODEL.md) for the actual entity table and
relationship diagrams.

---

## Scalability Considerations

### Current Implementation

- Single database instance
- Synchronous API calls
- In-memory session storage
- No caching layer

### Future Improvements

1. **Database:**
   - Read replicas for scaling queries
   - Partitioning for large tables
   - Query optimization and indexing

2. **Caching:**
   - Redis for session storage
   - Database query result caching
   - Frontend HTTP caching

3. **Asynchronous Processing:**
   - Message queues for heavy operations
   - Async report generation
   - Email notifications via queue

4. **API:**
   - API versioning support
   - Rate limiting
   - Request pagination
   - Response compression

5. **Frontend:**
   - Build time optimization
   - Tree-shaking
   - Lazy component loading
   - Service worker caching

---

## Related Documentation

- [DATA_MODEL.md](./DATA_MODEL.md) — entities and relationships
- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) — overall architecture
- [OPERATIONS.md](./OPERATIONS.md) — performance optimization strategy
