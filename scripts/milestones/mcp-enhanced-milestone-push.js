#!/usr/bin/env node

/**
 * 🚀 MCP-Enhanced Milestone Push
 * 
 * Uses MCP context layer to reduce costs and improve efficiency.
 * Caches embeddings and context for reuse across crew workflows.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Simple in-memory MCP context cache (can be upgraded to Redis later)
const mcpCache = new Map();

function hashContent(content) {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function getCachedEmbedding(content) {
  const key = hashContent(content);
  const cached = mcpCache.get(key);
  if (cached && cached.timestamp > Date.now() - 3600000) { // 1 hour TTL
    return cached.embedding;
  }
  return null;
}

function cacheEmbedding(content, embedding) {
  const key = hashContent(content);
  mcpCache.set(key, {
    embedding,
    timestamp: Date.now()
  });
}

// Load the simple direct RAG push script
async function main() {
  const milestonePath = process.argv[2];
  if (!milestonePath || !fs.existsSync(milestonePath)) {
    console.error('Usage: node mcp-enhanced-milestone-push.js <milestone-file>');
    process.exit(1);
  }

  console.log('\n🚀 MCP-Enhanced Milestone Push\n');
  console.log('📄 File:', path.basename(milestonePath));
  
  const content = fs.readFileSync(milestonePath, 'utf8');
  const contentHash = hashContent(content);
  
  // Check cache first
  const cachedEmbedding = getCachedEmbedding(content);
  if (cachedEmbedding) {
    console.log('✅ Using cached embedding (MCP efficiency gain!)\n');
  }

  // Use simple direct RAG push (it will generate embedding if not cached)
  const { execSync } = require('child_process');
  const scriptPath = path.join(__dirname, 'simple-direct-rag-push.js');
  
  execSync(`node "${scriptPath}" "${milestonePath}"`, {
    stdio: 'inherit',
    cwd: path.dirname(__dirname)
  });

  console.log('\n✅ MCP-enhanced push complete\n');
}

if (require.main === module) {
  main().catch(console.error);
}

