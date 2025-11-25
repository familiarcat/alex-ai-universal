#!/usr/bin/env node

/**
 * Store Crew Recommendations to RAG System
 * 
 * Stores all crew recommendations from MCP timeout optimization to RAG
 * Uses MCP Memory Storage Service with progress indicators
 */

const fs = require('fs');
const path = require('path');
const { getMCPMemoryStorage } = require('./utils/mcp-memory-storage');

// Load recommendations
const recommendationsPath = path.join(__dirname, '../reports/crew-mcp-timeout-optimization.json');
const recommendations = JSON.parse(fs.readFileSync(recommendationsPath, 'utf8'));

// Progress bar helper
function showProgress(current, total, description) {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * 20);
  const empty = 20 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  process.stdout.write(`\r   [${bar}] ${percentage}% - ${description}`);
  if (current === total) {
    process.stdout.write('\n');
  }
}

// Store recommendation to RAG via MCP Memory Storage
async function storeRecommendation(memoryStorage, crewMember, recommendation, index, total) {
  const description = recommendation.reason 
    ? `${crewMember}: ${recommendation.reason.substring(0, 50)}...`
    : `${crewMember}: ${recommendation.type || 'recommendation'}`;
  
  showProgress(index, total, `📝 Recording: ${description}`);
  
  const content = recommendation.reason 
    ? `Crew Recommendation from ${crewMember}: ${recommendation.reason}\n\nModel: ${recommendation.model || 'N/A'}\nCost: ${recommendation.cost || 'N/A'}\nTimeout: ${recommendation.timeout || 'N/A'}`
    : `Crew Recommendation from ${crewMember}: ${JSON.stringify(recommendation, null, 2)}`;
  
  const title = recommendation.reason
    ? `${crewMember} LLM Assignment: ${recommendation.model || 'N/A'}`
    : `${crewMember} Recommendation: ${recommendation.type || 'optimization'}`;
  
  try {
    const result = await memoryStorage.storeMemory({
      content,
      title,
      category: 'crew_recommendation',
      tags: ['crew-recommendation', crewMember, 'mcp-optimization', 'timeout-fix'],
      crewMember,
      sessionId: `crew-recommendations-${Date.now()}`,
      metadata: {
        crew_member: crewMember,
        timestamp: new Date().toISOString(),
        source: 'crew-coordination',
        recommendation_type: recommendation.type || 'optimization',
        ...recommendation
      }
    });
    
    if (result.success) {
      const status = result.cached ? '📋 Retrieved (cached)' : '✅ Recorded';
      showProgress(index, total, `${status}: ${description}`);
      return { success: true, cached: result.cached };
    } else {
      showProgress(index, total, `⚠️  Skipped: ${description} (${result.message})`);
      return { success: false, reason: result.message };
    }
  } catch (error) {
    showProgress(index, total, `❌ Failed: ${description} (${error.message})`);
    return { success: false, error: error.message };
  }
}

// Main
async function main() {
  console.log('\n🖖 Storing Crew Recommendations to RAG System');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Initialize MCP Memory Storage
  const memoryStorage = getMCPMemoryStorage();
  try {
    memoryStorage.initialize();
    console.log('✅ MCP Memory Storage initialized\n');
  } catch (error) {
    console.error('❌ Failed to initialize MCP Memory Storage:', error.message);
    process.exit(1);
  }
  
  // Count total items
  const llmAssignments = Object.entries(recommendations.llmAssignments);
  const fixes = recommendations.fixes || [];
  const total = llmAssignments.length + fixes.length;
  
  console.log(`📊 Total memories to process: ${total}\n`);
  
  let successCount = 0;
  let cachedCount = 0;
  let failedCount = 0;
  let index = 0;
  
  // Store LLM model assignments
  for (const [crewMember, assignment] of llmAssignments) {
    index++;
    const result = await storeRecommendation(
      memoryStorage,
      crewMember,
      {
        type: 'llm_assignment',
        model: assignment.model,
        reason: assignment.reason,
        cost: assignment.cost,
        timeout: assignment.timeout
      },
      index,
      total
    );
    
    if (result.success) {
      if (result.cached) {
        cachedCount++;
      } else {
        successCount++;
      }
    } else {
      failedCount++;
    }
  }
  
  // Store infrastructure fixes
  for (const fix of fixes) {
    index++;
    const result = await storeRecommendation(
      memoryStorage,
      'la_forge',
      {
        type: 'infrastructure_fix',
        file: fix.file,
        changes: fix.changes.join(', ')
      },
      index,
      total
    );
    
    if (result.success) {
      if (result.cached) {
        cachedCount++;
      } else {
        successCount++;
      }
    } else {
      failedCount++;
    }
  }
  
  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`   ✅ Recorded: ${successCount}`);
  console.log(`   📋 Retrieved (cached): ${cachedCount}`);
  console.log(`   ❌ Failed: ${failedCount}`);
  console.log(`   📊 Total: ${total}\n`);
  
  if (failedCount === 0) {
    console.log('✅ All crew recommendations processed successfully!\n');
  } else {
    console.log(`⚠️  ${failedCount} recommendations failed to store\n`);
  }
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});

