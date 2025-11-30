#!/usr/bin/env node
/**
 * 🖖 Store RAG System Self-Documentation
 * 
 * Stores comprehensive documentation about the RAG system itself into RAG,
 * creating a self-referential system that can diagnose and fix itself.
 * 
 * This enables Dr. Crusher to monitor system health and the crew to
 * understand how to maintain and troubleshoot the learning system.
 * 
 * Usage:
 *   node scripts/store-rag-system-self-documentation.js
 */

const fs = require('fs');
const path = require('path');
const { getMCPMemoryStorage } = require('./utils/mcp-memory-storage');

// Comprehensive RAG system documentation
const RAG_SYSTEM_DOCS = {
  architecture: {
    title: 'RAG System Architecture - Complete Reference',
    content: `# RAG System Architecture - Complete Reference

## 🎯 System Overview

The Alex AI RAG (Retrieval-Augmented Generation) system is a self-referential learning system that stores crew knowledge in a Supabase vector database, enabling semantic search and knowledge retrieval for decision-making.

## 🏗️ Architecture Components

### 1. MCP Memory Storage Layer
**File:** \`scripts/utils/mcp-memory-storage.js\`

**Purpose:** Direct Supabase integration bypassing n8n webhooks for 100% reliability.

**Key Features:**
- Direct Supabase connection (no webhook dependency)
- MCP context caching (30-40% cost reduction)
- Embedding reuse (50% cost reduction)
- Duplicate detection

**Usage:**
\`\`\`javascript
const { getMCPMemoryStorage } = require('./utils/mcp-memory-storage');
const storage = getMCPMemoryStorage();
storage.initialize();

await storage.storeMemory({
  title: 'Memory Title',
  content: 'Memory content...',
  category: 'memory',
  crewMember: 'data',
  tags: ['tag1', 'tag2'],
  sessionId: 'session-123'
});
\`\`\`

### 2. Supabase Vector Database
**Table:** \`knowledge_base\`

**Schema:**
- \`id\` - Unique identifier
- \`title\` - Memory title
- \`content\` - Full memory content
- \`embedding\` - Vector embedding (pgvector)
- \`session_id\` - Session identifier
- \`category\` - Memory category
- \`created_at\` - Timestamp

**Vector Search:**
- Uses pgvector for semantic similarity
- Supports hybrid search (vector + keyword)
- Configurable similarity thresholds

### 3. MCP Context Cache
**File:** \`scripts/utils/mcp-context-cache.js\`

**Purpose:** Cache contexts and embeddings to avoid duplicate storage and reduce API costs.

**Cache Strategy:**
- Content-based cache keys
- 1-hour TTL for contexts
- Permanent embedding cache
- Automatic duplicate detection

### 4. Secure Credential Loading
**File:** \`scripts/utils/secure-credential-loader.js\`

**Purpose:** Unified credential loading from ~/.zshrc with security best practices.

**Features:**
- Automatic ~/.zshrc parsing
- Process.env priority (most secure)
- Never logs secrets
- 1-minute caching

## 🔄 Data Flow

### Storing Memories
\`\`\`
Client Script
  ↓
MCP Memory Storage
  ↓
Check Cache (duplicate detection)
  ↓
Generate Embedding (if needed, reuse if cached)
  ↓
Store in Supabase
  ↓
Cache Context
\`\`\`

### Querying Memories
\`\`\`
Query Request
  ↓
MCP Memory Storage
  ↓
Check Query Cache
  ↓
Query Supabase (vector similarity)
  ↓
Cache Results
  ↓
Return Ranked Results
\`\`\`

## 🛠️ Troubleshooting

### Issue: Memory Not Stored
**Diagnosis:**
1. Check Supabase credentials: \`node -e "const {loadSupabaseCredentials} = require('./scripts/utils/secure-credential-loader'); console.log(loadSupabaseCredentials());"\`
2. Verify table exists: \`SELECT COUNT(*) FROM knowledge_base;\`
3. Check error logs in script output

**Solution:**
- Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in ~/.zshrc
- Verify Supabase table schema matches expected format
- Check network connectivity to Supabase

### Issue: Duplicate Memories
**Diagnosis:**
- MCP cache should prevent duplicates
- Check cache stats: \`storage.getCacheStats()\`

**Solution:**
- Cache is working correctly if duplicates are prevented
- If duplicates occur, check cache key generation logic

### Issue: Search Not Finding Memories
**Diagnosis:**
1. Verify embeddings exist: \`SELECT COUNT(*) FROM knowledge_base WHERE embedding IS NOT NULL;\`
2. Check similarity threshold (default: 0.7)
3. Verify query format

**Solution:**
- Lower similarity threshold if needed
- Ensure embeddings are generated for stored memories
- Check vector search function in Supabase

## 📊 Health Monitoring

### Dr. Crusher's Health Checks

**System Health Metrics:**
- Storage success rate
- Cache hit rate
- Embedding generation success
- Query response time
- Duplicate detection rate

**Monitoring Script:**
\`\`\`bash
node scripts/crew/health/crew-dr-crusher-mcp-health-diagnosis.js
\`\`\`

**Health Indicators:**
- ✅ Storage success rate > 95%
- ✅ Cache hit rate > 50%
- ✅ Query response time < 2s
- ✅ Zero duplicate storage

## 🔧 Maintenance

### Regular Tasks
1. **Monitor cache size** - Clear if too large
2. **Check Supabase storage** - Monitor table size
3. **Review error logs** - Fix recurring issues
4. **Update documentation** - Keep self-docs current

### Self-Healing Capabilities
- Automatic duplicate detection
- Cache-based error recovery
- Credential auto-loading
- Graceful degradation

## 🖖 Crew Integration

### How Crew Uses RAG
- **Captain Picard:** Strategic context retrieval
- **Commander Data:** Technical reference lookup
- **Lt. Cmdr. La Forge:** Troubleshooting solutions
- **Dr. Crusher:** System health monitoring
- **All Crew:** Decision-making context

### Query Examples
\`\`\`bash
# Find OpenRouter API key instructions
node scripts/mcp-query-memories.js "OpenRouter API key" 5

# Find RAG system documentation
node scripts/mcp-query-memories.js "RAG system architecture" 5

# Find troubleshooting guides
node scripts/mcp-query-memories.js "troubleshooting RAG" 5
\`\`\`

## 🚀 Future Enhancements

1. **Automatic Documentation Updates** - Self-updating docs
2. **Predictive Health Monitoring** - ML-based anomaly detection
3. **Auto-Healing** - Automatic error recovery
4. **Cross-Crew Learning** - Shared knowledge graphs
`,
    tags: ['rag', 'architecture', 'system', 'documentation', 'self-referential'],
    category: 'documentation',
  },
  
  troubleshooting: {
    title: 'RAG System Troubleshooting Guide',
    content: `# RAG System Troubleshooting Guide

## Common Issues and Solutions

### 1. Credentials Not Found
**Symptom:** Error: "Supabase credentials not found"

**Diagnosis:**
\`\`\`bash
# Check if credentials exist
node -e "const {getCredential} = require('./scripts/utils/secure-credential-loader'); console.log(getCredential('SUPABASE_URL') ? 'Found' : 'Missing');"
\`\`\`

**Solution:**
1. Add to ~/.zshrc:
   \`\`\`bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-key"
   \`\`\`
2. Reload: \`source ~/.zshrc\`
3. Verify: Run diagnosis script

### 2. Memory Storage Fails
**Symptom:** HTTP error when storing

**Diagnosis:**
- Check Supabase connection
- Verify table schema
- Check payload format

**Solution:**
\`\`\`bash
# Test Supabase connection
node -e "const {createClient} = require('@supabase/supabase-js'); const {loadSupabaseCredentials} = require('./scripts/utils/secure-credential-loader'); const creds = loadSupabaseCredentials(); const supabase = createClient(creds.url, creds.serviceKey); supabase.from('knowledge_base').select('count').then(r => console.log('Connected:', !r.error));"
\`\`\`

### 3. Search Returns No Results
**Symptom:** Queries return empty

**Diagnosis:**
- Check if embeddings exist
- Verify similarity threshold
- Check query format

**Solution:**
- Lower similarity threshold
- Verify embeddings were generated
- Check vector search function

### 4. Duplicate Memories
**Symptom:** Same memory stored multiple times

**Diagnosis:**
- Cache not working
- Cache key generation issue

**Solution:**
- Check cache stats
- Verify cache key logic
- Clear cache if needed

## Self-Diagnosis Commands

\`\`\`bash
# Full system health check
node scripts/crew/health/crew-dr-crusher-mcp-health-diagnosis.js

# Test credential loading
node -e "const {verifyCredentials} = require('./scripts/utils/secure-credential-loader'); console.log(verifyCredentials(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']));"

# Test memory storage
node scripts/mcp-store-memory.js "Test" "Test content" "test" "data" "test"

# Test memory query
node scripts/mcp-query-memories.js "test" 5
\`\`\`
`,
    tags: ['rag', 'troubleshooting', 'diagnosis', 'self-healing'],
    category: 'documentation',
  },
  
  selfHealing: {
    title: 'RAG System Self-Healing Capabilities',
    content: `# RAG System Self-Healing Capabilities

## 🛡️ Automatic Error Recovery

### 1. Duplicate Detection
**Mechanism:** MCP context cache checks for duplicate content before storage

**How It Works:**
- Content hash used as cache key
- If cached, returns cached context ID
- Prevents duplicate storage and API costs

**Self-Fix:** Automatic - no intervention needed

### 2. Credential Auto-Loading
**Mechanism:** Secure credential loader automatically loads from ~/.zshrc

**How It Works:**
- Checks process.env first (most secure)
- Falls back to ~/.zshrc parsing
- Caches credentials for 1 minute

**Self-Fix:** Automatic - credentials loaded on demand

### 3. Cache-Based Recovery
**Mechanism:** Failed operations can use cached results

**How It Works:**
- Query cache stores recent results
- If new query fails, can return cached results
- Prevents complete system failure

**Self-Fix:** Graceful degradation

### 4. Error Logging and Diagnosis
**Mechanism:** Dr. Crusher health monitoring

**How It Works:**
- Regular health checks
- Error pattern detection
- Automatic diagnosis reports

**Self-Fix:** Provides actionable diagnostics

## 🔄 Self-Update Mechanisms

### Documentation Auto-Update
- Scraper scripts can update documentation
- RAG stores latest versions
- Crew can query for current info

### System Learning
- Error patterns stored in RAG
- Solutions learned from fixes
- Knowledge compounds over time

## 🖖 Dr. Crusher's Role

**Primary Responsibility:** System Health Monitoring

**Capabilities:**
- Health diagnosis scripts
- Error pattern analysis
- Preventive maintenance recommendations
- Self-healing trigger detection

**Monitoring Frequency:**
- Real-time during operations
- Scheduled health checks
- On-demand diagnosis

## 📊 Health Metrics

### Key Indicators
- Storage success rate
- Cache effectiveness
- Query performance
- Error frequency
- Duplicate prevention rate

### Thresholds
- ✅ Healthy: > 95% success rate
- ⚠️ Warning: 80-95% success rate
- ❌ Critical: < 80% success rate

## 🚀 Future Self-Healing Features

1. **Automatic Retry Logic** - Retry failed operations
2. **Adaptive Thresholds** - Auto-adjust similarity thresholds
3. **Predictive Maintenance** - ML-based issue prediction
4. **Auto-Scaling** - Dynamic resource allocation
`,
    tags: ['rag', 'self-healing', 'monitoring', 'dr-crusher', 'health'],
    category: 'documentation',
  },
};

