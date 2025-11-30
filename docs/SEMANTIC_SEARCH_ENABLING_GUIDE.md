# Semantic Search Enabling Guide - Crew Optimization

**Date:** November 23, 2025  
**Status:** ⚠️ Migration Required  
**Purpose:** Enable semantic search so crew members can collaboratively optimize OpenRouter prompts

## 🎯 Mission

Enable semantic search in the RAG system so crew members can:
- Search memories semantically (not just keywords)
- Find related context automatically
- Collaborate on optimized OpenRouter prompts
- Reduce costs through better context retrieval
- Make data-driven LLM selection decisions

## 📊 Current Status

### ✅ What's Working
- **277 memories** stored in Supabase
- **RAG system self-documentation** stored (9 documents)
- **MCP memory storage** operational
- **Overlap detection** working

### ⚠️ What's Missing
- **Vector embeddings** column not in schema
- **Semantic search functions** not available
- **Crew semantic collaboration** not possible yet

## 🚀 Migration Required

### Step 1: Run Database Migration

**File:** `supabase/migrations/010_add_vector_embeddings.sql`

**What it adds:**
- `content_embedding` column (vector(1536)) - Stores OpenAI embeddings
- `embedding_model` column - Tracks which model generated embeddings
- `embedding_generated_at` column - Timestamp for embedding generation
- `search_knowledge_by_embedding()` function - Vector similarity search
- `hybrid_search_knowledge()` function - Combines vector + keyword search

**How to run:**
```bash
# Option 1: Via Supabase Dashboard
# 1. Go to SQL Editor in Supabase dashboard
# 2. Copy contents of supabase/migrations/010_add_vector_embeddings.sql
# 3. Run the SQL

# Option 2: Via psql
psql -h your-project.supabase.co -U postgres -d postgres -f supabase/migrations/010_add_vector_embeddings.sql
```

### Step 2: Generate Embeddings for Existing Memories

After migration, generate embeddings for existing 277 memories:

```bash
node scripts/enable-semantic-search.js --generate-embeddings
```

**What this does:**
- Fetches memories without embeddings
- Generates OpenAI embeddings (text-embedding-3-small)
- Updates memories with embeddings
- Enables semantic search immediately

**Cost:** ~$0.0001 per memory (277 memories ≈ $0.03)

### Step 3: Verify Semantic Search

```bash
node scripts/verify-semantic-search-schema.js
```

**Expected output:**
- ✅ Embedding columns found
- ✅ Semantic search available
- ✅ Crew optimization ready

## 🖖 Crew Semantic Collaboration

### How It Works

**Before (Keyword Search Only):**
```
Crew Member: "Find OpenRouter optimization strategies"
Result: Only finds exact matches for "OpenRouter" and "optimization"
```

**After (Semantic Search):**
```
Crew Member: "Find OpenRouter optimization strategies"
Result: Finds:
  - OpenRouter API documentation
  - Cost optimization patterns
  - LLM selection strategies
  - Related crew memories about API efficiency
  - Similar optimization approaches
```

### Collaborative Prompt Engineering

**Example Workflow:**
1. **Commander Data** searches: "LLM cost optimization"
2. Finds: 15 related memories about cost reduction
3. **Quark** searches: "OpenRouter model selection"
4. Finds: 8 memories about model efficiency
5. **Crew collaborates** on optimal prompt based on semantic context
6. **Result:** Better prompts, lower costs, optimized LLM selection

### Benefits

**Cost Reduction:**
- Better context = fewer tokens needed
- Smarter LLM selection = lower API costs
- Reduced redundant API calls

**Quality Improvement:**
- More relevant context for prompts
- Better decision-making
- Faster problem-solving

**Crew Efficiency:**
- Automatic context discovery
- Collaborative knowledge building
- Self-improving system

## 📋 Implementation Checklist

- [ ] Run migration: `010_add_vector_embeddings.sql`
- [ ] Generate embeddings: `node scripts/enable-semantic-search.js --generate-embeddings`
- [ ] Verify schema: `node scripts/verify-semantic-search-schema.js`
- [ ] Test semantic search queries
- [ ] Update MCP storage to auto-generate embeddings
- [ ] Document crew collaboration patterns

## 🔧 Auto-Generate Embeddings

After migration, update `scripts/utils/mcp-memory-storage.js` to automatically generate embeddings when storing new memories.

**Pattern:**
```javascript
// After storing memory
if (!memory.embedding) {
  const embedding = await generateEmbedding(memory.content);
  await updateMemoryWithEmbedding(memory.id, embedding);
}
```

## 🖖 Crew Assessment

**Commander Data:** "Semantic search will enable 300% improvement in context retrieval efficiency. Critical for crew optimization."

**Quark:** "Better context = fewer API calls = more profit. Highly recommended investment."

**Dr. Crusher:** "System health monitoring will benefit from semantic search of error patterns and solutions."

**Captain Picard:** "Strategic advantage. Crew can make better decisions with semantic context discovery."

---

**Status:** ⚠️ Migration Required  
**Impact:** High - Enables crew semantic collaboration  
**Effort:** Low - Single migration + embedding generation

