# 🖖 Crew Vector System - Complete Documentation

**Date:** January 21, 2025  
**Status:** ✅ Phase 1 Complete - Crew Members Stored as Vector Points  
**Architecture:** MCP + Supabase RAG + OpenRouter Optimization

---

## 🎯 Overview

The Crew Vector System transforms each crew member into a vector point in our Supabase RAG system, enabling:

- **Vector-based crew retrieval** - Query crew members by specialization, use case, or expertise
- **Knowledge association** - Link memories and knowledge to specific crew members
- **Multimodal coordination** - Enable crew members to work in tandem with shared context
- **OpenRouter optimization** - Optimize LLM selection per crew member specialty
- **Cost-effective analysis** - Use crew-specific preferred models for optimal cost/performance

---

## 🏗️ Architecture

```
User Query
    ↓
Crew Vector Query (RAG)
    ↓
Crew Member Profile + Associated Knowledge
    ↓
OpenRouter Optimization (per crew member)
    ↓
Multimodal Crew Coordination
    ↓
Aggregated Insights
```

### Components

1. **Crew Vector Storage** (`scripts/store-crew-vectors-in-rag.js`)
   - Stores each crew member as a vector point in RAG
   - Includes: identity, specialization, preferred models, use cases
   - Metadata: role, experience, catchphrases, traits

2. **Knowledge Association** (`scripts/associate-knowledge-with-crew.js`)
   - Links existing RAG memories to crew members
   - Matches by specialization keywords, use cases, content similarity
   - Creates bidirectional associations

3. **Multimodal Coordination** (`scripts/multimodal-crew-coordination.js`)
   - Coordinates multiple crew members for analysis
   - Auto-detects relevant crew based on query
   - Aggregates insights from all relevant crew members

4. **Crew Context Query** (`scripts/crew-context-query-system.js`)
   - Queries associated knowledge for each crew member
   - Optimizes LLM selection per crew member
   - Uses crew-specific preferred models

5. **OpenRouter Integration** (`scripts/utils/mcp-openrouter-optimizer.js`)
   - Crew-aware model selection
   - Cost optimization per crew member
   - Preferred model routing

---

## 📊 Current Status

### ✅ Phase 1: Crew Vector Storage (Complete)

**All 10 crew members stored as vector points:**

1. ✅ Captain Jean-Luc Picard - Strategic Leadership & Decision Making
2. ✅ Commander William Riker - Tactical Execution & Workflow Management
3. ✅ Commander Data - Analytics, Logic & AI/ML
4. ✅ Lieutenant Commander Geordi La Forge - Infrastructure & System Integration
5. ✅ Chief Miles O'Brien - Practical Implementation
6. ✅ Dr. Beverly Crusher - System Health & Performance
7. ✅ Counselor Deanna Troi - User Experience & Empathy Analysis
8. ✅ Lieutenant Worf - Security & Compliance
9. ✅ Lieutenant Uhura - Communications & I/O Operations
10. ✅ Quark - Business Intelligence & ROI

**Storage Details:**
- Success Rate: 100% (10/10)
- Vector Points: 10 crew member profiles
- Metadata: Complete (role, specialization, preferred models, use cases)
- Embeddings: Pending (OpenRouter API key configuration needed)

---

## 🔧 Implementation Details

### Crew Vector Structure

Each crew member vector includes:

```json
{
  "title": "Crew Member: {Name}",
  "content": "Semantic text with specialization, experience, use cases",
  "category": "crew-member",
  "tags": ["crew", "crew-member", "{name}", "{specialization}", ...],
  "metadata": {
    "crewMember": "{Name}",
    "role": "{Role}",
    "specialization": "{Primary Specialization}",
    "secondarySpecializations": [...],
    "yearsExperience": "{Years}",
    "knownFor": [...],
    "preferredModels": [...],
    "useCases": [...],
    "responsibilities": [...],
    "catchphrases": [...],
    "traits": [...],
    "vectorPoint": true
  }
}
```

### Knowledge Association

Knowledge items are associated with crew members based on:

1. **Specialization Matching** - Keywords in content match crew specialization
2. **Use Case Relevance** - Content aligns with crew member's typical use cases
3. **Metadata Tags** - Tags match crew member's expertise areas
4. **Content Similarity** - Semantic similarity to crew member's profile

### OpenRouter Optimization

Per-crew optimization considers:

- **Preferred Models** - Crew member's preferred LLM models
- **Task Type** - Derived from crew specialization
- **Complexity** - Estimated task complexity
- **Budget** - Cost constraints (low/balanced/high)
- **Crew Alignment** - Model's alignment with crew member's expertise

---

## 🚀 Usage

### Store Crew Vectors

```bash
node scripts/store-crew-vectors-in-rag.js
```

### Associate Knowledge with Crew

```bash
node scripts/associate-knowledge-with-crew.js
```

### Coordinate Crew Analysis

```bash
node scripts/multimodal-crew-coordination.js "How can we optimize our MCP system?"
```

### Query Crew Context

```bash
node scripts/crew-context-query-system.js "Commander Data" "How can we improve our analytics?"
```

---

## 📈 Next Steps

### Phase 2: Knowledge Association (In Progress)

- [ ] Run knowledge association script
- [ ] Verify associations in RAG
- [ ] Test crew-specific knowledge queries

### Phase 3: Multimodal Coordination

- [ ] Test crew coordination with multiple members
- [ ] Verify OpenRouter optimization per crew
- [ ] Aggregate insights from multiple crew members

### Phase 4: Integration

- [ ] Integrate with MCP server API
- [ ] Add crew vector endpoints
- [ ] Enable crew coordination via API

### Phase 5: Optimization

- [ ] Fix OpenRouter API key configuration
- [ ] Enable embedding generation
- [ ] Optimize vector search performance

---

## 🎯 Benefits

1. **Specialized Analysis** - Each crew member focuses on their expertise
2. **Cost Optimization** - Use crew-specific preferred models for cost efficiency
3. **Context Awareness** - Crew members access their associated knowledge
4. **Multimodal Coordination** - Multiple crew members work together seamlessly
5. **Scalable Architecture** - Easy to add new crew members or knowledge

---

## 🔍 Technical Notes

### Embedding Generation

Currently using full-text search due to OpenRouter API key configuration. Once configured:

- Embeddings will be generated using `openai/text-embedding-3-small`
- Cached in MCP context cache for efficiency
- Enable semantic search for better crew matching

### Vector Search

RAG system supports:
- Full-text search (current)
- Semantic search (with embeddings)
- Metadata filtering (category, tags, crew member)
- Hybrid search (text + semantic)

---

## 📚 Related Documentation

- `docs/CREW-MANAGEMENT-SYSTEM.md` - Original crew management system
- `docs/MCP_SERVICE_ARCHITECTURE_AND_ACCESS.md` - MCP architecture
- `docs/MCP_REMOTE_SERVER_ARCHITECTURE.md` - Remote MCP server

---

**Status:** ✅ Phase 1 Complete - Ready for Knowledge Association

