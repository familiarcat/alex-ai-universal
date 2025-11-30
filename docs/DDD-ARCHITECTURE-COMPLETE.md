# Complete DDD Architecture - Alex AI Universal

**Vision**: 100% DDD Coverage Across All Data

**Current**: 40% | **Target**: 100%

---

## Complete Data Architecture

### Database Schema (9 Core Tables)

```
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE DATABASE                       │
│                   (Single Source of Truth)                  │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   PROJECTS   │    │USER_SETTINGS │    │KNOWLEDGE_BASE│
│  (Business)  │    │  (Prefs)     │    │    (RAG)     │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ project_id   │    │ user_id      │    │ session_id   │
│ headline     │    │ global_theme │    │ title        │
│ theme        │    │ preferences  │    │ content      │
│ components   │    │ updated_at   │    │ decisions    │
│ pages        │    └──────────────┘    │ patterns     │
└──────────────┘                        │ insights     │
                                        └──────────────┘
        │                                      │
        │                     ┌────────────────┴─────────────┐
        │                     │                              │
        ▼                     ▼                              ▼
┌──────────────┐    ┌──────────────┐            ┌──────────────┐
│CREATIVE_     │    │OBSERVATIONS  │            │CREW_MEMBERS  │
│  CONTENT     │    │  (Lounge)    │            │  (Profiles)  │
├──────────────┤    ├──────────────┤            ├──────────────┤
│ content_id   │    │observation_id│            │ crew_id      │
│ project_id───┼────│ session_id   │            │ name         │
│ content_type │    │ crew_member──┼────────────│ expertise    │
│ content      │    │ topic        │            │ ai_config    │
│ version      │    │ severity     │            │ n8n_workflow │
└──────────────┘    └──────────────┘            └──────────────┘

        ┌─────────────────────────────────────┐
        │         OPERATIONAL TABLES          │
        └─────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  WORKFLOW_   │ │  ERROR_LOGS  │ │ ANALYTICS_   │
│  EXECUTIONS  │ │  (Errors)    │ │   EVENTS     │
├──────────────┤ ├──────────────┤ ├──────────────┤
│execution_id  │ │ error_id     │ │ event_id     │
│workflow_id   │ │ error_type   │ │ event_type   │
│ status       │ │ source       │ │ event_action │
│ duration_ms  │ │ message      │ │ properties   │
│ input_data   │ │ resolved     │ │ occurred_at  │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## DDD Flow for Each Data Type

### 1. Projects (✅ Complete)

```
Dashboard UI
     ↓
updateProject('alpha', 'headline', 'New Title')
     ↓
localStorage (optimistic cache)
     ↓
debouncedContentSync(project, 2000ms)
     ↓
POST /webhook/project-content-store
     ↓
n8n: Validate & Transform
     ↓
Supabase: UPSERT projects
     ↓
✅ Source of Truth Updated
```

### 2. User Settings (✅ Complete)

```
Dashboard UI
     ↓
updateGlobalTheme('cyberpunk')
     ↓
localStorage (optimistic cache)
     ↓
debouncedSettingsSync({ globalTheme }, 1000ms)
     ↓
POST /webhook/settings-store
     ↓
n8n: Validate & Transform
     ↓
Supabase: UPSERT user_settings
     ↓
✅ Source of Truth Updated
```

### 3. Knowledge Base (⏳ 99% Complete)

```
Crew Memory Generated
     ↓
store-crew-decision-in-rag.js
     ↓
POST /webhook/knowledge-ingest
     ↓
n8n: Transform crew memory
     ↓
Supabase: INSERT knowledge_base
     ↓
