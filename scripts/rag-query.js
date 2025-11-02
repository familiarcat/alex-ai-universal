#!/usr/bin/env node

/**
 * RAG Query Script - Natural Language Knowledge Retrieval
 * 
 * Usage:
 *   node scripts/rag-query.js "Have we solved hydration errors before?"
 *   node scripts/rag-query.js "Show me theme system patterns"
 *   node scripts/rag-query.js "What did we learn about DDD?"
 * 
 * Implements: Hybrid search (keyword + semantic when embeddings available)
 * Crew: Lt. Uhura (Natural Language) + Commander Data (Search Logic)
 */

const fs = require('fs');
const path = require('path');

// Load N8N URL from ~/.zshrc
function loadN8nUrl() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  const n8nUrlMatch = zshrcContent.match(/export N8N_URL="([^"]+)"/);
  return n8nUrlMatch ? n8nUrlMatch[1] : 'https://n8n.pbradygeorgen.com';
}

async function queryRAG(query, options = {}) {
  const N8N_URL = loadN8nUrl();
  
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     🔍 RAG QUERY: Natural Language Knowledge Retrieval        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📝 Query: "${query}"`);
  console.log('');
  
  const payload = {
    query: query,
    searchType: options.searchType || 'hybrid',
    filters: options.filters || {},
    limit: options.limit || 10
  };
  
  try {
    const response = await fetch(`${N8N_URL}/webhook/knowledge-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Query failed (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    
    console.log(`✅ Found ${result.total_results} results`);
    console.log('');
    console.log('━'.repeat(66));
    console.log('');
    
    // Display results
    result.results.forEach((item, index) => {
      console.log(`📚 Result #${item.rank}: ${item.title}`);
      console.log(`   Session: ${item.session_id}`);
      console.log(`   Category: ${item.category}`);
      console.log(`   Date: ${new Date(item.created_at).toLocaleDateString()}`);
      console.log(`   Relevance: ${(item.relevance_score * 100).toFixed(1)}%`);
      console.log('');
      console.log(`   Summary: ${item.executive_summary}`);
      console.log('');
      
      // Show crew consensus if available
      if (item.crew_members && item.crew_members.length > 0) {
        console.log(`   👥 Crew: ${item.crew_members.join(', ')}`);
      }
      
      // Show key patterns if available
      if (item.technical_patterns && item.technical_patterns.length > 0) {
        console.log(`   🔧 Patterns: ${item.technical_patterns.length} discovered`);
        item.technical_patterns.slice(0, 2).forEach(pattern => {
          console.log(`      • ${pattern.pattern || pattern.name || 'Pattern'}`);
        });
      }
      
      // Show critical decisions
      if (item.critical_decisions && item.critical_decisions.length > 0) {
        console.log(`   ⭐ Decisions: ${item.critical_decisions.length} made`);
        item.critical_decisions.forEach(decision => {
          console.log(`      • ${decision.decision}`);
          if (decision.unanimous) console.log(`        Unanimous! ✅`);
        });
      }
      
      console.log('');
      console.log('   Tags:', (item.tags || []).join(', '));
      console.log('');
      console.log('━'.repeat(66));
      console.log('');
    });
    
    if (result.total_results === 0) {
      console.log('ℹ️  No results found for this query.');
      console.log('');
      console.log('Tips:');
      console.log('  • Try broader keywords');
      console.log('  • Check spelling');
      console.log('  • Try category filters: --category=crew_memory');
      console.log('');
    }
    
    return result;
  } catch (error) {
    console.error('❌ RAG query failed:', error.message);
    console.log('');
    console.log('Troubleshooting:');
    console.log('  1. Verify knowledge-query workflow is deployed');
    console.log('  2. Check webhook: ' + N8N_URL + '/webhook/knowledge-query');
    console.log('  3. Ensure knowledge_base table exists');
    console.log('');
    process.exit(1);
  }
}

async function main() {
  const query = process.argv[2];
  
  if (!query) {
    console.log('Usage: node scripts/rag-query.js "your question here"');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/rag-query.js "Have we solved hydration errors?"');
    console.log('  node scripts/rag-query.js "Show me theme system patterns"');
    console.log('  node scripts/rag-query.js "What did Data recommend about DDD?"');
    console.log('');
    process.exit(1);
  }
  
  // Parse options from additional arguments
  const options = {};
  
  for (let i = 3; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--category=')) {
      options.filters = options.filters || {};
      options.filters.category = arg.split('=')[1];
    }
    if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1]);
    }
  }
  
  await queryRAG(query, options);
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

