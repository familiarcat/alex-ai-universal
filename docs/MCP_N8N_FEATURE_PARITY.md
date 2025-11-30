# MCP vs N8N Feature Parity Analysis

**Date:** November 23, 2025  
**Status:** 🔍 In Progress  
**Purpose:** Ensure all n8n workflow functionality is available in MCP framework

---

## 📊 Feature Comparison Matrix

| Feature Category | N8N Workflow | MCP Tool | Status | Notes |
|-----------------|--------------|----------|--------|-------|
| **Crew Memories** |
| Get crew memories | `crew-memory-storage-workflow.json` | `get_crew_memories` | ✅ Complete | MCP provides same functionality |
| Search memories | Memory search via Supabase | `search_crew_memories` | ✅ Complete | MCP provides search capability |
| Store memories | `crew-memory-storage-workflow.json` | ❌ Missing | ⚠️ Gap | Need to add `store_crew_memory` tool |
| **OpenRouter Integration** |
| Model optimization | `openrouter-optimization-code.js` | `optimize_openrouter_model` | ✅ Complete | MCP provides optimization |
| LLM calls | Crew workflows with OpenRouter | `call_openrouter_llm` | ✅ Complete | MCP provides LLM calls |
| **Task Coordination** |
| Task optimization | Quark+Riker workflows | `optimize_task_assignment` | ✅ Complete | MCP provides task optimization |
| Get task assignment | Crew assignment workflows | `get_task_assignment` | ✅ Complete | MCP provides assignments |
| Task feedback | Feedback workflows | `provide_task_feedback` | ✅ Complete | MCP provides feedback |
| **Project Management** |
| Store project | `project-content-store.json` | ❌ Missing | ⚠️ Gap | Need to add `store_project` tool |
| Retrieve project | `project-content-retrieve.json` | ❌ Missing | ⚠️ Gap | Need to add `get_project` tool |
| Delete project | `project-content-delete.json` | ❌ Missing | ⚠️ Gap | Need to add `delete_project` tool |
| **RAG System** |
| Ingest knowledge | `knowledge-ingest.json` | ❌ Missing | ⚠️ Gap | Need to add `ingest_knowledge` tool |
| Query knowledge | `knowledge-query.json` | ❌ Missing | ⚠️ Gap | Need to add `query_knowledge` tool |
| Embed knowledge | `knowledge-embed.json` | ❌ Missing | ⚠️ Gap | Need to add `embed_knowledge` tool |
| Update knowledge | `knowledge-update.json` | ❌ Missing | ⚠️ Gap | Need to add `update_knowledge` tool |
| Archive knowledge | `knowledge-archive.json` | ❌ Missing | ⚠️ Gap | Need to add `archive_knowledge` tool |
| **Settings** |
| Store settings | `settings-store.json` | ❌ Missing | ⚠️ Gap | Need to add `store_settings` tool |
| Retrieve settings | `settings-retrieve.json` | ❌ Missing | ⚠️ Gap | Need to add `get_settings` tool |
| **Anti-Hallucination** |
| Hallucination detection | `anti-hallucination-workflow.json` | ❌ Missing | ⚠️ Gap | Need to add `detect_hallucination` tool |
| Hallucination monitoring | `hallucination-monitoring-dashboard.json` | ❌ Missing | ⚠️ Gap | Need to add `monitor_hallucinations` tool |
| **System Coordination** |
| Mission control | `system-mission-control-openrouter-production.json` | ❌ Missing | ⚠️ Gap | Need to add `mission_control` tool |
| Observation lounge | `coordination-observation-lounge-openrouter-production.json` | ❌ Missing | ⚠️ Gap | Need to add `observation_lounge` tool |
| Democratic collaboration | `coordination-democratic-collaboration-openrouter-production.json` | ❌ Missing | ⚠️ Gap | Need to add `democratic_collaboration` tool |
| **Individual Crew Workflows** |
| Picard workflow | `crew-captain-jean-luc-picard-*.json` | Via `call_openrouter_llm` | ✅ Complete | Covered by generic LLM tool |
| Riker workflow | `crew-commander-william-riker-*.json` | Via `call_openrouter_llm` | ✅ Complete | Covered by generic LLM tool |
| Data workflow | `crew-commander-data-*.json` | Via `call_openrouter_llm` | ✅ Complete | Covered by generic LLM tool |
| All other crew | Individual crew workflows | Via `call_openrouter_llm` | ✅ Complete | Covered by generic LLM tool |

