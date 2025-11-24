#!/usr/bin/env node
/**
 * OpenRouter Test Harness
 * 
 * Comprehensive test suite for OpenRouter optimization system.
 * Tests end-to-end functionality with real OpenRouter API calls.
 * 
 * Usage:
 *   node scripts/test-openrouter-harness.js
 *   node scripts/test-openrouter-harness.js --test=model-selection
 *   node scripts/test-openrouter-harness.js --test=task-coordination
 *   node scripts/test-openrouter-harness.js --test=all
 */

const { getMCPOpenRouterOptimizer } = require('./utils/mcp-openrouter-optimizer');
const { TaskBasedCoordinator } = require('../packages/shared-utilities/src/openrouter/task-based-coordinator');
const { TaskCoordinator } = require('../packages/core/src/task-coordination/task-coordinator');

// Test configuration
const TEST_CONFIG = {
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  verbose: process.argv.includes('--verbose'),
  testFilter: process.argv.find(arg => arg.startsWith('--test='))?.split('=')[1] || 'all'
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

/**
 * Test runner utilities
 */
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  };
  
  console.log(`${colors[type]}${prefix[type]} ${message}${colors.reset}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function runTest(name, testFn) {
  if (TEST_CONFIG.testFilter !== 'all' && !name.toLowerCase().includes(TEST_CONFIG.testFilter.toLowerCase())) {
    testResults.skipped++;
    if (TEST_CONFIG.verbose) {
      log(`Skipped: ${name}`, 'warning');
    }
    return;
  }

  const startTime = Date.now();
  try {
    log(`Running: ${name}`, 'info');
    await testFn();
    const duration = Date.now() - startTime;
    testResults.passed++;
    testResults.tests.push({ name, status: 'passed', duration });
    log(`Passed: ${name} (${duration}ms)`, 'success');
  } catch (error) {
    const duration = Date.now() - startTime;
    testResults.failed++;
    testResults.tests.push({ name, status: 'failed', duration, error: error.message });
    log(`Failed: ${name} - ${error.message}`, 'error');
    if (TEST_CONFIG.verbose) {
      console.error(error.stack);
    }
  }
}

/**
 * Test Suite 1: Model Selection
 */
async function testModelSelection() {
  if (!TEST_CONFIG.openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY not set');
  }

  const optimizer = getMCPOpenRouterOptimizer();
  optimizer.initialize();

  // Test 1: Basic model selection
  await runTest('Model Selection - Basic', async () => {
    const selection = optimizer.selectOptimalModel({
      crewMember: 'data',
      taskType: 'complex_analysis',
      complexity: 'high',
      estimatedTokens: 2000
    });

    assert(selection.modelId, 'Model ID should be returned');
    assert(selection.modelName, 'Model name should be returned');
    assert(selection.estimatedCost >= 0, 'Estimated cost should be non-negative');
    assert(selection.confidence > 0 && selection.confidence <= 1, 'Confidence should be between 0 and 1');
  });

  // Test 2: Budget constraint
  await runTest('Model Selection - Budget Constraint', async () => {
    const selection = optimizer.selectOptimalModel({
      crewMember: 'quark',
      taskType: 'business_analysis',
      complexity: 'medium',
      estimatedTokens: 1000,
      budgetConstraint: 0.001 // $0.001 max
    });

    assert(selection.estimatedCost <= 0.001, 'Cost should respect budget constraint');
  });

  // Test 3: Different crew members
  await runTest('Model Selection - Crew Member Variations', async () => {
    const crewMembers = ['picard', 'data', 'riker', 'quark', 'geordi'];
    
    for (const member of crewMembers) {
      const selection = optimizer.selectOptimalModel({
        crewMember: member,
        complexity: 'medium',
        estimatedTokens: 1500
      });

      assert(selection.modelId, `Model selection should work for ${member}`);
    }
  });

  // Test 4: Complexity levels
  await runTest('Model Selection - Complexity Levels', async () => {
    const complexities = ['low', 'medium', 'high'];
    
    for (const complexity of complexities) {
      const selection = optimizer.selectOptimalModel({
        crewMember: 'data',
        complexity,
        estimatedTokens: 1500
      });

      assert(selection.modelId, `Model selection should work for ${complexity} complexity`);
    }
  });
}

/**
 * Test Suite 2: OpenRouter API Calls
 */
async function testOpenRouterCalls() {
  if (!TEST_CONFIG.openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY not set');
  }

  const optimizer = getMCPOpenRouterOptimizer();
  optimizer.initialize();

  // Test 1: Basic LLM call
  await runTest('OpenRouter Call - Basic', async () => {
    const result = await optimizer.optimizeAndCall(
      'What is 2+2?',
      {
        crewMember: 'data',
        complexity: 'low',
        apiOptions: {
          temperature: 0.7,
          max_tokens: 100
        }
      }
    );

    assert(result, 'Result should be returned');
    assert(result.choices || result.body, 'Response should contain choices or body');
    assert(result.cost !== undefined, 'Cost should be tracked');
    assert(result.usage, 'Usage should be tracked');
  });

  // Test 2: Different crew members
  await runTest('OpenRouter Call - Crew Member Variations', async () => {
    const crewMembers = ['picard', 'data', 'quark'];
    
    for (const member of crewMembers) {
      const result = await optimizer.optimizeAndCall(
        `You are ${member}. Say hello.`,
        {
          crewMember: member,
          complexity: 'low',
          apiOptions: {
            max_tokens: 50
          }
        }
      );

      assert(result, `Call should work for ${member}`);
      assert(result.cost >= 0, `Cost should be tracked for ${member}`);
    }
  });

  // Test 3: Cost tracking
  await runTest('OpenRouter Call - Cost Tracking', async () => {
    const result = await optimizer.optimizeAndCall(
      'Explain quantum computing in one sentence.',
      {
        crewMember: 'data',
        complexity: 'medium',
        apiOptions: {
          max_tokens: 100
        }
      }
    );

    assert(result.cost >= 0, 'Cost should be non-negative');
    assert(result.usage.prompt_tokens > 0, 'Prompt tokens should be tracked');
    assert(result.usage.completion_tokens >= 0, 'Completion tokens should be tracked');
    assert(result.usage.total_tokens > 0, 'Total tokens should be tracked');
  });
}

/**
 * Test Suite 3: Task-Based Coordination
 */
async function testTaskBasedCoordination() {
  if (!TEST_CONFIG.openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY not set');
  }

  const coordinator = new TaskBasedCoordinator(TEST_CONFIG.openRouterApiKey);

  // Test 1: Task initialization
  await runTest('Task Coordination - Initialize Task', async () => {
    const taskState = await coordinator.initializeTask(
      'test-task-001',
      'Test task for database optimization',
      ['data', 'geordi', 'quark'],
      {
        budgetConstraint: 0.01,
        priority: 'high'
      }
    );

    assert(taskState.taskId === 'test-task-001', 'Task ID should match');
    assert(taskState.modelSelection, 'Model selection should be made');
    assert(taskState.crewMembers.length === 3, 'Crew members should be set');
    assert(taskState.quarkAnalysis, 'Quark analysis should be performed');
    assert(taskState.rikerCoordination, 'Riker coordination should be performed');
  });

  // Test 2: Crew member execution
  await runTest('Task Coordination - Crew Execution', async () => {
    // Initialize task first
    await coordinator.initializeTask(
      'test-task-002',
      'Test task for crew execution',
      ['data'],
      {}
    );

    const result = await coordinator.executeCrewRequest(
      'test-task-002',
      'data',
      'Analyze this test scenario.'
    );

    assert(result.crewMember === 'data', 'Crew member should match');
    assert(result.response, 'Response should be returned');
    assert(result.usage, 'Usage should be tracked');
    assert(result.cost >= 0, 'Cost should be tracked');
    assert(result.taskTokenPool, 'Token pool should be tracked');
  });

  // Test 3: Token pooling
  await runTest('Task Coordination - Token Pooling', async () => {
    await coordinator.initializeTask(
      'test-task-003',
      'Test token pooling',
      ['data', 'geordi'],
      {}
    );

    await coordinator.executeCrewRequest('test-task-003', 'data', 'First request');
    await coordinator.executeCrewRequest('test-task-003', 'geordi', 'Second request');

    const summary = coordinator.getTaskSummary('test-task-003');
    
    assert(summary.tokenPool.totalTokens > 0, 'Total tokens should be tracked');
    assert(summary.tokenPool.totalCost >= 0, 'Total cost should be tracked');
    assert(summary.tokenPool.crewMemberBreakdown, 'Crew member breakdown should exist');
    assert(Object.keys(summary.tokenPool.crewMemberBreakdown).length === 2, 'Both crew members should have usage');
  });

  // Test 4: Task completion
  await runTest('Task Coordination - Task Completion', async () => {
    await coordinator.initializeTask(
      'test-task-004',
      'Test task completion',
      ['data'],
      {}
    );

    await coordinator.executeCrewRequest('test-task-004', 'data', 'Complete this task');

    const finalReport = coordinator.completeTask('test-task-004');
    
    assert(finalReport.tokenPool.totalTokens > 0, 'Final report should have token data');
    assert(finalReport.duration > 0, 'Duration should be tracked');
  });
}

/**
 * Test Suite 4: Integration Tests
 */
async function testIntegration() {
  if (!TEST_CONFIG.openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY not set');
  }

  // Test 1: End-to-end task coordination
  await runTest('Integration - End-to-End Task', async () => {
    const coordinator = new TaskCoordinator(TEST_CONFIG.openRouterApiKey);

    // Initialize task
    await coordinator.initializeTask({
      taskId: 'integration-test-001',
      description: 'Integration test task',
      crewMembers: ['data', 'quark'],
      context: { priority: 'high' }
    });

    // Execute crew requests
    await coordinator.executeCrewRequest(
      'integration-test-001',
      'data',
      'Provide analysis'
    );

    await coordinator.executeCrewRequest(
      'integration-test-001',
      'quark',
      'Provide cost analysis'
    );

    // Get report
    const report = await coordinator.completeTask('integration-test-001');

    assert(report.modelUsed, 'Model should be used');
    assert(report.tokenPool.totalTokens > 0, 'Tokens should be pooled');
    assert(report.hallucinationReport, 'Hallucination report should exist');
    assert(report.duration > 0, 'Duration should be tracked');
  });
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 OPENROUTER TEST HARNESS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!TEST_CONFIG.openRouterApiKey) {
    log('OPENROUTER_API_KEY not set. Some tests will be skipped.', 'warning');
    log('Set OPENROUTER_API_KEY in environment or ~/.zshrc', 'info');
  }

  try {
    // Run test suites
    await testModelSelection();
    await testOpenRouterCalls();
    await testTaskBasedCoordination();
    await testIntegration();

    // Print summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TEST SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⏭️  Skipped: ${testResults.skipped}`);
    console.log(`📊 Total: ${testResults.passed + testResults.failed + testResults.skipped}\n`);

    if (testResults.failed > 0) {
      console.log('Failed Tests:');
      testResults.tests
        .filter(t => t.status === 'failed')
        .forEach(t => {
          console.log(`  - ${t.name}: ${t.error}`);
        });
      console.log('');
    }

    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
  } catch (error) {
    log(`Test harness error: ${error.message}`, 'error');
    if (TEST_CONFIG.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, testModelSelection, testOpenRouterCalls, testTaskBasedCoordination, testIntegration };

