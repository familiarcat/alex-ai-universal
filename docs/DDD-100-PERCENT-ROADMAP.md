# DDD 100% Integration Roadmap

**Goal**: Achieve complete Domain-Driven Design architecture across all Alex AI data

**Current Status**: 40% DDD Coverage  
**Target**: 100% DDD Coverage  
**Timeline**: 4-6 weeks (aggressive) | 8-12 weeks (sustainable)

**Principle**: Client => n8n => Supabase for ALL persistent state

---

## Current State

### ✅ Complete (100% DDD)
- **Projects**: Client => n8n => Supabase
- **User Settings**: Client => n8n => Supabase  
- **Credentials**: All via ~/.zshrc

### ⏳ In Progress (99% DDD)
- **Knowledge Base**: Workflow deployed, table pending

### ❌ Not Integrated (0% DDD)
- Crew Member Profiles (JSON files)
- Observation Lounge (not persistent)
- Workflow Execution Logs (n8n UI only)
- Error Logs (console only)
- Analytics Events (not tracked)
- Creative Content (separate app)
- localStorage Data (not migrated)

---

## Roadmap Phases

### Phase 1: Complete RAG Foundation (Week 1)
**Goal**: Finish knowledge_base table, establish crew memory system

**Tasks**:
1. ✅ Create migration: `003_create_knowledge_base_table.sql`
2. ✅ Deploy n8n workflow: `knowledge-ingest`
3. ⏳ Run migration (CURRENT BLOCKER)
4. ⏳ Test crew memory ingestion
5. ⏳ Verify RAG queries work

**DDD Impact**: 40% → 50%

---

### Phase 2: Crew Data Integration (Weeks 2-3)
**Goal**: Move all crew-related data to Supabase

#### 2.1 Crew Member Profiles

**Current**: JSON files in `crew-members/*.json`

**Migration**: `004_create_crew_members_table.sql`

```sql
CREATE TABLE crew_members (
  crew_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rank TEXT,
  role TEXT NOT NULL,
  department TEXT,
  
  -- Personality
  archetype TEXT,
  traits JSONB,
  catchphrases JSONB,
  
  -- Expertise
  primary_expertise TEXT[],
  secondary_expertise TEXT[],
  years_experience INTEGER,
  known_for TEXT[],
  
  -- AI Configuration
  preferred_models JSONB,
  system_prompt TEXT,
  temperature DECIMAL(3,2),
  guidelines TEXT[],
  
  -- Integrations
  n8n_workflow_id TEXT,
  webhook_path TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);
```

**n8n Workflows**:
- `crew-member-store` (POST /webhook/crew-member-store)
- `crew-member-retrieve` (GET /webhook/crew-member-retrieve)
- `crew-member-query` (POST /webhook/crew-member-query)

**Scripts**:
- `scripts/migrate-crew-members-to-supabase.js`

**Benefits**:
- Queryable crew expertise
- Versioned crew configurations
- Can assign crew dynamically based on DB queries
- Crew learning tracked over time

**DDD Impact**: 50% → 60%

#### 2.2 Observation Lounge Records

**Current**: Not persistent (in-memory discussion system)

**Migration**: `005_create_observations_table.sql`

```sql
CREATE TABLE observations (
  observation_id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  crew_member_id TEXT REFERENCES crew_members(crew_id),
  
  -- Observation Details
  topic TEXT NOT NULL,
  observation_type TEXT, -- analysis, recommendation, warning, insight
  content TEXT NOT NULL,
  supporting_evidence JSONB,
  
  -- Context
  related_to_session TEXT REFERENCES knowledge_base(session_id),
  tags JSONB,
  severity TEXT, -- info, low, medium, high, critical
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE
);
```

**n8n Workflows**:
- `observation-store` (POST /webhook/observation-store)
- `observation-retrieve` (GET /webhook/observation-retrieve)
- `observation-query` (POST /webhook/observation-query)

**Benefits**:
- Historical record of crew discussions
- Link observations to specific sessions
- Track which crew member made which observations
- Analyze crew wisdom over time

**DDD Impact**: 60% → 65%

---

### Phase 3: Operational Intelligence (Weeks 4-5)
**Goal**: Track system operations and performance

#### 3.1 Workflow Execution Logs

**Migration**: `006_create_workflow_executions_table.sql`

