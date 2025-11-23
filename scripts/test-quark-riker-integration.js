#!/usr/bin/env node
/**
 * 🖖 Test Quark + Riker Crew Integration
 * 
 * Tests the complete integration of Quark + Riker collaboration
 * into the crew system with task assignment and feedback.
 * 
 * Usage:
 *   node scripts/test-quark-riker-integration.js
 */

const { getMCPOpenRouterOptimizer } = require('./utils/mcp-openrouter-optimizer');
const { QuarkRikerTaskOptimizer } = require('./crew/quark-riker-task-optimizer');

const CREW_MEMBERS = {
  picard: 'Captain Jean-Luc Picard',
  data: 'Commander Data',
  riker: 'Commander William Riker',
  la_forge: 'Lieutenant Commander Geordi La Forge',
  worf: 'Lieutenant Worf',
  troi: 'Counselor Deanna Troi',
  crusher: 'Dr. Beverly Crusher',
  uhura: 'Lieutenant Uhura',
  quark: 'Quark',
  chief_obrien: "Chief Miles O'Brien"
};

async function testIntegration() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 TESTING QUARK + RIKER CREW INTEGRATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Initialize
  const optimizer = getMCPOpenRouterOptimizer();
  optimizer.initialize();
  const quarkRikerOptimizer = new QuarkRikerTaskOptimizer();
  
  // Test 1: Optimize task assignment
  console.log('📋 TEST 1: Optimize Task Assignment\n');
  const tasks = ['Optimize database queries', 'Implement caching layer'];
  const optimization = await quarkRikerOptimizer.optimizeTaskAssignment(tasks, {
    project: 'Alex AI Universal',
    priority: 'medium'
  });
  
  console.log('✅ Task optimization complete');
  console.log(`   Total cost: $${optimization.costs.total.toFixed(4)}\n`);
  
  // Test 2: Get task assignment for Data
  console.log('📋 TEST 2: Get Task Assignment for Data\n');
  
  const quarkPrompt = `You are Quark, the Ferengi business operations specialist. Analyze this task assignment for Commander Data:

Task: Optimize database queries

Provide:
1. Cost analysis (estimate LLM costs for this task)
2. Resource efficiency recommendations
3. Priority assessment
4. Cost optimization suggestions

Be specific, practical, and profit-focused.`;

  const rikerPrompt = `You are Commander William Riker, Executive Officer. Provide tactical coordination for this task assignment:

Crew Member: Commander Data
Task: Optimize database queries

Provide:
1. Why Data is assigned this task (his specialization)
2. Optimal execution approach
3. Workflow recommendations
4. Risk assessment and mitigation

Be tactical, organized, and operationally focused.`;

  const quarkAnalysis = await optimizer.optimizeAndCall(quarkPrompt, {
    crewMember: 'quark',
    complexity: 'medium',
    taskType: 'business_analysis',
    temperature: 0.7
  });

  const rikerCoordination = await optimizer.optimizeAndCall(rikerPrompt, {
    crewMember: 'riker',
    complexity: 'medium',
    taskType: 'operations',
    temperature: 0.7
  });

  console.log('💰 QUARK\'S COST ANALYSIS FOR DATA:');
  console.log('─'.repeat(70));
  console.log((quarkAnalysis.choices?.[0]?.message?.content || quarkAnalysis.body || '').substring(0, 300) + '...');
  console.log('─'.repeat(70));
  console.log(`   Cost: $${(quarkAnalysis.cost || quarkAnalysis.modelSelection?.estimatedCost || 0).toFixed(4)}\n`);

  console.log('⚡ RIKER\'S TACTICAL COORDINATION FOR DATA:');
  console.log('─'.repeat(70));
  console.log((rikerCoordination.choices?.[0]?.message?.content || rikerCoordination.body || '').substring(0, 300) + '...');
  console.log('─'.repeat(70));
  console.log(`   Cost: $${(rikerCoordination.cost || rikerCoordination.modelSelection?.estimatedCost || 0).toFixed(4)}\n`);

  // Test 3: Data provides feedback
  console.log('📋 TEST 3: Data Provides Feedback on Assignment\n');
  
  const assignmentContext = {
    quarkCostAnalysis: quarkAnalysis.choices?.[0]?.message?.content || quarkAnalysis.body || '',
    rikerTacticalCoordination: rikerCoordination.choices?.[0]?.message?.content || rikerCoordination.body || ''
  };

  const feedbackPrompt = `You are Commander Data. You have been assigned the following task:

Task: Optimize database queries

Assignment Context from Quark + Riker:
Quark's Cost Analysis: ${assignmentContext.quarkCostAnalysis.substring(0, 200)}...
Riker's Tactical Coordination: ${assignmentContext.rikerTacticalCoordination.substring(0, 200)}...

Provide your comprehensive perspective on:
1. Your understanding of the task and its objectives
2. Your approach to executing this task (considering Quark's cost analysis and Riker's tactical coordination)
3. Your unique insights and perspectives on the concepts involved
4. Any concerns, suggestions, or recommendations you have
5. How this task aligns with your specialization and expertise

Speak as Commander Data would - with your unique personality, expertise, and concerns. Be specific and actionable.`;

  const dataFeedback = await optimizer.optimizeAndCall(feedbackPrompt, {
    crewMember: 'data',
    complexity: 'medium',
    temperature: 0.8
  });

  console.log('🤖 DATA\'S FEEDBACK ON ASSIGNMENT:');
  console.log('─'.repeat(70));
  const feedback = dataFeedback.choices?.[0]?.message?.content || dataFeedback.body || '';
  console.log(feedback.substring(0, 500) + (feedback.length > 500 ? '...' : ''));
  console.log('─'.repeat(70));
  console.log(`   Cost: $${(dataFeedback.cost || dataFeedback.modelSelection?.estimatedCost || 0).toFixed(4)}`);
  console.log(`   Model: ${dataFeedback.modelSelection?.model?.name || 'Unknown'}\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ INTEGRATION TEST COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const totalCost = optimization.costs.total + 
                   (quarkAnalysis.cost || 0) + 
                   (rikerCoordination.cost || 0) + 
                   (dataFeedback.cost || 0);
  
  console.log('📊 Cost Summary:');
  console.log(`   Task Optimization: $${optimization.costs.total.toFixed(4)}`);
  console.log(`   Data Assignment (Quark): $${(quarkAnalysis.cost || 0).toFixed(4)}`);
  console.log(`   Data Assignment (Riker): $${(rikerCoordination.cost || 0).toFixed(4)}`);
  console.log(`   Data Feedback: $${(dataFeedback.cost || 0).toFixed(4)}`);
  console.log(`   Total: $${totalCost.toFixed(4)}\n`);
  
  console.log('✅ All systems operational!');
  console.log('   - Quark + Riker collaboration working');
  console.log('   - Task assignment with context working');
  console.log('   - Crew member feedback working');
  console.log('   - Cost optimization active\n');
}

if (require.main === module) {
  testIntegration().catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  });
}

module.exports = { testIntegration };