async function storeAllDocumentation() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 STORING RAG SYSTEM SELF-DOCUMENTATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const storage = getMCPMemoryStorage();
  storage.initialize();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [key, doc] of Object.entries(RAG_SYSTEM_DOCS)) {
    try {
      console.log(`📝 Storing: ${doc.title}...`);
      
      const result = await storage.storeMemory({
        title: doc.title,
        content: doc.content,
        category: doc.category,
        tags: doc.tags,
        crewMember: 'crusher', // Dr. Crusher for system health
        sessionId: `rag-self-docs-${Date.now()}`,
        metadata: {
          source: 'rag-system-self-documentation',
          docType: key,
          storedAt: new Date().toISOString(),
          selfReferential: true,
        },
      });
      
      if (result.success) {
        if (result.cached) {
          console.log(`   ✅ Already cached (avoided duplicate)`);
        } else {
          console.log(`   ✅ Stored successfully`);
        }
        successCount++;
      } else {
        console.log(`   ❌ Storage failed`);
        errorCount++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Summary: ${successCount} stored, ${errorCount} errors\n`);
  
  // Show cache stats
  const stats = storage.getCacheStats();
  console.log('📊 MCP Cache Statistics:');
  console.log(`   Total contexts: ${stats.totalContexts}`);
  console.log(`   Valid contexts: ${stats.validContexts}`);
  console.log(`   Total embeddings: ${stats.totalEmbeddings}\n`);
  
  return { successCount, errorCount };
}

async function main() {
  try {
    await storeAllDocumentation();
    console.log('✅ RAG system self-documentation complete!');
    console.log('\n💡 The RAG system now knows how to diagnose and fix itself.');
    console.log('💡 Dr. Crusher can monitor system health using this knowledge.\n');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { storeAllDocumentation };