```sql
CREATE TABLE workflow_executions (
  execution_id BIGSERIAL PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  
  -- Execution Details
  execution_status TEXT NOT NULL, -- success, error, cancelled
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  
  -- Context
  trigger_source TEXT, -- webhook, schedule, manual
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  
  -- Metadata
  user_id TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**n8n Integration**:
- Add logging node to all workflows
- POST to /webhook/execution-log at start/end

**Benefits**:
- Track workflow performance
- Identify failing workflows
- Analyze execution patterns
- Debug issues with historical data

**DDD Impact**: 65% → 72%

#### 3.2 Error Logging

**Migration**: `007_create_error_logs_table.sql`

```sql
CREATE TABLE error_logs (
  error_id BIGSERIAL PRIMARY KEY,
  
  -- Error Details
  error_type TEXT NOT NULL, -- client, server, workflow, database
  error_code TEXT,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  
  -- Context
  source TEXT NOT NULL, -- component, file, workflow
  user_id TEXT DEFAULT 'default',
  session_id TEXT,
  request_url TEXT,
  request_method TEXT,
  
  -- Environment
  environment TEXT DEFAULT 'production',
  user_agent TEXT,
  
  -- Metadata
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT
);
```

**n8n Workflows**:
- `error-log-store` (POST /webhook/error-log)
- `error-query` (POST /webhook/error-query)

**Client Integration**:
- Add global error handler
- POST errors to n8n webhook

**Benefits**:
- Centralized error tracking
- Trend analysis (which errors are common?)
- Faster debugging with context
- Track resolution time

**DDD Impact**: 72% → 78%

#### 3.3 Analytics Events

**Migration**: `008_create_analytics_events_table.sql`

```sql
CREATE TABLE analytics_events (
  event_id BIGSERIAL PRIMARY KEY,
  
  -- Event Details
  event_type TEXT NOT NULL, -- page_view, theme_change, project_edit, etc.
  event_category TEXT NOT NULL, -- user_action, system_event, performance
  event_action TEXT NOT NULL,
  event_label TEXT,
  event_value NUMERIC,
  
  -- Context
  user_id TEXT DEFAULT 'default',
  session_id TEXT,
  page_url TEXT,
  referrer TEXT,
  
  -- Custom Data
  properties JSONB,
  
  -- Metadata
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**n8n Workflows**:
- `analytics-event-store` (POST /webhook/analytics-event)
- `analytics-query` (POST /webhook/analytics-query)

**Client Integration**:
- Wrap state updates with event tracking
- Track: theme changes, project edits, component adds, etc.

**Benefits**:
- Understand usage patterns
- Optimize UX based on data
- Track feature adoption
- Identify unused features

**DDD Impact**: 78% → 85%

---

### Phase 4: Creative Content Integration (Week 6)
**Goal**: Integrate Temporal and other creative projects

**Migration**: `009_create_creative_content_table.sql`

```sql
CREATE TABLE creative_content (
  content_id BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(project_id),
  
  -- Content Details
  content_type TEXT NOT NULL, -- screenplay, novel, outline, character
  content_format TEXT, -- fountain, markdown, json
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_version_id BIGINT REFERENCES creative_content(content_id),
  
  -- Metadata
  word_count INTEGER,
  character_count INTEGER,
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

**n8n Workflows**:
- `creative-content-store` (POST /webhook/creative-content-store)
- `creative-content-retrieve` (GET /webhook/creative-content-retrieve)
- `creative-content-version` (POST /webhook/creative-content-version)

**Integration**:
- Modify Temporal app to save via n8n
- Add version control for creative content
- Link to projects table

**Benefits**:
- Unified data layer for all projects
- Version history for creative work
- Backup and recovery
- Cross-project content search

**DDD Impact**: 85% → 92%

---

### Phase 5: Data Migration & Consolidation (Week 7)
**Goal**: Migrate existing localStorage data to Supabase

**Migration**: `010_create_migration_audit_table.sql`

```sql
CREATE TABLE migration_audit (
  migration_id BIGSERIAL PRIMARY KEY,
  migration_name TEXT NOT NULL,
  migration_type TEXT NOT NULL, -- localStorage, json_files, legacy
  
  -- Status
  status TEXT NOT NULL, -- pending, in_progress, completed, failed
  records_total INTEGER,
  records_migrated INTEGER,
  records_failed INTEGER,
  
  -- Details
  source_location TEXT,
  error_log JSONB,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

**Scripts**:
- `scripts/migrate-localstorage-to-supabase.js`
- `scripts/migrate-crew-json-to-supabase.js`
- `scripts/verify-data-migration.js`

**Tasks**:
1. Extract all localStorage data
2. Transform to Supabase schema
3. Validate data integrity
4. Migrate via n8n webhooks
5. Verify migration success
6. Update client to use Supabase as primary

**DDD Impact**: 92% → 98%

---

### Phase 6: Advanced Features (Week 8+)
**Goal**: Polish and optimize

#### 6.1 Multi-User Support (If Needed)

**Migration**: `011_create_users_table.sql`

```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  
  -- Profile
  full_name TEXT,
  avatar_url TEXT,
  
  -- Settings
  preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Auth (via Supabase Auth)
  auth_id UUID REFERENCES auth.users(id),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);
```

**Integration**:
- Enable Supabase Auth
- Update RLS policies for user isolation
- Add user_id to all tables
- Implement login/logout flows

**DDD Impact**: 98% → 100%

#### 6.2 Vector Search for RAG

**Enhancement**: Add vector embeddings to `knowledge_base`

```sql
ALTER TABLE knowledge_base
ADD COLUMN content_embedding vector(1536);

CREATE INDEX ON knowledge_base
USING ivfflat (content_embedding vector_cosine_ops);
```

**Integration**:
- Generate embeddings via OpenAI
- Store embeddings in Supabase
- Implement semantic search
- RAG becomes truly intelligent

**DDD Impact**: Maintains 100%, improves quality

---

## Implementation Order

### Week 1: Foundation
- [ ] Complete knowledge_base table (Phase 1)
- [ ] Test RAG end-to-end
- [ ] Document RAG usage

### Week 2-3: Crew Integration
- [ ] Create crew_members table (Phase 2.1)
- [ ] Migrate crew JSON files
- [ ] Create observations table (Phase 2.2)
- [ ] Deploy crew workflows

### Week 4-5: Operational Intelligence
- [ ] Create workflow_executions table (Phase 3.1)
- [ ] Create error_logs table (Phase 3.2)
- [ ] Create analytics_events table (Phase 3.3)
- [ ] Add logging to all components

### Week 6: Creative Content
- [ ] Create creative_content table (Phase 4)
- [ ] Integrate Temporal app
- [ ] Test version control

### Week 7: Data Migration
- [ ] Migrate localStorage (Phase 5)
- [ ] Migrate all JSON files
- [ ] Verify data integrity

### Week 8+: Advanced Features
- [ ] Multi-user (if needed) (Phase 6.1)
- [ ] Vector search (Phase 6.2)
- [ ] Performance optimization

---

## Automation Strategy

### Migration Templates

All migrations follow this pattern:
1. Create table with proper schema
2. Add indexes for performance
3. Enable RLS with appropriate policies
4. Add triggers for auto-updates
5. Seed with default/migrated data

### n8n Workflow Templates

All workflows follow this pattern:
1. Webhook trigger (POST/GET)
2. Validate & Transform
3. Supabase operation (insert/select/update)
4. Response (success/error)
5. Optional: Log execution

### Deployment Scripts

All deployments use:
- `deploy-{feature}-workflows.js` - Deploy to n8n
- `migrate-{feature}-data.js` - Migrate existing data
- `verify-{feature}-integration.js` - Test end-to-end

---

## Success Metrics

### DDD Coverage
- **Current**: 40%
- **Phase 1**: 50%
- **Phase 2**: 65%
- **Phase 3**: 85%
- **Phase 4**: 92%
- **Phase 5**: 98%
- **Phase 6**: 100%

### Data Centralization
- **Current**: 3 tables in Supabase
- **Target**: 11+ tables in Supabase
- **Coverage**: All persistent state

### Automation
- **Current**: 86% (6/7 steps)
- **Target**: 95%+ (only auth remains manual)

---

## Risk Mitigation

### Data Loss Prevention
- Always test migrations on non-production first
- Keep original data until verified
- Use migration_audit table to track

### Performance
- Add indexes proactively
- Monitor query performance
- Use RLS but optimize policies

### Breaking Changes
- Maintain localStorage as fallback during migration
- Gradual rollout (feature flags if needed)
- Comprehensive testing

---

## Crew Assignment

### Phase 1 (RAG)
- **Lead**: Commander Data (Architecture)
- **Support**: Lt. Cmdr. La Forge (Infrastructure)

### Phase 2 (Crew Data)
- **Lead**: Counselor Troi (Crew expertise)
- **Support**: Chief O'Brien (Migration scripts)

### Phase 3 (Operational)
- **Lead**: Lt. Cmdr. La Forge (Monitoring)
- **Support**: Lt. Worf (Security/RLS)

### Phase 4 (Creative)
- **Lead**: Chief O'Brien (Integration)
- **Support**: Commander Data (Schema)

### Phase 5 (Migration)
- **Lead**: Chief O'Brien (Pragmatic execution)
- **Support**: All crew (verification)

### Phase 6 (Advanced)
- **Lead**: Commander Data (Vector search)
- **Support**: Lt. Cmdr. La Forge (Performance)

---

## Next Steps

1. **Immediate**: Complete Phase 1 (knowledge_base table)
2. **Review**: Crew reviews this roadmap
3. **Prioritize**: Confirm phases 2-6 priority
4. **Execute**: Begin Phase 2 (Crew Data)

---

**🖖 "The journey to 100% is the accumulation of many 1% improvements."**  
— Commander Data

**Status**: Roadmap Complete - Ready for Crew Review

