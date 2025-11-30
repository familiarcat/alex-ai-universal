#!/usr/bin/env node
/**
 * 🖖 Verify RAG Storage in Supabase
 * 
 * Verifies that memories are properly stored in Supabase vector database
 * with embeddings for semantic search and overlap detection.
 * 
 * Usage:
 *   node scripts/verify-rag-storage.js
 */

const { createClient } = require('@supabase/supabase-js');
const { loadSupabaseCredentials } = require('./utils/secure-credential-loader');

async function verifyRAGStorage() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 VERIFYING RAG STORAGE IN SUPABASE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    // Load credentials
    const creds = loadSupabaseCredentials();
    if (!creds.url || !creds.serviceKey) {
      throw new Error('Supabase credentials not found');
    }
    
    const supabase = createClient(creds.url, creds.serviceKey);
    
    // Check table exists and get stats
    console.log('📊 Database Statistics:');
    const { data: stats, error: statsError } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true });
    
    if (statsError) {
      throw new Error(`Cannot access knowledge_base table: ${statsError.message}`);
    }
    
    // Get total count
    const { count: totalCount } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true });
    
    // Get recent memories (check what columns exist)
    const { data: recent, error: recentError } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (recentError) {
      throw new Error(`Error fetching recent memories: ${recentError.message}`);
    }
    
    console.log(`   Total memories: ${totalCount || 0}\n`);
    
    // Check if embeddings column exists by examining first record
    let hasEmbeddings = false;
    if (recent && recent.length > 0) {
      hasEmbeddings = 'embedding' in recent[0] || 'vector_embedding' in recent[0];
    }
    
    // Check for RAG system documentation
    console.log('🔍 Searching for RAG System Documentation:');
    const { data: ragDocs, error: ragError } = await supabase
      .from('knowledge_base')
      .select('id, title, category, created_at')
      .ilike('title', '%RAG%')
      .limit(10);
    
    if (ragError) {
      console.log(`   ⚠️  Error searching: ${ragError.message}`);
    } else {
      console.log(`   Found ${ragDocs?.length || 0} RAG-related memories:`);
      ragDocs?.forEach((doc, idx) => {
        console.log(`   ${idx + 1}. ${doc.title} (${doc.category}) - ${new Date(doc.created_at).toLocaleDateString()}`);
      });
    }
    
    console.log('\n📋 Recent Memories (Last 10):');
    if (recent && recent.length > 0) {
      recent.forEach((mem, idx) => {
        const hasEmbedding = hasEmbeddings && (mem.embedding || mem.vector_embedding) ? '✅' : '⚠️';
        const title = mem.title || mem.text || 'Untitled';
        const category = mem.category || mem.knowledge_type || 'N/A';
        const createdAt = mem.created_at || mem.timestamp || new Date();
        console.log(`   ${idx + 1}. ${hasEmbedding} ${title} (${category})`);
        console.log(`      Created: ${new Date(createdAt).toLocaleString()}`);
        if (mem.content) {
          const preview = mem.content.substring(0, 80).replace(/\n/g, ' ');
          console.log(`      Preview: ${preview}...`);
        }
      });
    } else {
      console.log('   ⚠️  No memories found in database');
    }
    
    // Check for overlaps (same title/content)
    console.log('\n🔍 Checking for Potential Overlaps:');
    const { data: allMemories } = await supabase
      .from('knowledge_base')
      .select('id, title, content, created_at');
    
    if (allMemories && allMemories.length > 0) {
      const titleMap = new Map();
      const contentHashes = new Map();
      
      allMemories.forEach(mem => {
        // Check title duplicates
        if (mem.title) {
          const normalized = mem.title.toLowerCase().trim();
          if (titleMap.has(normalized)) {
            titleMap.get(normalized).push(mem);
          } else {
            titleMap.set(normalized, [mem]);
          }
        }
        
        // Check content similarity (simple hash)
        const content = mem.content || mem.text || '';
        if (content && typeof content === 'string') {
          const hash = content.substring(0, 100).toLowerCase().trim();
          if (contentHashes.has(hash)) {
            contentHashes.get(hash).push(mem);
          } else {
            contentHashes.set(hash, [mem]);
          }
        }
      });
      
      let overlapCount = 0;
      titleMap.forEach((memories, title) => {
        if (memories.length > 1) {
          overlapCount++;
          console.log(`   ⚠️  Title overlap: "${title}" (${memories.length} instances)`);
        }
      });
      
      if (overlapCount === 0) {
        console.log('   ✅ No title overlaps detected');
      }
      
      let contentOverlapCount = 0;
      contentHashes.forEach((memories, hash) => {
        if (memories.length > 1) {
          contentOverlapCount++;
        }
      });
      
      if (contentOverlapCount === 0) {
        console.log('   ✅ No content overlaps detected');
      } else {
        console.log(`   ⚠️  ${contentOverlapCount} potential content overlaps (needs review)`);
      }
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   ✅ Database accessible: Yes`);
    console.log(`   ✅ Total memories: ${totalCount || 0}`);
    console.log(`   ${hasEmbeddings ? '✅' : '⚠️ '} Embeddings column: ${hasEmbeddings ? 'Present' : 'Not found'}`);
    console.log(`   ✅ RAG docs found: ${ragDocs?.length || 0}`);
    console.log(`   ✅ System operational: ${totalCount > 0 ? 'Yes' : 'No'}\n`);
    
    if (!hasEmbeddings && totalCount > 0) {
      console.log('⚠️  Note: Embeddings column not found in schema.');
      console.log('   Semantic search may not be available.\n');
    }
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyRAGStorage();
}

module.exports = { verifyRAGStorage };

