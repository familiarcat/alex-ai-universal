#!/usr/bin/env node

/**
 * 🧪 Knowledge Workflows Testing Harness
 * 
 * Comprehensive test suite to verify all knowledge-related workflows are operational
 * after deactivation/reactivation cycles. Tests webhook registration, ingestion,
 * query, and other RAG operations.
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retries: 3,
  retryDelay: 2000,
  webhookWaitTime: 5000, // Wait 5 seconds after activation for webhook registration
};

// Expected workflows and their webhooks
// Based on actual workflow names from n8n UI
const EXPECTED_WORKFLOWS = [
  {
    name: 'Knowledge Ingest',
    searchTerms: ['knowledge ingest', 'knowledge-ingest', 'crew memories', 'supabase rag'],
    exactNames: ['Knowledge Ingest (Crew Memories → Supabase RAG)', 'Knowledge Ingest (Crew Memories => Supabase RAG)'],
    webhookPath: 'knowledge-ingest',
    webhookMethod: 'POST',
    priority: true, // Priority workflow for RAG system
    testPayload: {
      body: {
        title: 'Test Ingestion',
        text: 'This is a test ingestion to verify the Knowledge Ingest workflow is operational.',
        content: 'Test content for ingestion verification',
        tags: ['test', 'harness'],
        source: 'test-harness',
        doc_id: `TEST_INGEST_${Date.now()}`,
        crewMember: 'data',
        knowledgeType: 'test',
        priority: 'low',
        platform: 'test-harness',
        sessionId: `test-${Date.now()}`,
        metadata: {
          date: new Date().toISOString().split('T')[0],
          type: 'test',
          test: true
        }
      }
    }
  },
  {
    name: 'Knowledge Query',
    searchTerms: ['knowledge query', 'rag read', 'hybrid search'],
    exactNames: ['Knowledge Query (RAG READ - Hybrid Search)'],
    webhookPath: 'knowledge-query',
    webhookMethod: 'POST',
    testPayload: {
      query: 'test query',
      limit: 5,
      crewMember: 'data'
    }
  },
  {
    name: 'Knowledge Embed',
    searchTerms: ['knowledge embed', 'generate embeddings', 'ai embeddings'],
    exactNames: ['Knowledge Embed (Generate AI Embeddings)'],
    webhookPath: 'knowledge-embed',
    webhookMethod: 'POST',
    testPayload: {
      text: 'Test text for embedding generation',
      model: 'text-embedding-ada-002'
    }
  },
  {
    name: 'Knowledge Archive',
    searchTerms: ['knowledge archive', 'rag delete', 'soft delete'],
    exactNames: ['Knowledge Archive (RAG DELETE - Soft Delete)'],
    webhookPath: 'knowledge-archive',
    webhookMethod: 'POST',
    testPayload: {
      doc_id: 'TEST_DOC_123',
      soft_delete: true
    }
  }
];

// Test results storage
const testResults = {
  workflows: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

// Utility: Make HTTPS request
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: TEST_CONFIG.timeout
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Utility: Make API request with authentication
function makeApiRequest(method, path, data = null) {
  return makeRequest(method, path, data, {
    'X-N8N-API-KEY': N8N_API_KEY
  });
}

// Test: Check if workflow exists and is active
async function testWorkflowStatus(workflow) {
  try {
    const response = await makeApiRequest('GET', '/api/v1/workflows');
    let workflows = [];
    
    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        if (Array.isArray(data)) {
          workflows = data;
        } else if (data.data && Array.isArray(data.data)) {
          workflows = data.data;
        } else if (data.results && Array.isArray(data.results)) {
          workflows = data.results;
        }
      } catch (e) {
        // If parsing fails, try to extract from error message
        if (response.body.includes('unauthorized')) {
          return {
            exists: false,
            active: false,
            workflow: null,
            error: 'API unauthorized - check API key'
          };
        }
        return {
          exists: false,
          active: false,
          workflow: null,
          error: `Failed to parse response: ${e.message}`
        };
      }
    } else if (response.status === 401 || response.status === 403) {
      return {
        exists: false,
        active: false,
        workflow: null,
        error: 'API unauthorized - check API key'
      };
    }

    // First try exact name match
    let found = null;
    if (workflow.exactNames) {
      found = workflows.find(w => workflow.exactNames.includes(w.name));
    }
    
    // Fallback to search terms
    if (!found) {
      found = workflows.find(w => {
        const nameLower = w.name.toLowerCase();
        return workflow.searchTerms.some(term => nameLower.includes(term.toLowerCase()));
      });
    }

    if (!found) {
      return {
        exists: false,
        active: false,
        workflow: null,
        error: `Workflow not found. Available workflows: ${workflows.map(w => w.name).join(', ')}`
      };
    }

    return {
      exists: true,
      active: found.active || false,
      workflow: found,
      error: null
    };
  } catch (error) {
    return {
      exists: false,
      active: false,
      workflow: null,
      error: error.message
    };
  }
}

// Test: Check webhook registration
async function testWebhookRegistration(webhookPath, method = 'POST') {
  try {
    const testPayload = { test: true, timestamp: Date.now() };
    const response = await makeRequest(method, `/webhook/${webhookPath}`, testPayload);
    
    return {
      registered: response.status !== 404,
      status: response.status,
      body: response.body
    };
  } catch (error) {
    return {
      registered: false,
      status: 0,
      error: error.message
    };
  }
}

// Test: Activate workflow if inactive
async function activateWorkflow(workflowId) {
  try {
    // First deactivate to force re-registration
    await makeApiRequest('POST', `/api/v1/workflows/${workflowId}/deactivate`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Then activate
    const response = await makeApiRequest('POST', `/api/v1/workflows/${workflowId}/activate`);
    
    return {
      success: response.status === 200 || response.status === 204,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test: Execute workflow operation
async function testWorkflowOperation(workflow, retryCount = 0) {
  try {
    const response = await makeRequest(
      workflow.webhookMethod,
      `/webhook/${workflow.webhookPath}`,
      workflow.testPayload
    );

    return {
      success: response.status !== 404 && response.status < 500,
      status: response.status,
      body: response.body,
      error: null
    };
  } catch (error) {
    if (retryCount < TEST_CONFIG.retries) {
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.retryDelay));
      return testWorkflowOperation(workflow, retryCount + 1);
    }
    
    return {
      success: false,
      status: 0,
      body: null,
      error: error.message
    };
  }
}

// Run test for a single workflow
async function runWorkflowTest(workflowConfig) {
  const result = {
    name: workflowConfig.name,
    webhookPath: workflowConfig.webhookPath,
    status: 'pending',
    priority: workflowConfig.priority || false,
    tests: {
      exists: null,
      active: null,
      webhookRegistered: null,
      operationSuccess: null
    },
    errors: [],
    workflowId: null
  };

  const priorityIcon = workflowConfig.priority ? '🎯' : '🔧';
  console.log(`\n${priorityIcon} Testing: ${workflowConfig.name}${workflowConfig.priority ? ' (Priority: RAG System)' : ''}`);
  console.log('   Webhook: /webhook/' + workflowConfig.webhookPath);

  // Test 1: Check if workflow exists
  console.log('   📋 Checking workflow status...');
  const statusResult = await testWorkflowStatus(workflowConfig);
  result.tests.exists = statusResult.exists;
  result.tests.active = statusResult.active;
  result.workflowId = statusResult.workflow?.id;

  if (!statusResult.exists) {
    result.status = 'failed';
    result.errors.push(`Workflow not found: ${statusResult.error}`);
    console.log(`   ❌ Workflow not found`);
    return result;
  }

  console.log(`   ✅ Workflow exists (ID: ${statusResult.workflow.id})`);
  console.log(`   ${statusResult.active ? '✅' : '⚠️ '} Active: ${statusResult.active}`);

  // Test 2: Activate if needed
  if (!statusResult.active) {
    console.log('   🔄 Activating workflow...');
    const activateResult = await activateWorkflow(statusResult.workflow.id);
    
    if (activateResult.success) {
      console.log('   ✅ Workflow activated');
      result.tests.active = true;
      // Priority workflows get longer wait time
      const waitTime = workflowConfig.priority ? TEST_CONFIG.webhookWaitTime * 2 : TEST_CONFIG.webhookWaitTime;
      console.log(`   ⏳ Waiting ${waitTime / 1000}s for webhook registration...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    } else {
      result.errors.push(`Activation failed: ${activateResult.error}`);
      console.log(`   ❌ Activation failed: ${activateResult.error}`);
    }
  } else if (workflowConfig.priority) {
    // For priority workflows, even if active, test webhook registration
    console.log('   🎯 Priority workflow - verifying webhook registration...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Brief wait
  }

  // Test 3: Check webhook registration
  console.log('   🔗 Testing webhook registration...');
  const webhookResult = await testWebhookRegistration(workflowConfig.webhookPath, workflowConfig.webhookMethod);
  result.tests.webhookRegistered = webhookResult.registered;

  if (webhookResult.registered) {
    console.log(`   ✅ Webhook registered (Status: ${webhookResult.status})`);
  } else {
    result.errors.push(`Webhook not registered (Status: ${webhookResult.status})`);
    console.log(`   ❌ Webhook not registered (Status: ${webhookResult.status})`);
  }

  // Test 4: Test actual operation
  if (webhookResult.registered) {
    console.log('   🧪 Testing workflow operation...');
    const operationResult = await testWorkflowOperation(workflowConfig);
    result.tests.operationSuccess = operationResult.success;

    if (operationResult.success) {
      console.log(`   ✅ Operation successful (Status: ${operationResult.status})`);
    } else {
      result.errors.push(`Operation failed: ${operationResult.error || `Status ${operationResult.status}`}`);
      console.log(`   ❌ Operation failed (Status: ${operationResult.status})`);
    }
  } else {
    result.tests.operationSuccess = false;
    result.errors.push('Skipped operation test - webhook not registered');
    console.log('   ⏭️  Skipping operation test (webhook not registered)');
  }

  // Determine overall status
  if (result.tests.exists && result.tests.active && result.tests.webhookRegistered && result.tests.operationSuccess) {
    result.status = 'passed';
    testResults.summary.passed++;
  } else if (result.tests.exists && result.tests.active && result.tests.webhookRegistered) {
    result.status = 'partial';
    testResults.summary.failed++;
  } else {
    result.status = 'failed';
    testResults.summary.failed++;
  }

  return result;
}

// Print test results
function printResults() {
  console.log('\n' + '═'.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('═'.repeat(80) + '\n');

  testResults.workflows.forEach(result => {
    const icon = result.status === 'passed' ? '✅' : result.status === 'partial' ? '⚠️ ' : '❌';
    console.log(`${icon} ${result.name}`);
    console.log(`   Status: ${result.status.toUpperCase()}`);
    console.log(`   Workflow ID: ${result.workflowId || 'N/A'}`);
    console.log(`   Webhook: /webhook/${result.webhookPath}`);
    console.log(`   Tests:`);
    console.log(`      Exists: ${result.tests.exists ? '✅' : '❌'}`);
    console.log(`      Active: ${result.tests.active ? '✅' : '❌'}`);
    console.log(`      Webhook Registered: ${result.tests.webhookRegistered ? '✅' : '❌'}`);
    console.log(`      Operation Success: ${result.tests.operationSuccess ? '✅' : '❌'}`);
    
    if (result.errors.length > 0) {
      console.log(`   Errors:`);
      result.errors.forEach(error => console.log(`      - ${error}`));
    }
    console.log('');
  });

  console.log('═'.repeat(80));
  console.log(`Total: ${testResults.summary.total} | Passed: ${testResults.summary.passed} | Failed: ${testResults.summary.failed} | Skipped: ${testResults.summary.skipped}`);
  console.log('═'.repeat(80) + '\n');
}

// Main execution
async function main() {
  console.log('\n🧪 Knowledge Workflows Testing Harness');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (!N8N_API_KEY) {
    console.error('❌ N8N API key not found. Set N8N_OWNER_API_KEY or N8N_API_KEY in ~/.zshrc');
    process.exit(1);
  }

  console.log(`🔗 N8N URL: ${N8N_URL}`);
  console.log(`📋 Testing ${EXPECTED_WORKFLOWS.length} workflows\n`);

  testResults.summary.total = EXPECTED_WORKFLOWS.length;

  // Sort workflows: priority first
  const sortedWorkflows = [...EXPECTED_WORKFLOWS].sort((a, b) => {
    if (a.priority && !b.priority) return -1;
    if (!a.priority && b.priority) return 1;
    return 0;
  });

  // Run tests for each workflow (priority first)
  for (const workflow of sortedWorkflows) {
    const result = await runWorkflowTest(workflow);
    testResults.workflows.push(result);
    
    // Longer delay for priority workflows
    const delay = workflow.priority ? 2000 : 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Print results
  printResults();

  // Exit with appropriate code
  if (testResults.summary.failed === 0) {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Review results above.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Test harness failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});

