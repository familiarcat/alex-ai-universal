#!/usr/bin/env node

/**
 * 🖖 MCP LLM Call with OpenRouter Optimization
 * 
 * Call LLM via OpenRouter with automatic cost optimization and model selection.
 * Uses MCP caching for even better efficiency.
 */

const { getMCPOpenRouterOptimizer } = require('./utils/mcp-openrouter-optimizer');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node mcp-llm-call.js <prompt> [taskType] [complexity] [crewMember] [budgetConstraint]');
    console.log('');
    console.log('Options:');
    console.log('  taskType: strategic_planning, complex_analysis, code_generation, quick_analysis, optimization');
    console.log('  complexity: low, medium, high');
    console.log('  crewMember: picard, data, geordi, riker, worf, crusher, troi, uhura, quark, obrien');
    console.log('  budgetConstraint: Maximum cost in dollars (e.g., 0.01)');
    console.log('');
    console.log('Example:');
    console.log('  node mcp-llm-call.js "Analyze this code" "code_generation" "medium" "data"');
    process.exit(1);
  }

  const prompt = args[0];
  const taskType = args[1] || null;
  const complexity = args[2] || 'medium';
  const crewMember = args[3] || null;
  const budgetConstraint = args[4] ? parseFloat(args[4]) : null;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 MCP LLM CALL WITH OPENROUTER OPTIMIZATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`💬 Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);
  if (taskType) console.log(`📋 Task Type: ${taskType}`);
  console.log(`⚙️  Complexity: ${complexity}`);
  if (crewMember) console.log(`👤 Crew Member: ${crewMember}`);
  if (budgetConstraint) console.log(`💰 Budget: $${budgetConstraint}`);
  console.log('');

  try {
    const optimizer = getMCPOpenRouterOptimizer();
    optimizer.initialize();

    console.log('🚀 Calling OpenRouter with optimized model selection...\n');
    
    const result = await optimizer.callOpenRouter(
      prompt,
      {
        taskType,
        complexity,
        crewMember,
        budgetConstraint,
        estimatedTokens: 1500
      },
      {
        useCache: true
      }
    );

    console.log('\n✅ LLM Call Complete!\n');
    console.log('📊 Response:');
    if (result.choices && result.choices[0]) {
      console.log(result.choices[0].message.content);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
    console.log('');

    console.log('💰 Cost Information:');
    console.log(`   Model: ${result.modelSelection.model.name}`);
    console.log(`   Estimated Cost: $${result.modelSelection.estimatedCost.toFixed(4)}`);
    console.log(`   Confidence: ${(result.modelSelection.confidence * 100).toFixed(1)}%`);
    console.log('');

    // Show stats
    const stats = optimizer.getStats();
    console.log('📊 MCP OpenRouter Statistics:');
    console.log(`   Cache contexts: ${stats.cache.totalContexts}`);
    console.log(`   Valid contexts: ${stats.cache.validContexts}`);
    console.log(`   Available models: ${stats.models}`);
    console.log(`   Task types: ${stats.taskTypes}`);
    console.log('');

    console.log('🎉 LLM call complete!\n');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

