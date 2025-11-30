#!/usr/bin/env node

/**
 * 🧪 Test MCP Integration
 * 
 * Tests MCP context caching and sharing functionality
 */

const { getMCPCache } = require('./utils/mcp-context-cache');
const { shareContextWithCrew, storeCrewAnalysis, getMCPStats } = require('./integrate-mcp-with-crew-workflows');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 TESTING MCP INTEGRATION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Store context
console.log('Test 1: Storing context...');
const testContent = 'This is a test milestone for MCP integration';
const testEmbeddings = [0.1, 0.2, 0.3, 0.4, 0.5]; // Mock embeddings

const mcpCache = getMCPCache();
const context1 = mcpCache.storeContext(testContent, testEmbeddings, {
  sessionId: 'test-session-1',
  crewMembers: ['data'],
  tags: ['test', 'milestone']
});

console.log(`✅ Context stored: ${context1.id}`);
console.log(`   Cache key: ${context1.cacheKey}\n`);

// Test 2: Retrieve context
console.log('Test 2: Retrieving context...');
const retrieved = mcpCache.getContext(context1.cacheKey);
if (retrieved && retrieved.id === context1.id) {
  console.log('✅ Context retrieved successfully');
  console.log(`   Content: ${retrieved.content.substring(0, 50)}...`);
  console.log(`   Embeddings: ${retrieved.embeddings ? 'Present' : 'Missing'}\n`);
} else {
  console.log('❌ Context retrieval failed\n');
}

// Test 3: Get cached embeddings
console.log('Test 3: Getting cached embeddings...');
const cachedEmbeddings = mcpCache.getCachedEmbeddings(testContent);
if (cachedEmbeddings && cachedEmbeddings.length === testEmbeddings.length) {
  console.log('✅ Cached embeddings retrieved');
  console.log(`   Length: ${cachedEmbeddings.length}\n`);
} else {
  console.log('❌ Embedding cache failed\n');
}

// Test 4: Share context with crew
console.log('Test 4: Sharing context with crew...');
const shared = shareContextWithCrew(context1.id, ['picard', 'riker']);
if (shared && shared.metadata.crewMembers.includes('picard')) {
  console.log('✅ Context shared successfully');
  console.log(`   Crew members: ${shared.metadata.crewMembers.join(', ')}\n`);
} else {
  console.log('❌ Context sharing failed\n');
}

// Test 5: Store crew analysis
console.log('Test 5: Storing crew analysis...');
const analysis = {
  crewMember: 'data',
  analysis: 'MCP integration is working correctly',
  timestamp: new Date().toISOString()
};
const storedAnalysis = storeCrewAnalysis('data', analysis, 'test-session-2');
if (storedAnalysis) {
  console.log('✅ Crew analysis stored');
  console.log(`   Context ID: ${storedAnalysis.id}\n`);
} else {
  console.log('❌ Crew analysis storage failed\n');
}

// Test 6: Cache statistics
console.log('Test 6: Cache statistics...');
const stats = getMCPStats();
console.log('📊 MCP Cache Statistics:');
console.log(`   Total contexts: ${stats.totalContexts}`);
console.log(`   Valid contexts: ${stats.validContexts}`);
console.log(`   Expired contexts: ${stats.expiredContexts}`);
console.log(`   Total embeddings: ${stats.totalEmbeddings}`);
console.log(`   Embedding cache size: ${stats.embeddingCacheSize}\n`);

// Test 7: Cleanup
console.log('Test 7: Cache cleanup...');
const cleaned = mcpCache.cleanup();
console.log(`✅ Cleaned ${cleaned} expired entries\n`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ MCP INTEGRATION TESTS COMPLETE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

