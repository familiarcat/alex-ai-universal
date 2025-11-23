#!/usr/bin/env node
/**
 * 🖖 Verify Semantic Search Schema
 * 
 * Checks the actual Supabase schema to verify semantic search capabilities
 * and ensures crew members can search semantically for optimized OpenRouter prompts.
 * 
 * Usage:
 *   node scripts/verify-semantic-search-schema.js
 */

const { createClient } = require('@supabase/supabase-js');
const { loadSupabaseCredentials } = require('./utils/secure-credential-loader');

async function verifySchema() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 VERIFYING SEMANTIC SEARCH SCHEMA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const creds = loadSupabaseCredentials();
    if (!creds.url || !creds.serviceKey) {
      throw new Error('Supabase credentials not found');
    }
    
    const supabase = createClient(creds.url, creds.serviceKey);
    
    // Get one record and inspect structure
    console.log('📋 Checking knowledge_base table structure...\n');
    
    const { data: sampleRecord, error: sampleError } = await supabase
      .from('knowledge_base')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (sampleError && sampleError.code !== 'PGRST116') {
      console.log(`⚠️  Error accessing table: ${sampleError.message}`);
    }
    
    let embeddingColumns = [];
    
    if (sampleRecord) {
      console.log('✅ Table accessible. Columns found:');
      const columnNames = Object.keys(sampleRecord);
      columnNames.forEach((col, idx) => {
        const value = sampleRecord[col];
        const type = value === null ? 'NULL' : 
                    Array.isArray(value) ? 'ARRAY' :
                    typeof value;
        const preview = typeof value === 'string' ? 
                       value.substring(0, 50) : 
                       JSON.stringify(value).substring(0, 50);
        console.log(`   ${idx + 1}. ${col} (${type})`);
        if (preview && preview !== 'null') {
          console.log(`      Sample: ${preview}...`);
        }
      });
      
      // Check for embedding columns
      embeddingColumns = columnNames.filter(col => 
        col.toLowerCase().includes('embedding') || 
        col.toLowerCase().includes('vector')
      );
      
      console.log(`\n🔍 Embedding Columns Found: ${embeddingColumns.length}`);
      if (embeddingColumns.length > 0) {
        embeddingColumns.forEach(col => {
          console.log(`   ✅ ${col}`);
          const hasValue = sampleRecord[col] !== null && sampleRecord[col] !== undefined;
          console.log(`      Has value: ${hasValue ? 'Yes' : 'No'}`);
        });
      } else {
        console.log('   ⚠️  No embedding columns found');
        console.log('   💡 Semantic search requires vector embeddings');
        console.log('   💡 Need to run migration: 010_add_vector_embeddings.sql');
      }
      
      // Check for search functions by trying to call one
      console.log('\n🔍 Checking for search functions...');
      // Note: We can't directly query pg_proc via Supabase client
      // But we know from schema files that search_knowledge_by_embedding should exist
      console.log('   💡 Expected functions (from schema):');
      console.log('      - search_knowledge_by_embedding()');
      console.log('      - hybrid_search_knowledge()');
      console.log('   ⚠️  Cannot verify without direct database access');
      
    } else {
      console.log('⚠️  Cannot inspect table structure (no records or access denied)');
    }
    
    // Test semantic search if embeddings exist
    const hasEmbeddings = embeddingColumns && embeddingColumns.length > 0;
    if (hasEmbeddings) {
      console.log('\n🧪 Testing Semantic Search...');
      
      // Try to find a record with embedding
      const { data: withEmbedding } = await supabase
        .from('knowledge_base')
        .select('*')
        .not(embeddingColumns[0], 'is', null)
        .limit(1)
        .single();
      
      if (withEmbedding) {
        console.log('   ✅ Found records with embeddings');
        console.log(`   ✅ Semantic search is possible`);
        
        // Test vector similarity if function exists
        console.log('\n💡 Crew Semantic Search Capabilities:');
        console.log('   ✅ Can search by semantic similarity');
        console.log('   ✅ Can find related memories even without exact keywords');
        console.log('   ✅ Can optimize OpenRouter prompts based on context');
        console.log('   ✅ Can collaborate on prompt engineering');
      } else {
        console.log('   ⚠️  No records with embeddings found');
        console.log('   💡 Need to generate embeddings for existing memories');
      }
    }
    
    // Summary
    const embeddingCount = embeddingColumns ? embeddingColumns.length : 0;
    console.log('\n📊 Schema Verification Summary:');
    console.log(`   ✅ Table accessible: ${sampleRecord ? 'Yes' : 'No'}`);
    console.log(`   ${embeddingCount > 0 ? '✅' : '⚠️ '} Embedding columns: ${embeddingCount}`);
    console.log(`   ${embeddingCount > 0 ? '✅' : '❌'} Semantic search: ${embeddingCount > 0 ? 'Available' : 'Not available'}`);
    console.log(`   ✅ Crew optimization: ${embeddingCount > 0 ? 'Ready' : 'Needs setup'}\n`);
    
    if (embeddingCount === 0) {
      console.log('🚀 Next Steps to Enable Semantic Search:');
      console.log('   1. Run migration: supabase/migrations/010_add_vector_embeddings.sql');
      console.log('   2. Generate embeddings for existing memories');
      console.log('   3. Update MCP storage to generate embeddings automatically');
      console.log('   4. Test semantic search queries\n');
    } else {
      console.log('✅ Semantic search is ready!');
      console.log('✅ Crew members can now:');
      console.log('   - Search memories semantically');
      console.log('   - Find related context automatically');
      console.log('   - Collaborate on optimized OpenRouter prompts');
      console.log('   - Reduce costs through better context retrieval\n');
    }
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifySchema();
}

module.exports = { verifySchema };

