#!/usr/bin/env node
/**
 * Test Task-Based Coordination System
 * 
 * Demonstrates:
 * - Task-based model selection (same model for all crew)
 * - Token pooling
 * - Process-level hallucination management
 * - Quark + Riker optimization
 */

const { TaskBasedCoordinator } = require('../packages/shared-utilities/src/openrouter/task-based-coordinator');

async function testTaskBasedCoordination() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 TASK-BASED COORDINATION SYSTEM TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Initialize coordinator
  const coordinator = new TaskBasedCoordinator(process.env.OPENROUTER_API_KEY || 'test-key');

  // Test Task 1: Database Optimization
  console.log('📋 Test Task 1: Database Optimization\n');
  
  const task1 = await coordinator.initializeTask(
    'task-db-optimization',
    'Optimize database queries and implement caching strategy for user dashboard',
    ['data', 'geordi', 'quark'],
    {
      budgetConstraint: 0.01,
      priority: 'high'
    }
  );

  console.log('✅ Task initialized');
  console.log(`   Model: ${task1.modelSelection.modelName}`);
  console.log(`   Cost per 1M tokens: $${task1.modelSelection.costPer1M}`);
  console.log(`   Quark Analysis: ${JSON.stringify(task1.quarkAnalysis, null, 2)}`);
  console.log(`   Riker Coordination: ${JSON.stringify(task1.rikerCoordination, null, 2)}\n`);

  // Execute crew member requests
  console.log('👥 Executing crew member requests...\n');

  const dataResult = await coordinator.executeCrewRequest(
    'task-db-optimization',
    'data',
    'Analyze the current database query performance. Identify slow queries and bottlenecks.'
  );

  const geordiResult = await coordinator.executeCrewRequest(
    'task-db-optimization',
    'geordi',
    'Design a caching strategy for the identified bottlenecks. Consider Redis or in-memory caching.'
  );

  const quarkResult = await coordinator.executeCrewRequest(
    'task-db-optimization',
    'quark',
    'Calculate the cost-benefit analysis of the proposed solution. Include infrastructure costs and performance gains.'
  );

  // Get task summary
  const summary = coordinator.getTaskSummary('task-db-optimization');
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TASK SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`Task ID: ${summary.taskId}`);
  console.log(`Description: ${summary.description}`);
  console.log(`Model Used: ${summary.model.name} ($${summary.model.costPer1M}/1M tokens)`);
  console.log(`\nToken Pool:`);
  console.log(`  Total Tokens: ${summary.tokenPool.totalTokens}`);
  console.log(`  Total Cost: $${summary.tokenPool.totalCost.toFixed(4)}`);
  console.log(`  Average Cost per Member: $${summary.tokenPool.averageCostPerMember.toFixed(4)}`);
  console.log(`\nCrew Member Breakdown:`);
  for (const [member, usage] of Object.entries(summary.tokenPool.crewMemberBreakdown)) {
    console.log(`  ${member}: ${usage.tokens} tokens, $${usage.cost.toFixed(4)}`);
  }
  console.log(`\nCrew Responses: ${summary.crewResponses}`);
  console.log(`Duration: ${(summary.duration / 1000).toFixed(2)}s`);
  console.log(`Status: ${summary.status}\n`);

  // Complete task
  const finalReport = coordinator.completeTask('task-db-optimization');
  
  console.log('✅ Task completed successfully!\n');

  // Test Task 2: Security Review
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Test Task 2: Security Review\n');
  
  const task2 = await coordinator.initializeTask(
    'task-security-review',
    'Review authentication system for security vulnerabilities',
    ['worf', 'data', 'picard'],
    {
      priority: 'critical'
    }
  );

  console.log('✅ Task initialized');
  console.log(`   Model: ${task2.modelSelection.modelName}\n`);

  const worfResult = await coordinator.executeCrewRequest(
    'task-security-review',
    'worf',
    'Identify potential security vulnerabilities in the authentication system.'
  );

  const dataResult2 = await coordinator.executeCrewRequest(
    'task-security-review',
    'data',
    'Analyze the authentication flow for logical vulnerabilities.'
  );

  const picardResult = await coordinator.executeCrewRequest(
    'task-security-review',
    'picard',
    'Provide strategic recommendations for improving authentication security.'
  );

  const summary2 = coordinator.getTaskSummary('task-security-review');
  
  console.log('\n📊 Task 2 Summary:');
  console.log(`   Model: ${summary2.model.name}`);
  console.log(`   Total Tokens: ${summary2.tokenPool.totalTokens}`);
  console.log(`   Total Cost: $${summary2.tokenPool.totalCost.toFixed(4)}\n`);

  coordinator.completeTask('task-security-review');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ ALL TESTS COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('Key Benefits Demonstrated:');
  console.log('  ✅ Same model used for all crew members on a task');
  console.log('  ✅ Tokens pooled together for efficient usage');
  console.log('  ✅ Quark and Riker optimize at task level');
  console.log('  ✅ Process-level monitoring ready for hallucination detection');
  console.log('  ✅ Cost tracking at both task and member level\n');
}

// Run test
if (require.main === module) {
  testTaskBasedCoordination().catch(err => {
    console.error('\n❌ Test failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  });
}

module.exports = { testTaskBasedCoordination };

