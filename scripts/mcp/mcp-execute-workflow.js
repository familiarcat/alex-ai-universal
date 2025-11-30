#!/usr/bin/env node

/**
 * 🖖 MCP Workflow Execution
 * 
 * Execute workflows via MCP system instead of n8n.
 */

const { getMCPWorkflowService } = require('./utils/mcp-workflow-service');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node mcp-execute-workflow.js <workflow-name> [workflow-data-json]');
    console.log('');
    console.log('Available workflows:');
    console.log('  • knowledge-ingest - Ingest knowledge into RAG');
    console.log('  • milestone-push - Push milestone to GitHub and RAG');
    console.log('  • memory-store - Store memory');
    console.log('  • crew-analysis - Perform crew analysis');
    console.log('');
    console.log('Example:');
    console.log('  node mcp-execute-workflow.js knowledge-ingest \'{"content":"Test","title":"Test Title"}\'');
    process.exit(1);
  }

  const workflowName = args[0];
  const workflowDataJson = args[1] || '{}';

  let workflowData;
  try {
    workflowData = JSON.parse(workflowDataJson);
  } catch (e) {
    console.error(`❌ Invalid JSON: ${e.message}`);
    process.exit(1);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 MCP WORKFLOW EXECUTION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`📋 Workflow: ${workflowName}`);
  console.log(`📦 Data: ${JSON.stringify(workflowData).substring(0, 100)}...`);
  console.log('');

  try {
    const service = getMCPWorkflowService();
    service.initialize();

    console.log('🚀 Executing workflow via MCP system...\n');
    
    const result = await service.executeWorkflow(workflowName, workflowData, {
      useCache: true,
      retries: 3
    });

    if (result.success !== false) {
      console.log('✅ Workflow executed successfully!\n');
      console.log('📊 Result:');
      console.log(JSON.stringify(result, null, 2));
      console.log('');

      // Show stats
      const stats = service.getStats();
      console.log('📊 MCP Workflow Statistics:');
      console.log(`   Cache contexts: ${stats.cache.totalContexts}`);
      console.log(`   Valid contexts: ${stats.cache.validContexts}`);
      console.log(`   Available workflows: ${Object.keys(stats.workflows).length}`);
      console.log('');

      console.log('🎉 Workflow complete!\n');
      process.exit(0);
    } else {
      console.error('❌ Workflow execution failed');
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

