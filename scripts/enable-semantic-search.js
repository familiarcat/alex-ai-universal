#!/usr/bin/env node
/**
 * 🖖 Enable Semantic Search for Crew Optimization
 * 
 * Adds vector embeddings to the knowledge_base table to enable semantic search.
 * This allows crew members to:
 * - Search memories semantically (not just keywords)
 * - Find related context automatically
 * - Collaborate on optimized OpenRouter prompts
 * - Reduce costs through better context retrieval
 * 
 * Usage:
 *   node scripts/enable-semantic-search.js
 *   node scripts/enable-semantic-search.js --generate-embeddings  # Generate for existing memories
 */

const { createClient } = require('@supabase/supabase-js');
const { loadSupabaseCredentials } = require('./utils/secure-credential-loader');
const https = require('https');
const { getCredential } = require('./utils/secure-credential-loader');

async function checkMigrationNeeded(supabase) {
  console.log('🔍 Checking if migration is needed...\n');
  
  // Check if content_embedding column exists
  const { data: sample } = await supabase
    .from('knowledge_base')
    .select('*')
    .limit(1)
    .maybeSingle();
  
  if (sample && 'content_embedding' in sample) {
    console.log('✅ content_embedding column exists');
    return false;
  }
  
  console.log('⚠️  content_embedding column not found');
  console.log('💡 Migration needed: supabase/migrations/010_add_vector_embeddings.sql\n');
  return true;
}

async function generateEmbedding(text) {
  const openaiKey = getCredential('OPENAI_API_KEY');
  if (!openaiKey) {
    throw new Error('OPENAI_API_KEY not found. Required for embedding generation.');
  }
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000), // Limit to 8k tokens
    });
    
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/embeddings',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: 30000,
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(body);
            resolve(json.data[0].embedding);
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body.substring(0, 200)}`));
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(data);
    req.end();
  });
}

async function generateEmbeddingsForExisting(supabase) {
  console.log('\n🔄 Generating embeddings for existing memories...\n');
  
  // Get memories without embeddings
  const { data: memories, error } = await supabase
    .from('knowledge_base')
    .select('id, title, executive_summary, content')
    .is('content_embedding', null)
    .limit(10); // Start with 10 for testing
  
  if (error) {
    throw new Error(`Error fetching memories: ${error.message}`);
  }
  
  if (!memories || memories.length === 0) {
    console.log('✅ All memories already have embeddings\n');
    return;
  }
  
  console.log(`📊 Found ${memories.length} memories without embeddings\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const memory of memories) {
    try {
      // Create text for embedding
      const text = [
        memory.title || '',
        memory.executive_summary || '',
        typeof memory.content === 'string' ? memory.content : JSON.stringify(memory.content),
      ].join('\n\n').substring(0, 8000);
      
      console.log(`   Generating embedding for: ${memory.title?.substring(0, 50)}...`);
      
      const embedding = await generateEmbedding(text);
      
      // Update memory with embedding
      const { error: updateError } = await supabase
        .from('knowledge_base')
        .update({
          content_embedding: `[${embedding.join(',')}]`,
          embedding_model: 'text-embedding-3-small',
          embedding_generated_at: new Date().toISOString(),
        })
        .eq('id', memory.id);
      
      if (updateError) {
        console.log(`      ❌ Error: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`      ✅ Embedded`);
        successCount++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`      ❌ Error: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Summary: ${successCount} embedded, ${errorCount} errors\n`);
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 ENABLING SEMANTIC SEARCH FOR CREW OPTIMIZATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const creds = loadSupabaseCredentials();
    if (!creds.url || !creds.serviceKey) {
      throw new Error('Supabase credentials not found');
    }
    
    const supabase = createClient(creds.url, creds.serviceKey);
    
    // Check if migration needed
    const needsMigration = await checkMigrationNeeded(supabase);
    
    if (needsMigration) {
      console.log('📋 Migration Instructions:');
      console.log('   1. Connect to your Supabase database');
      console.log('   2. Run: supabase/migrations/010_add_vector_embeddings.sql');
      console.log('   3. This will add:');
      console.log('      - content_embedding column (vector(1536))');
      console.log('      - embedding_model column');
      console.log('      - embedding_generated_at column');
      console.log('      - Vector similarity search functions');
      console.log('      - Hybrid search functions\n');
      console.log('   After migration, run this script again with --generate-embeddings\n');
      return;
    }
    
    // Generate embeddings if requested
    if (process.argv.includes('--generate-embeddings')) {
      await generateEmbeddingsForExisting(supabase);
    } else {
      console.log('💡 To generate embeddings for existing memories:');
      console.log('   node scripts/enable-semantic-search.js --generate-embeddings\n');
    }
    
    // Verify semantic search is ready
    const { data: withEmbedding } = await supabase
      .from('knowledge_base')
      .select('id')
      .not('content_embedding', 'is', null)
      .limit(1)
      .maybeSingle();
    
    if (withEmbedding) {
      console.log('✅ Semantic search is ENABLED!');
      console.log('\n🚀 Crew members can now:');
      console.log('   ✅ Search memories semantically (not just keywords)');
      console.log('   ✅ Find related context automatically');
      console.log('   ✅ Collaborate on optimized OpenRouter prompts');
      console.log('   ✅ Reduce costs through better context retrieval');
      console.log('   ✅ Make data-driven LLM selection decisions\n');
    } else {
      console.log('⚠️  Semantic search schema exists but no embeddings found');
      console.log('   Run with --generate-embeddings to create embeddings\n');
    }
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkMigrationNeeded, generateEmbeddingsForExisting };

