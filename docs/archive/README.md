# 📚 Archive - Historical Documentation

**Purpose:** Historical session documents and planning files after content is ingested to RAG

## Archival Policy

Documents are moved here when:
1. ✅ Content has been ingested to RAG system (Supabase)
2. ✅ Verified in knowledge base via search query
3. ✅ RAG ingestion log confirms successful embedding
4. ✅ Document no longer needed for active development

## Pruning Schedule

**Monthly Review:**
- Check RAG ingestion logs
- Verify archived docs are searchable in knowledge base
- Delete docs older than 3 months (if RAG-verified)

## Directory Structure

```
archive/
├── sessions/           # Session summaries and reports
├── milestones/         # Completed milestone documentation  
├── planning/           # Planning and analysis documents
├── crew-meetings/      # Observation lounge transcripts
└── deprecated/         # Outdated or superseded documents
```

## Safety Net

Before deleting ANY document:
1. Run: `node scripts/verify-rag-ingestion.js <filename>`
2. Confirm knowledge is searchable in Supabase
3. Keep backup in `archive/` for 3 months
4. Only permanent delete after 3-month retention

**Lt. Cmdr. La Forge:** "This keeps root clean while ensuring we never lose knowledge!"

