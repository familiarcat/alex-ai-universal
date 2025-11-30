#!/usr/bin/env node

/**
 * 🖖 MCP Memory Storage
 * 
 * Store memories directly via MCP system, bypassing n8n webhooks.
 */

const { getMCPMemoryStorage } = require('./utils/mcp-memory-storage');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node mcp-store-memory.js <title> <content> [category] [crewMember] [tags...]');
    console.log('');
    console.log('Example:');
    console.log('  node mcp-store-memory.js "Meeting Notes" "Discussed MCP implementation" "meeting" "data" "mcp" "implementation"');
    process.exit(1);
  }

  const [title, content, category = 'memory', crewMember = null, ...tags] = args;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 MCP MEMORY STORAGE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`📝 Title: ${title}`);
  console.log(`📄 Content: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
  console.log(`📁 Category: ${category}`);
  if (crewMember) console.log(`👤 Crew Member: ${crewMember}`);
  if (tags.length > 0) console.log(`🏷️  Tags: ${tags.join(', ')}`);
  console.log('');

  try {
    const storage = getMCPMemoryStorage();
    storage.initialize();

    console.log('💾 Storing memory via MCP system...\n');
    
    const result = await storage.storeMemory({
      title,
      content,
      category,
      crewMember,
      tags: tags.length > 0 ? tags : [],
      sessionId: `mcp-memory-${Date.now()}`,
      metadata: {
        source: 'mcp-direct-storage',
        timestamp: new Date().toISOString()
      }
    });

    if (result.success) {
      if (result.cached) {
        console.log('✅ Memory already cached in MCP system (avoided duplicate storage)');
        console.log(`   Context ID: ${result.contextId}\n`);
      } else {
        console.log('✅ Memory stored successfully via MCP system!');
        console.log(`   Result: ${JSON.stringify(result.result).substring(0, 200)}...\n`);
      }

      // Show cache stats
      const stats = storage.getCacheStats();
      console.log('📊 MCP Cache Statistics:');
      console.log(`   Total contexts: ${stats.totalContexts}`);
      console.log(`   Valid contexts: ${stats.validContexts}`);
      console.log(`   Total embeddings: ${stats.totalEmbeddings}\n`);

      console.log('🎉 Memory storage complete!\n');
      process.exit(0);
    } else {
      console.error('❌ Memory storage failed');
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