---

## ✅ Complete Features (7/25)

1. **get_crew_memories** - Get memories for crew member(s)
2. **search_crew_memories** - Search memories by query
3. **optimize_openrouter_model** - Select optimal model
4. **call_openrouter_llm** - Make optimized LLM calls
5. **optimize_task_assignment** - Quark+Riker task optimization
6. **get_task_assignment** - Get assignment with context
7. **provide_task_feedback** - Crew member feedback

---

## ⚠️ Missing Features (18/25)

### High Priority (Core Functionality)

1. **store_crew_memory** - Store new crew memories
2. **store_project** - Store project data
3. **get_project** - Retrieve project data
4. **delete_project** - Delete project data
5. **ingest_knowledge** - Ingest knowledge to RAG
6. **query_knowledge** - Query RAG knowledge base

### Medium Priority (Enhanced Features)

7. **embed_knowledge** - Embed knowledge for RAG
8. **update_knowledge** - Update existing knowledge
9. **archive_knowledge** - Archive knowledge
10. **store_settings** - Store settings
11. **get_settings** - Retrieve settings
12. **detect_hallucination** - Detect hallucinations
13. **monitor_hallucinations** - Monitor hallucination system

### Lower Priority (System Coordination)

14. **mission_control** - Mission control coordination
15. **observation_lounge** - Observation lounge coordination
16. **democratic_collaboration** - Democratic collaboration

---

## 🎯 Implementation Plan

### Phase 1: Core Functionality (Week 1)
- [ ] `store_crew_memory` - Store crew memories
- [ ] `store_project` - Store projects
- [ ] `get_project` - Retrieve projects
- [ ] `delete_project` - Delete projects
- [ ] `ingest_knowledge` - Ingest to RAG
- [ ] `query_knowledge` - Query RAG

### Phase 2: Enhanced Features (Week 2)
- [ ] `embed_knowledge` - Embed for RAG
- [ ] `update_knowledge` - Update knowledge
- [ ] `archive_knowledge` - Archive knowledge
- [ ] `store_settings` - Store settings
- [ ] `get_settings` - Retrieve settings
- [ ] `detect_hallucination` - Hallucination detection

### Phase 3: System Coordination (Week 3)
- [ ] `mission_control` - Mission control
- [ ] `observation_lounge` - Observation lounge
- [ ] `democratic_collaboration` - Democratic collaboration
- [ ] `monitor_hallucinations` - Hallucination monitoring

---

## 📝 Notes

### Individual Crew Workflows
All individual crew member workflows (Picard, Riker, Data, etc.) are **covered** by the generic `call_openrouter_llm` tool with crew member specification. No need to duplicate these.

### Webhook vs MCP
- **N8N**: Uses webhooks (HTTP endpoints)
- **MCP**: Uses tools (function calls)
- **Migration**: Replace webhook calls with MCP tool calls

### Testing Strategy
1. Create test harness for OpenRouter
2. Test each MCP tool against n8n workflow equivalent
3. Verify feature parity
4. Document any differences

---

## 🔄 Migration Checklist

- [x] Crew memory retrieval
- [x] Crew memory search
- [x] OpenRouter optimization
- [x] LLM calls
- [x] Task optimization
- [x] Task assignment
- [x] Task feedback
- [ ] Crew memory storage
- [ ] Project CRUD operations
- [ ] RAG operations
- [ ] Settings management
- [ ] Anti-hallucination system
- [ ] System coordination

---

**Last Updated:** November 23, 2025  
**Next Review:** After Phase 1 implementation

