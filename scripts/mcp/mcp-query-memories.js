#!/usr/bin/env node

/**
 * 🖖 MCP Memory Query
 * 
 * Query memories directly via MCP system with caching.
 */

const { getMCPMemoryStorage } = require('./utils/mcp-memory-storage');

async function main() {
  const args = process.argv.slice(2);
  
  const query = args[0] || '';
  const limit = parseInt(args[1]) || 10;
  const category = args[2] || null;
  const crewMember = args[3] || null;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 MCP MEMORY QUERY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (query) {
    console.log(`🔍 Query: "${query}"`);
  } else {
    console.log('🔍 Query: (all memories)');
  }
  console.log(`📊 Limit: ${limit}`);
  if (category) console.log(`📁 Category: ${category}`);
  if (crewMember) console.log(`👤 Crew Member: ${crewMember}`);
  console.log('');

  try {
    const storage = getMCPMemoryStorage();
    storage.initialize();

    console.log('🔎 Querying memories via MCP system...\n');
    
    const result = await storage.queryMemories(query, {
      limit,
      category,
      crewMember,
      useCache: true
    });

    if (result.success) {
      if (result.cached) {
        console.log('✅ Using cached query results (MCP efficiency gain!)\n');
      }

      console.log(`📊 Found ${result.count || result.results.length} memories:\n`);

      result.results.forEach((memory, index) => {
        console.log(`${index + 1}. ${memory.title || 'Untitled'}`);
        console.log(`   Category: ${memory.category || 'N/A'}`);
        console.log(`   Content: ${(memory.content || '').substring(0, 100)}${(memory.content || '').length > 100 ? '...' : ''}`);
        if (memory.crew_member) console.log(`   Crew Member: ${memory.crew_member}`);
        if (memory.tags && memory.tags.length > 0) console.log(`   Tags: ${memory.tags.join(', ')}`);
        console.log(`   Created: ${memory.created_at || 'N/A'}`);
        console.log('');
      });

      // Show cache stats
      const stats = storage.getCacheStats();
      console.log('📊 MCP Cache Statistics:');
      console.log(`   Total contexts: ${stats.totalContexts}`);
      console.log(`   Valid contexts: ${stats.validContexts}`);
      console.log(`   Total embeddings: ${stats.totalEmbeddings}\n`);

      console.log('🎉 Query complete!\n');
      process.exit(0);
    } else {
      console.error('❌ Query failed');
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

