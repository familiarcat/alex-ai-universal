# 📚 Active Documentation

**Purpose:** Current, actively-used documentation for ongoing development

## Directory Structure

```
active/
├── architecture/       # Current architecture documentation
│   ├── DDD_ARCHITECTURE_GUIDE.md
│   ├── DDD_MIGRATION_COMPLETE.md
│   └── AUTONOMOUS_CREW_CAPABILITIES.md
├── guides/            # How-to guides and references
│   ├── RAG_INTEGRATION_GUIDE.md
│   └── N8N_RAG_DEPLOYMENT_STEPS.md
└── references/        # API docs, cheat sheets, quick refs
```

## Document Lifecycle

**1. Active (Here)**
- Actively referenced during development
- Updated regularly
- Critical for current work

**2. Archived (docs/archive/)**
- Historical value only
- Content ingested to RAG
- Can be pruned after RAG verification

**3. Pruned (Deleted)**
- Content confirmed in RAG system
- Older than 3 months
- No longer needed in repository

## When to Archive

Move documents to archive when:
- ✅ Project phase is complete
- ✅ Planning is executed
- ✅ Session is closed
- ✅ Milestone is achieved

Example:
```bash
# After completing a milestone
mv MILESTONE_XYZ.md docs/archive/milestones/

# After session ends
mv SESSION_SUMMARY_DATE.md docs/archive/sessions/
```

## When to Prune

Run pruning script monthly:
```bash
# Dry run (safe - see what would happen)
node scripts/verify-rag-and-prune.js --dry-run

# Actual pruning (after verifying RAG)
node scripts/verify-rag-and-prune.js
```

**Safety:** Only deletes after RAG verification + 90-day retention

---

**Lt. Cmdr. La Forge:** "Keep root clean, keep knowledge safe in RAG!"

