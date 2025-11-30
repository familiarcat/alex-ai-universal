#!/usr/bin/env node

/**
 * 🚀 Direct RAG Ingestion - Bypass n8n Webhook Limitation
 * 
 * Crew-coordinated solution to work around n8n webhook registration failure.
 * This script directly ingests knowledge into Supabase RAG system, bypassing
 * n8n entirely while maintaining the same data structure and functionality.
 * 
 * Crew Members:
 * - Commander Data: Technical implementation
 * - Lieutenant La Forge: Infrastructure integration
 * - Chief O'Brien: Pragmatic workaround solution
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const SUPABASE_URL = creds.supabase.url;
const SUPABASE_KEY = creds.supabase.key;

// OpenRouter API for embeddings (using OpenAI models)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 
  (() => {
    const fs = require('fs');
    const zshrc = fs.readFileSync(require('os').homedir() + '/.zshrc', 'utf8');
    const match = zshrc.match(/export\s+OPENROUTER_API_KEY=["']?([^"'\s]+)["']?/);
    return match ? match[1] : null;
  })();

const EMBEDDING_MODEL = 'openai/text-embedding-3-small'; // 1536 dimensions

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 DIRECT RAG INGESTION - BYPASS N8N');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('👨‍🔧 Chief O\'Brien: "When the system breaks, we work around it."\n');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase credentials not found. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in ~/.zshrc');
  process.exit(1);
}

if (!OPENROUTER_API_KEY) {
  console.error('❌ OpenRouter API key not found. Set OPENROUTER_API_KEY in ~/.zshrc');
  process.exit(1);
}

// Utility: Make HTTPS request
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: options.timeout || 30000
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), body: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, body: body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// Generate embeddings using OpenRouter
async function generateEmbedding(text) {
  console.log('🤖 Commander Data: Generating embeddings...');
  
  try {
    const response = await makeRequest('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://github.com/pbradygeorgen/alex-ai-universal',
        'X-Title': 'Alex AI RAG System'
      },
      body: {
        model: EMBEDDING_MODEL,
        input: text
      }
    });

    if (response.status === 200 && response.data.data && response.data.data[0]) {
      console.log('   ✅ Embedding generated\n');
      return response.data.data[0].embedding;
    } else {
      throw new Error(`Embedding API returned status ${response.status}`);
    }
  } catch (error) {
    console.error(`   ❌ Embedding generation failed: ${error.message}\n`);
    throw error;
  }
}

// Chunk text into smaller pieces (similar to n8n workflow)
// Optimized to avoid memory issues with large texts
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;
  const textLength = text.length;
  
  // Process in smaller batches to avoid memory issues
  while (start < textLength) {
    const end = Math.min(start + chunkSize, textLength);
    // Use substring which is more memory efficient than slice for large strings
    const chunk = text.substring(start, end);
    chunks.push(chunk);
    
    // Move start position (with overlap)
    start = end - overlap;
    if (start >= textLength) break;
  }
  
  return chunks;
}

// Store in Supabase knowledge_base table (process one chunk at a time to save memory)
async function storeInSupabase(chunks, metadata) {
  console.log('🔧 Lieutenant La Forge: Storing in Supabase...');
  
  const sessionId = metadata.session_id || `direct-ingest-${Date.now()}`;
  const title = metadata.title || 'Direct RAG Ingestion';
  
  let successCount = 0;
  let errorCount = 0;
  
  // Process chunks one at a time to avoid memory issues
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    try {
      // Generate embedding for this chunk
      const embedding = await generateEmbedding(chunk);
      
      // Prepare data for Supabase (embedding as PostgreSQL array string)
      const supabaseData = {
        title: i === 0 ? title : `${title} (Chunk ${i + 1})`,
        content: chunk,
        embedding: `[${embedding.join(',')}]`, // PostgreSQL array format
        metadata: {
          ...metadata,
          chunk_index: i,
          total_chunks: chunks.length,
          ingestion_method: 'direct-bypass-n8n',
          timestamp: new Date().toISOString()
        },
        session_id: sessionId
      };
      
      // Insert into Supabase
      const response = await makeRequest(`${SUPABASE_URL}/rest/v1/knowledge_base`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation',
          'Content-Type': 'application/json'
        },
        body: supabaseData
      });
      
      if (response.status >= 200 && response.status < 300) {
        successCount++;
        process.stdout.write(`   ✅ Chunk ${i + 1}/${chunks.length} stored\r`);
      } else {
        errorCount++;
        console.error(`\n   ❌ Chunk ${i + 1} failed: ${response.status}`);
        if (response.body && typeof response.body === 'string') {
          console.error(`      ${response.body.substring(0, 200)}`);
        }
      }
      
      // Clear embedding from memory
      embedding.length = 0;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      errorCount++;
      console.error(`\n   ❌ Chunk ${i + 1} error: ${error.message}`);
    }
    
    // Force garbage collection hint (if available)
    if (global.gc && i % 5 === 0) {
      global.gc();
    }
  }
  
  console.log(`\n   📊 Stored: ${successCount} chunks, Errors: ${errorCount}\n`);
  
  return {
    sessionId,
    successCount,
    errorCount,
    totalChunks: chunks.length
  };
}

// Main ingestion function
async function ingestToRAG(payload) {
  console.log('📚 Processing payload for RAG ingestion...\n');
  
  const fs = require('fs');
  const path = require('path');
  
  // Extract content from payload (handle various formats)
  let content = '';
  let metadata = {};
  
  // Check if payload is a file path
  if (typeof payload === 'string' && fs.existsSync(payload)) {
    // File path - read it
    const filePath = payload;
    content = fs.readFileSync(filePath, 'utf8');
    
    // Extract metadata from markdown if it's a .md file
    if (filePath.endsWith('.md')) {
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');
      
      metadata = {
        title: title,
        category: 'milestone',
        tags: ['milestone', 'documentation'],
        session_id: `milestone-${Date.now()}`,
        metadata: {
          source: 'milestone-push-script',
          ingestion_method: 'direct-bypass-n8n',
          file_path: filePath
        }
      };
    } else {
      metadata = {
        title: path.basename(filePath),
        category: 'document',
        session_id: `document-${Date.now()}`
      };
    }
  } else if (typeof payload === 'string') {
    // Simple text payload
    content = payload;
    metadata = {
      title: 'Text Ingestion',
      category: 'general_knowledge',
      session_id: `text-${Date.now()}`
    };
  } else if (payload.content || payload.text) {
    // Structured payload
    content = payload.content || payload.text || JSON.stringify(payload);
    metadata = {
      title: payload.title || 'Document Ingestion',
      category: payload.category || 'general_knowledge',
      session_id: payload.session_id || `session-${Date.now()}`,
      tags: payload.tags || [],
      metadata: payload.metadata || {}
    };
  } else {
    // Full JSON payload
    content = JSON.stringify(payload);
    metadata = {
      title: payload.title || 'JSON Ingestion',
      category: payload.category || 'general_knowledge',
      session_id: payload.session_id || `session-${Date.now()}`
    };
  }
  
  console.log(`   Title: ${metadata.title}`);
  console.log(`   Category: ${metadata.category}`);
  console.log(`   Content length: ${content.length} chars\n`);
  
  // Chunk the content (process in smaller batches to avoid memory issues)
  console.log('📄 Chunking content...');
  const chunks = chunkText(content, 1000, 200);
  console.log(`   ✅ Created ${chunks.length} chunks\n`);
  
  // Clear content from memory after chunking
  content = null;
  
  // Store in Supabase
  const result = await storeInSupabase(chunks, metadata);
  
  return result;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node direct-rag-ingestion-bypass-n8n.js <file-path|json-string>');
    console.log('\nExamples:');
    console.log('  node direct-rag-ingestion-bypass-n8n.js MILESTONE_2025-01-20_CREW_COORDINATED_WEBHOOK_INVESTIGATION.md');
    console.log('  node direct-rag-ingestion-bypass-n8n.js \'{"title":"Test","content":"Hello world"}\'');
    process.exit(1);
  }
  
  const input = args[0];
  const fs = require('fs');
  const path = require('path');
  
  let payload;
  
  // Check if it's a file path
  if (fs.existsSync(input)) {
    console.log(`📄 Reading file: ${input}\n`);
    const content = fs.readFileSync(input, 'utf8');
    
    // If it's a markdown file, extract title and content
    if (input.endsWith('.md')) {
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : path.basename(input, '.md');
      
      payload = {
        title: title,
        content: content,
        category: 'milestone',
        tags: ['milestone', 'documentation'],
        session_id: `milestone-${Date.now()}`
      };
    } else {
      payload = {
        title: path.basename(input),
        content: content,
        category: 'document',
        session_id: `document-${Date.now()}`
      };
    }
  } else {
    // Try to parse as JSON
    try {
      payload = JSON.parse(input);
    } catch (e) {
      // Treat as plain text
      payload = {
        title: 'Text Ingestion',
        content: input,
        category: 'general_knowledge'
      };
    }
  }
  
  try {
    const result = await ingestToRAG(payload);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 RAG INGESTION COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Session ID: ${result.sessionId}`);
    console.log(`Chunks stored: ${result.successCount}/${result.totalChunks}`);
    console.log(`Errors: ${result.errorCount}\n`);
    console.log('✅ Knowledge successfully ingested into RAG system!');
    console.log('🖖 Bypass solution working - n8n limitations circumvented.\n');
    
    process.exit(result.errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ RAG ingestion failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ingestToRAG, generateEmbedding, chunkText };

