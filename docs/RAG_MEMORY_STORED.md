# 🖖 RAG Memory: Infinite Retry Loop Anti-Pattern

**Status:** ✅ **STORED IN RAG**  
**Date:** November 27, 2025  
**Priority:** Critical  
**Crew:** All 10 crew members

## Summary

The infinite retry loop anti-pattern has been documented and stored in the RAG knowledge base to prevent future occurrences.

## Files Created

1. **RAG JSON File**: `rag-knowledge-base/anti-pattern-infinite-retry-loops.json`
   - Complete anti-pattern description
   - Solution pattern with examples
   - Implementation checklist
   - RAG memory format (Q&A pairs)

2. **Ingestion Script**: `scripts/store-retry-pattern-in-rag.js`
   - Automated ingestion into RAG via n8n webhook
   - Can be run manually: `npm run rag:ingest:retry-pattern`

3. **Documentation**: 
   - `docs/RAG_PATTERN_RETRY_LIMITS.md` - Pattern documentation
   - `docs/CREW_RETRY_LIMITS_COMPLETE.md` - Crew review summary
   - `docs/RAG_MEMORY_INGESTION_GUIDE.md` - Ingestion guide
   - `docs/RAG_MEMORY_STORED.md` - This file

## RAG Search Queries

The pattern will be searchable via these queries:

- "How do I prevent infinite retry loops in API calls?"
- "What happens if I use setInterval with fetch?"
- "How do I handle 404 errors in polling?"
- "API polling retry limits"
- "Infinite retry loop anti-pattern"
- "useRetryableFetch hook"

## Key Information Stored

### Anti-Pattern
- Infinite retry loops in API polling
- Impact on UX, resources, and development
- Common mistakes with examples

### Solution
- `useRetryableFetch` hook usage
- Configuration examples
- Implementation checklist
- Correct pattern examples

### RAG Memory Format
- Question/Answer pairs for semantic search
- Related patterns
- File references
- Examples (good and bad)

## Verification

To verify the pattern is stored:

1. **Query RAG**: "How do I prevent infinite retry loops in API calls?"
2. **Expected Answer**: Solution using `useRetryableFetch` hook with retry limits, exponential backoff, and cancellation
3. **Should Include**: Implementation checklist and examples

## Usage

### For Developers
When creating new polling components, query RAG:
- "How do I prevent infinite retry loops?"
- "API polling best practices"

### For Code Review
When reviewing code, check for:
- `setInterval` + `fetch` patterns
- Missing retry limits
- No cancellation capability

### For AI Assistants
When suggesting code, reference:
- `useRetryableFetch` hook
- Retry limits (max 5)
- Exponential backoff
- User warnings

## Maintenance

### When to Update
- New retry patterns discovered
- Hook API changes
- New components need migration
- Additional examples needed

### Update Process
1. Update JSON file: `rag-knowledge-base/anti-pattern-infinite-retry-loops.json`
2. Update documentation: `docs/RAG_PATTERN_RETRY_LIMITS.md`
3. Re-ingest: `npm run rag:ingest:retry-pattern`

## Crew Consensus

**All 10 crew members agree:** ✅

This pattern is now stored in RAG and will be referenced whenever:
- New polling components are created
- API retry patterns are discussed
- Code reviews identify potential infinite loops
- AI assistants suggest polling implementations

---

**🖖 Pattern stored. Future recurrence prevented.**

