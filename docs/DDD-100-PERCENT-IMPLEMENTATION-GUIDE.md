# DDD 100% Implementation Guide

**Goal**: Step-by-step guide to achieve complete DDD coverage across Alex AI

**Principle**: Every persistent piece of data flows through Client => n8n => Supabase

---

## Phase Execution Order

### Phase 1: RAG Foundation [CURRENT - Week 1]

**Status**: 99% Complete

**Remaining Task**:
```bash
# Run migration
scripts/open-supabase-sql-editor.sh
# Paste: supabase/migrations/003_create_knowledge_base_table.sql
# Click RUN

# Test
node scripts/store-crew-decision-in-rag.js \
  crew-memories/active/ddd-user-settings-implementation-2025-11-02.json
```

**Success Criteria**:
- ✅ knowledge_base table exists
- ✅ Webhook returns 200 OK
- ✅ Crew memory stored in Supabase
- ✅ Can query knowledge_base table

**DDD Coverage After**: 50%

---

### Phase 2: Crew Data [Weeks 2-3]

#### 2.1 Crew Members Table

**Migration**: `004_create_crew_members_table.sql` ✅ Created

**Steps**:
```bash
# 1. Run migration in Supabase SQL Editor
supabase/migrations/004_create_crew_members_table.sql

# 2. Create n8n workflows (copy from project-workflows template)
cp -r n8n-workflows/project-workflows n8n-workflows/crew-workflows
# Edit to use crew_members table

# 3. Deploy workflows
node scripts/deploy-crew-workflows.js

# 4. Migrate existing JSON files
node scripts/migrate-crew-json-to-supabase.js

# 5. Verify
node scripts/verify-crew-members-integration.js
```

**Success Criteria**:
- ✅ crew_members table with all 12 crew members
- ✅ Workflows active and responding
- ✅ All JSON data migrated
- ✅ CrewAssignmentSystem uses Supabase

**DDD Coverage After**: 60%

#### 2.2 Observation Lounge

**Migration**: `005_create_observations_table.sql` ✅ Created

**Steps**:
```bash
# 1. Run migration
# 2. Deploy observation workflows
# 3. Update Observation Lounge to persist
# 4. Link observations to knowledge_base sessions
```

**Success Criteria**:
- ✅ observations table exists
- ✅ Crew observations stored
- ✅ Can query by session, crew member, topic

**DDD Coverage After**: 65%

---

### Phase 3: Operational Intelligence [Weeks 4-5]

#### 3.1 Workflow Execution Logs

**Migration**: `006_create_workflow_executions_table.sql` ✅ Created

**Steps**:
```bash
# 1. Run migration
# 2. Add execution logging to all n8n workflows
# 3. Create execution-log-store workflow
# 4. Deploy and test
```

**Success Criteria**:
- ✅ All workflow runs logged
- ✅ Can query execution history
- ✅ Performance metrics tracked

**DDD Coverage After**: 72%

#### 3.2 Error Logging

**Migration**: `007_create_error_logs_table.sql` ✅ Created

**Steps**:
```bash
# 1. Run migration
# 2. Create global error handler in dashboard
# 3. Create error-log-store workflow
# 4. Deploy and test
```

**Success Criteria**:
- ✅ All errors logged to Supabase
- ✅ Can query error patterns
- ✅ Duplicate detection works

**DDD Coverage After**: 78%

#### 3.3 Analytics Events

**Migration**: `008_create_analytics_events_table.sql` ✅ Created

**Steps**:
```bash
# 1. Run migration
# 2. Add event tracking to state-manager
# 3. Create analytics-event-store workflow
# 4. Deploy and test
```

**Success Criteria**:
- ✅ Theme changes tracked
- ✅ Project edits tracked
- ✅ Can query usage patterns

**DDD Coverage After**: 85%

---

### Phase 4: Creative Content [Week 6]

**Migration**: `009_create_creative_content_table.sql` ✅ Created

**Steps**:
```bash
# 1. Run migration
# 2. Create creative-content workflows
# 3. Update Temporal app to use n8n
# 4. Test version control
```

**Success Criteria**:
- ✅ Screenplay content in Supabase
- ✅ Novel content in Supabase
- ✅ Version history works

**DDD Coverage After**: 92%

---

### Phase 5: Data Migration [Week 7]

**Goal**: Migrate all localStorage and JSON data to Supabase

**Scripts to Create**:
- `scripts/migrate-localstorage-to-supabase.js`
- `scripts/migrate-crew-json-to-supabase.js`
- `scripts/verify-all-migrations.js`

**Steps**:
```bash
# 1. Export localStorage data
node scripts/export-localstorage-data.js > data/localStorage-export.json

# 2. Migrate projects
node scripts/migrate-localstorage-to-supabase.js

# 3. Migrate crew members
node scripts/migrate-crew-json-to-supabase.js

# 4. Verify all data
node scripts/verify-all-migrations.js

# 5. Update state-manager to prioritize Supabase
# (localStorage becomes pure cache)
```

**Success Criteria**:
- ✅ All localStorage data in Supabase
- ✅ All JSON files migrated
- ✅ Zero data loss
- ✅ Supabase is authoritative source

**DDD Coverage After**: 98%

---

### Phase 6: Polish & Optimization [Week 8+]

#### 6.1 Multi-User Support (Optional)

**Only if needed**. Current single-user setup is fine for MVP.

