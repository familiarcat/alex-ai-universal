#!/usr/bin/env node

/**
 * 🚀 Simple Direct RAG Push - Memory Efficient
 * 
 * Standalone script to push milestones directly to Supabase RAG
 * Bypasses n8n webhook limitations with minimal memory footprint
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');
const { getMCPCache } = require('./utils/mcp-context-cache');

const creds = loadCrewCredentials();
const SUPABASE_URL = creds.supabase.url;
const SUPABASE_KEY = creds.supabase.key;

// Get OpenRouter API key (try multiple variable names)
const zshrc = fs.readFileSync(require('os').homedir() + '/.zshrc', 'utf8');
const openRouterMatch = zshrc.match(/export\s+(OPENROUTER_API_KEY|OPENROUTER_KEY)=["']?([^"'\s]+)["']?/);
const OPENROUTER_API_KEY = openRouterMatch ? openRouterMatch[2] : process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

if (!OPENROUTER_API_KEY) {
  console.error('❌ OpenRouter API key not found');
  process.exit(1);
}

// Simple chunking (one chunk for now to avoid memory issues)
function createSingleChunk(text, maxSize = 8000) {
  if (text.length <= maxSize) {
    return [text];
  }
  // Simple split - just take first chunk
  return [text.substring(0, maxSize)];
}

// Generate embedding
function generateEmbedding(text) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'openrouter.ai',
      port: 443,
      path: '/api/v1/embeddings',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/pbradygeorgen/alex-ai-universal',
        'X-Title': 'Alex AI RAG'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (res.statusCode !== 200) {
            reject(new Error(`API error ${res.statusCode}: ${JSON.stringify(data).substring(0, 200)}`));
            return;
          }
          if (data.data && data.data[0] && data.data[0].embedding) {
            resolve(data.data[0].embedding);
          } else {
            reject(new Error(`No embedding in response: ${JSON.stringify(data).substring(0, 200)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message} - Response: ${body.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify({
      model: 'openai/text-embedding-3-small',
      input: text
    }));
    req.end();
  });
}

// Store in Supabase
function storeInSupabase(title, content, embedding, metadata) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/knowledge_base', SUPABASE_URL);
    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    const payload = {
      title,
      content,
      category: metadata.category || 'milestone',
      session_id: metadata.session_id || `direct-${Date.now()}`
    };
    
    // Only include embedding if it was generated
    if (embedding && Array.isArray(embedding)) {
      payload.embedding = `[${embedding.join(',')}]`;
    }
    
    // Note: Not including metadata field as schema cache doesn't recognize it
    // Metadata can be added later via migration if needed
    
    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath || !fs.existsSync(filePath)) {
    console.error('Usage: node simple-direct-rag-push.js <file-path>');
    process.exit(1);
  }

  console.log('🚀 Simple Direct RAG Push\n');
  console.log(`📄 File: ${path.basename(filePath)}\n`);

  const content = fs.readFileSync(filePath, 'utf8');
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');

  console.log(`📝 Title: ${title}`);
  console.log(`📏 Length: ${content.length} chars\n`);

  // Create single chunk
  const chunks = createSingleChunk(content);
  console.log(`📦 Chunks: ${chunks.length}\n`);

  // Process first chunk only
  const chunk = chunks[0];
  
  // Try to get cached embedding first (MCP efficiency gain!)
  const mcpCache = getMCPCache();
  let embedding = mcpCache.getCachedEmbeddings(chunk);
  
  if (embedding) {
    console.log('✅ Using cached embedding (MCP efficiency gain!)\n');
  } else {
    // Try to generate embedding, but continue without it if it fails
    try {
      console.log('🤖 Generating embedding...');
      embedding = await generateEmbedding(chunk);
      console.log('✅ Embedding generated\n');
      
      // Cache the embedding for future use (MCP context sharing)
      mcpCache.storeContext(chunk, embedding, {
        sessionId: metadata.session_id || `direct-${Date.now()}`,
        tags: metadata.tags || ['milestone', 'direct-ingestion']
      });
      console.log('💾 Embedding cached for future reuse (MCP efficiency)\n');
    } catch (error) {
      console.log(`⚠️  Embedding generation failed: ${error.message}`);
      console.log('   Continuing without embedding (will be searchable via full-text search)\n');
    }
  }

  console.log('💾 Storing in Supabase...');
  const result = await storeInSupabase(
    title,
    chunk,
    embedding,
    {
      category: 'milestone',
      tags: ['milestone', 'direct-ingestion'],
      ingestion_method: 'direct-bypass-n8n',
      timestamp: new Date().toISOString()
    }
  );

  console.log('✅ Successfully stored in RAG!\n');
  console.log(`Session ID: ${JSON.parse(result.body).session_id}\n`);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