✅ RAG System Populated
```

### 4. Crew Members (📋 Planned)

```
crew-members/*.json
     ↓
migrate-crew-json-to-supabase.js
     ↓
POST /webhook/crew-member-store
     ↓
n8n: Validate profile data
     ↓
Supabase: UPSERT crew_members
     ↓
✅ Queryable Crew Expertise
```

### 5. Observations (📋 Planned)

```
Crew Discussion
     ↓
Observation Lounge UI
     ↓
POST /webhook/observation-store
     ↓
n8n: Link to session & crew
     ↓
Supabase: INSERT observations
     ↓
✅ Historical Record
```

### 6. Workflow Executions (📋 Planned)

```
n8n Workflow Starts
     ↓
Logging Node (in every workflow)
     ↓
POST /webhook/execution-log
     ↓
Supabase: INSERT workflow_executions
     ↓
✅ Execution History
```

### 7. Error Logs (📋 Planned)

```
Error Occurs (Client/Server)
     ↓
Global Error Handler
     ↓
POST /webhook/error-log
     ↓
n8n: Parse error details
     ↓
Supabase: INSERT error_logs
     ↓
✅ Centralized Error Tracking
```

### 8. Analytics Events (📋 Planned)

```
User Action (theme change, edit, etc.)
     ↓
trackEvent('theme_change', { from, to })
     ↓
POST /webhook/analytics-event
     ↓
n8n: Add context (session, user)
     ↓
Supabase: INSERT analytics_events
     ↓
✅ Usage Patterns Tracked
```

### 9. Creative Content (📋 Planned)

```
Temporal App (Screenplay Edit)
     ↓
Save Button Clicked
     ↓
POST /webhook/creative-content-store
     ↓
n8n: Version control logic
     ↓
Supabase: INSERT creative_content (new version)
     ↓
✅ Version History Preserved
```

---

## Complete n8n Workflow Map

### Current (3 Workflows) ✅

1. **project-content-store** - Store projects
2. **settings-store** - Store user settings
3. **knowledge-ingest** - Store crew memories

### Target (12+ Workflows) 📋

4. **crew-member-store** - Store crew profiles
5. **crew-member-retrieve** - Fetch crew expertise
6. **crew-member-query** - Query by specialization
7. **observation-store** - Store crew observations
8. **observation-retrieve** - Fetch observations
9. **execution-log** - Log workflow runs
10. **error-log** - Log errors
11. **analytics-event** - Track usage
12. **creative-content-store** - Version control for creative work
13. **creative-content-retrieve** - Fetch creative content

---

## Query Patterns (When Complete)

### Semantic Search Across All Data

```sql
-- Find all crew discussions about "theme system"
SELECT * FROM observations 
WHERE to_tsvector('english', topic || ' ' || content) 
      @@ to_tsquery('english', 'theme & system')
ORDER BY created_at DESC;

-- Find crew member best suited for "performance optimization"
SELECT * FROM crew_members
WHERE primary_expertise @> ARRAY['performance_optimization']
   OR to_tsvector('english', array_to_string(responsibilities, ' '))
      @@ to_tsquery('english', 'performance & optimization');

-- Get all errors from last 7 days by severity
SELECT error_type, source, COUNT(*) as error_count
FROM error_logs
WHERE occurred_at > NOW() - INTERVAL '7 days'
  AND resolved = false
GROUP BY error_type, source
ORDER BY error_count DESC;

-- Most used features (last 30 days)
SELECT event_category, event_action, COUNT(*) as usage_count
FROM analytics_events
WHERE occurred_at > NOW() - INTERVAL '30 days'
GROUP BY event_category, event_action
ORDER BY usage_count DESC
LIMIT 20;

-- Crew performance: Who contributes most insights?
SELECT 
  cm.name,
  cm.role,
  COUNT(o.observation_id) as total_observations,
  COUNT(o.observation_id) FILTER (WHERE o.consensus_reached = true) as consensus_count
FROM crew_members cm
LEFT JOIN observations o ON cm.crew_id = o.crew_member_id
WHERE o.created_at > NOW() - INTERVAL '30 days'
GROUP BY cm.name, cm.role
ORDER BY total_observations DESC;
```

---

## Benefits of 100% DDD Coverage

### 1. Data Consistency
- Single source of truth for ALL data
- No localStorage/JSON/Supabase sync conflicts
- Atomic updates across the system

### 2. Queryability
- SQL queries across all data types
- Join crew members with their observations
- Link errors to workflow executions
- Semantic search across everything

### 3. Auditing & History
- Complete audit trail for all changes
- Who changed what and when
- Rollback capability
- Compliance-ready

### 4. Analytics & Intelligence
- Usage patterns across all features
- Crew performance metrics
- Error trend analysis
- Predictive insights

### 5. Scalability
- Multi-user ready (add auth + RLS updates)
- Cross-device sync for all data
- Horizontal scaling via Supabase
- CDN caching for static queries

### 6. Developer Experience
- Consistent patterns everywhere
- Predictable data flow
- Easy to add new features (copy workflow template)
- Self-documenting via schema

---

## Migration Files Created

✅ **Ready to Deploy**:
- `001_create_projects_table.sql` (✅ Deployed)
- `002_create_user_settings_table.sql` (✅ Deployed)
- `003_create_knowledge_base_table.sql` (⏳ Pending)
- `004_create_crew_members_table.sql` (✅ Created)
- `005_create_observations_table.sql` (✅ Created)
- `006_create_workflow_executions_table.sql` (✅ Created)
- `007_create_error_logs_table.sql` (✅ Created)
- `008_create_analytics_events_table.sql` (✅ Created)
- `009_create_creative_content_table.sql` (✅ Created)

**Total**: 9 migrations covering 100% of persistent data

---

## Status Summary

### Completed
- ✅ DDD Roadmap (strategic plan)
- ✅ Implementation Guide (tactical execution)
- ✅ All migration files (001-009)
- ✅ Architecture documentation (this file)
- ✅ Automation scripts (8 scripts)

### In Progress
- ⏳ Phase 1 completion (knowledge_base table)

### Pending
- 📋 Phases 2-6 execution
- 📋 Workflow templates for new tables
- 📋 Migration scripts for data movement

---

**Ready to execute the roadmap to 100% DDD coverage! 🚀**