**Migration**: `010_create_users_table.sql`

**Steps**:
```bash
# 1. Enable Supabase Auth
# 2. Create users table
# 3. Update all RLS policies for user isolation
# 4. Add login/logout flows
```

#### 6.2 Vector Search for RAG

**Enhancement**: Semantic search in knowledge_base

```sql
-- Install pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column
ALTER TABLE knowledge_base
ADD COLUMN content_embedding vector(1536);

-- Create vector index
CREATE INDEX ON knowledge_base
USING ivfflat (content_embedding vector_cosine_ops)
WITH (lists = 100);
```

**Integration**:
- Generate embeddings via OpenAI
- Store in knowledge_base
- Query using vector similarity

**DDD Coverage After**: 100% 🎉

---

## Automation Scripts Needed

### Already Created ✅
- `deploy-ddd-workflows.js`
- `deploy-settings-workflows.js`
- `deploy-and-activate-knowledge-ingest.js`
- `create-and-link-supabase-credential.js`
- `complete-rag-automation.js`

### To Create 📋

**Phase 2**:
- `scripts/deploy-crew-workflows.js`
- `scripts/migrate-crew-json-to-supabase.js`
- `scripts/deploy-observation-workflows.js`

**Phase 3**:
- `scripts/deploy-execution-log-workflow.js`
- `scripts/deploy-error-log-workflow.js`
- `scripts/deploy-analytics-workflow.js`
- `scripts/add-logging-to-all-workflows.js`

**Phase 4**:
- `scripts/deploy-creative-content-workflows.js`
- `scripts/integrate-temporal-with-supabase.js`

**Phase 5**:
- `scripts/export-localstorage-data.js`
- `scripts/migrate-localstorage-to-supabase.js`
- `scripts/verify-all-migrations.js`

**Phase 6**:
- `scripts/setup-vector-search.js`
- `scripts/generate-embeddings.js`

---

## Testing Strategy

### Per-Phase Testing

Each phase requires:
1. **Migration Test**: Table created with correct schema
2. **Workflow Test**: n8n workflows return 200 OK
3. **Integration Test**: Client => n8n => Supabase flow works
4. **Data Test**: Verify data integrity
5. **Performance Test**: Check query speed

### End-to-End Testing

After all phases:
```bash
# Run comprehensive test suite
node scripts/test-complete-ddd-integration.js

# Verify DDD coverage
node scripts/calculate-ddd-coverage.js
# Expected output: 100%
```

---

## Success Metrics

### DDD Coverage Progression

| Phase | Description | Coverage | Tables |
|-------|-------------|----------|--------|
| Current | Projects + Settings | 40% | 2 |
| Phase 1 | + Knowledge Base | 50% | 3 |
| Phase 2 | + Crew Data | 65% | 5 |
| Phase 3 | + Operational | 85% | 8 |
| Phase 4 | + Creative | 92% | 9 |
| Phase 5 | + Migration | 98% | 9 |
| Phase 6 | + Advanced | 100% | 9+ |

### Data Centralization

| Data Type | Before | After |
|-----------|--------|-------|
| Projects | localStorage + Supabase | Supabase only ✅ |
| Settings | localStorage + Supabase | Supabase only ✅ |
| Crew Profiles | JSON files | Supabase ✅ |
| Knowledge | Not stored | Supabase ✅ |
| Observations | Not stored | Supabase ✅ |
| Executions | n8n UI only | Supabase ✅ |
| Errors | Console only | Supabase ✅ |
| Analytics | Not tracked | Supabase ✅ |
| Creative | Separate app | Supabase ✅ |

---

## Rollback Strategy

### Per-Table Rollback

```sql
-- Drop table and all dependencies
DROP TABLE IF EXISTS {table_name} CASCADE;

-- Revert migration in migration_audit
-- (if using Supabase migrations system)
```

### Data Recovery

- Keep localStorage until Phase 5 complete
- Keep JSON files until migrations verified
- Use Supabase backups (daily automatic)

---

## Estimated Effort

### Conservative Timeline (12 weeks)
- Phase 1: 1 week (includes learning/testing)
- Phase 2: 3 weeks (crew data + testing)
- Phase 3: 3 weeks (operational intelligence)
- Phase 4: 2 weeks (creative content)
- Phase 5: 2 weeks (migration + verification)
- Phase 6: 1 week (polish)

### Aggressive Timeline (6 weeks)
- Phase 1: 3 days
- Phase 2: 1 week
- Phase 3: 1 week
- Phase 4: 1 week
- Phase 5: 1 week
- Phase 6: 3 days

### Minimal Viable (Focus on Core)
- Phase 1: Complete RAG (1 day) ← START HERE
- Phase 2.1: Crew Members (3 days)
- Phase 3.2: Error Logging (2 days)
- **Total**: 1 week to 75% coverage

---

## Next Immediate Actions

1. **Complete Phase 1** (Now):
   - Run `003_create_knowledge_base_table.sql`
   - Test RAG ingestion
   - Verify webhook works

2. **Review Roadmap** (Today):
   - Crew reviews all phases
   - Prioritize phases 2-6
   - Decide on timeline (aggressive vs conservative)

3. **Begin Phase 2** (This Week):
   - Deploy crew_members workflows
   - Start crew JSON migration

---

**🖖 "The path to 100% is built one table at a time."**  
— Chief O'Brien

**Status**: Roadmap Ready for Execution

