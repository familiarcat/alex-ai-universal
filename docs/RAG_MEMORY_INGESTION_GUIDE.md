# 🖖 RAG Memory Ingestion Guide - Retry Limits Pattern

**Purpose:** Ensure the infinite retry loop anti-pattern is stored in RAG for future reference

## Quick Start

### Automatic Ingestion (Recommended)
```bash
node scripts/store-retry-pattern-in-rag.js
```

### Manual Ingestion
1. Open n8n workflow: `knowledge-ingest`
2. Use the JSON file: `rag-knowledge-base/anti-pattern-infinite-retry-loops.json`
3. Trigger the workflow manually

## Pattern Details

### File Location
- **JSON**: `rag-knowledge-base/anti-pattern-infinite-retry-loops.json`
- **Documentation**: `docs/RAG_PATTERN_RETRY_LIMITS.md`
- **Crew Review**: `docs/CREW_RETRY_LIMITS_COMPLETE.md`

### Key Information Stored

1. **Anti-Pattern Description**
   - Infinite retry loops in API polling
   - Impact on UX, resources, and development

2. **Solution Pattern**
   - `useRetryableFetch` hook usage
   - Configuration examples
   - Implementation checklist

3. **Common Mistakes**
   - 5 common mistakes with examples
   - What NOT to do

4. **Correct Examples**
   - Progress Tracker example
   - Live Refresh example
   - Status Monitor example

5. **RAG Memory Format**
   - Question/Answer pairs for semantic search
   - Related patterns
   - File references

## RAG Search Queries

The pattern will be searchable via:

- "How do I prevent infinite retry loops?"
- "What happens if I use setInterval with fetch?"
- "How do I handle 404 errors in polling?"
- "API polling retry limits"
- "Infinite retry loop anti-pattern"

## Verification

After ingestion, verify the pattern is searchable:

1. Query RAG: "How do I prevent infinite retry loops in API calls?"
2. Should return: Solution using `useRetryableFetch` hook
3. Should include: Implementation checklist and examples

## Maintenance

### When to Update
- New retry patterns discovered
- Hook API changes
- New components need migration
- Additional examples needed

### Update Process
1. Update JSON file: `rag-knowledge-base/anti-pattern-infinite-retry-loops.json`
2. Update documentation: `docs/RAG_PATTERN_RETRY_LIMITS.md`
3. Re-ingest: `node scripts/store-retry-pattern-in-rag.js`

## Crew Consensus

**All 10 crew members agree:** This pattern must be stored in RAG to prevent recurrence.

---

**🖖 Make it so!**

