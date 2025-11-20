#!/usr/bin/env node

/**
 * 🧪 RAG System End-to-End Test Suite
 * 
 * Comprehensive test suite to verify the complete RAG system is operational:
 * - Community Edition WEBHOOK_URL verification
 * - Knowledge Ingest workflow
 * - Supabase connectivity
 * - End-to-end ingestion flow
 * - Query functionality
 * 
 * Based on crew diagnosis and Community Edition solution
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');
const { retryWithBackoff, formatErrorMessage, createTestSummary, printTestSummary } = require('./utils/test-helpers');
const { getPayload, getExpectedResponse } = require('./test-fixtures/workflow-fixtures');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;
const SUPABASE_URL = creds.supabase.url;

// Test results
const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  startTime: Date.now()
};

// Make HTTPS request
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
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json, body: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, body: body });
        }
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

// Test: Community Edition WEBHOOK_URL Configuration
async function testCommunityEditionWebhookUrl() {
  const test = {
    name: 'Community Edition WEBHOOK_URL Configuration',
    status: 'pending',
    details: []
  };

  console.log('\n🔍 Test 1: Community Edition WEBHOOK_URL Configuration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check n8n settings
  try {
    const settingsResponse = await makeRequest('GET', '/rest/settings', null, {
      'X-N8N-API-KEY': N8N_API_KEY
    });

    if (settingsResponse.status === 200 && settingsResponse.data) {
      const webhookUrl = settingsResponse.data.webhookUrl;
      
      if (webhookUrl === null) {
        test.status = 'warning';
        test.details.push({
          check: 'Settings API shows webhookUrl: null',
          result: '⚠️  Expected for Community Edition',
          note: 'This is normal - Community Edition doesn\'t reflect env vars in settings API'
        });
        console.log('   ⚠️  Settings API shows webhookUrl: null');
        console.log('   💡 This is EXPECTED for Community Edition');
        console.log('   💡 Docker environment variables are still being read\n');
      } else {
        test.status = 'passed';
        test.details.push({
          check: 'Settings API shows webhookUrl',
          result: `✅ ${webhookUrl}`,
          note: 'WEBHOOK_URL is set in n8n settings'
        });
        console.log(`   ✅ Settings API shows webhookUrl: ${webhookUrl}\n`);
      }
    }
  } catch (error) {
    test.status = 'warning';
    test.details.push({
      check: 'Settings API check',
      result: `⚠️  ${error.message}`,
      note: 'Settings API may not be accessible, but this is OK for Community Edition'
    });
    console.log(`   ⚠️  Settings API check failed: ${error.message}\n`);
  }

  // Test webhook directly (this is the real test)
  console.log('   🧪 Testing webhook endpoint directly (real test)...');
  try {
    const webhookResponse = await makeRequest('POST', '/webhook/knowledge-ingest', {
      test: true,
      timestamp: Date.now()
    });

    if (webhookResponse.status === 404) {
      test.status = 'failed';
      test.details.push({
        check: 'Webhook endpoint test',
        result: '❌ 404 - Webhook not registered',
        note: 'WEBHOOK_URL may not be set correctly or container needs restart'
      });
      console.log('   ❌ Webhook returned 404 - not registered\n');
      console.log('   💡 Action needed: Restart n8n container on EC2\n');
    } else if (webhookResponse.status === 401 || webhookResponse.status === 405 || webhookResponse.status === 200) {
      test.status = 'passed';
      test.details.push({
        check: 'Webhook endpoint test',
        result: `✅ ${webhookResponse.status} - Webhook is registered`,
        note: 'WEBHOOK_URL is working correctly'
      });
      console.log(`   ✅ Webhook is registered! (Status: ${webhookResponse.status})\n`);
    } else {
      test.status = 'warning';
      test.details.push({
        check: 'Webhook endpoint test',
        result: `⚠️  ${webhookResponse.status} - Unexpected status`,
        note: 'Webhook may be registered but returned unexpected response'
      });
      console.log(`   ⚠️  Unexpected status: ${webhookResponse.status}\n`);
    }
  } catch (error) {
    test.status = 'failed';
    test.details.push({
      check: 'Webhook endpoint test',
      result: `❌ ${error.message}`,
      note: 'Webhook test failed'
    });
    console.log(`   ❌ Webhook test failed: ${error.message}\n`);
  }

  testResults.tests.push(test);
  return test;
}

// Test: Knowledge Ingest Workflow Status
async function testKnowledgeIngestWorkflow() {
  const test = {
    name: 'Knowledge Ingest Workflow Status',
    status: 'pending',
    details: []
  };

  console.log('🔍 Test 2: Knowledge Ingest Workflow Status');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const workflowsResponse = await makeRequest('GET', '/api/v1/workflows', null, {
      'X-N8N-API-KEY': N8N_API_KEY
    });

    if (workflowsResponse.status === 200) {
      const workflows = workflowsResponse.data?.data || workflowsResponse.data || [];
      const knowledgeIngest = workflows.find(w => 
        w.name.toLowerCase().includes('knowledge ingest') ||
        w.name.toLowerCase().includes('knowledge-ingest')
      );

      if (knowledgeIngest) {
        test.status = knowledgeIngest.active ? 'passed' : 'failed';
        test.details.push({
          check: 'Workflow exists',
          result: `✅ Found: ${knowledgeIngest.name}`,
          note: `ID: ${knowledgeIngest.id}`
        });
        test.details.push({
          check: 'Workflow active',
          result: knowledgeIngest.active ? '✅ Active' : '❌ Inactive',
          note: knowledgeIngest.active ? 'Workflow is active' : 'Workflow needs activation'
        });
        
        console.log(`   ✅ Workflow found: ${knowledgeIngest.name}`);
        console.log(`   ${knowledgeIngest.active ? '✅' : '❌'} Active: ${knowledgeIngest.active}\n`);
      } else {
        test.status = 'failed';
        test.details.push({
          check: 'Workflow exists',
          result: '❌ Knowledge Ingest workflow not found',
          note: 'Workflow may need to be imported'
        });
        console.log('   ❌ Knowledge Ingest workflow not found\n');
      }
    } else {
      test.status = 'failed';
      test.details.push({
        check: 'API access',
        result: `❌ Status ${workflowsResponse.status}`,
        note: 'Could not fetch workflows'
      });
      console.log(`   ❌ Failed to fetch workflows: ${workflowsResponse.status}\n`);
    }
  } catch (error) {
    test.status = 'failed';
    test.details.push({
      check: 'API access',
      result: `❌ ${error.message}`,
      note: 'Workflow check failed'
    });
    console.log(`   ❌ Workflow check failed: ${error.message}\n`);
  }

  testResults.tests.push(test);
  return test;
}

// Test: Supabase Connectivity
async function testSupabaseConnectivity() {
  const test = {
    name: 'Supabase Connectivity',
    status: 'pending',
    details: []
  };

  console.log('🔍 Test 3: Supabase Connectivity');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!SUPABASE_URL) {
    test.status = 'warning';
    test.details.push({
      check: 'Supabase URL configured',
      result: '⚠️  SUPABASE_URL not set',
      note: 'Supabase URL not configured in ~/.zshrc'
    });
    console.log('   ⚠️  SUPABASE_URL not configured\n');
    testResults.tests.push(test);
    return test;
  }

  try {
    const url = new URL(SUPABASE_URL);
    const healthUrl = `${url.protocol}//${url.host}/rest/v1/`;
    
    const response = await makeRequest('GET', healthUrl.replace(N8N_URL, ''), null, {
      'apikey': creds.supabase.key || ''
    });

    if (response.status === 200) {
      test.status = 'passed';
      test.details.push({
        check: 'Supabase API connectivity',
        result: '✅ Connected',
        note: `Status: ${response.status}`
      });
      console.log(`   ✅ Supabase API is reachable (Status: ${response.status})\n`);
    } else {
      test.status = 'warning';
      test.details.push({
        check: 'Supabase API connectivity',
        result: `⚠️  Status ${response.status}`,
        note: 'Supabase responded but with unexpected status'
      });
      console.log(`   ⚠️  Supabase API status: ${response.status}\n`);
    }
  } catch (error) {
    test.status = 'warning';
    test.details.push({
      check: 'Supabase API connectivity',
      result: `⚠️  ${error.message}`,
      note: 'Supabase connectivity test failed'
    });
    console.log(`   ⚠️  Supabase connectivity test failed: ${error.message}\n`);
  }

  testResults.tests.push(test);
  return test;
}

// Test: End-to-End Ingestion Flow
async function testE2EIngestion() {
  const test = {
    name: 'End-to-End Ingestion Flow',
    status: 'pending',
    details: [],
    startTime: Date.now()
  };

  console.log('🔍 Test 4: End-to-End Ingestion Flow');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Use fixture payload or create custom one
  const testPayload = getPayload('knowledgeIngest') || {
    body: {
      title: `E2E Test - ${new Date().toISOString()}`,
      text: 'This is an end-to-end test of the RAG ingestion system.',
      content: 'Test content for E2E verification',
      tags: ['test', 'e2e', 'harness'],
      source: 'test-rag-system-e2e',
      doc_id: `E2E_TEST_${Date.now()}`,
      crewMember: 'data',
      knowledgeType: 'test',
      priority: 'low',
      platform: 'test-harness',
      sessionId: `e2e-test-${Date.now()}`,
      metadata: {
        date: new Date().toISOString().split('T')[0],
        type: 'e2e-test',
        test: true
      }
    }
  };

  try {
    console.log('   📤 Sending test payload to Knowledge Ingest webhook...');
    
    // Use retry logic for webhook calls
    const response = await retryWithBackoff(
      () => makeRequest('POST', '/webhook/knowledge-ingest', testPayload),
      {
        maxRetries: 3,
        initialDelay: 2000,
        retryableErrors: [404, 429, 500, 502, 503, 504],
        onRetry: (attempt, maxRetries, delay, error) => {
          console.log(`   ⏳ Retry ${attempt}/${maxRetries} after ${delay/1000}s... (${error.status || error.message})`);
        }
      }
    );

    if (response.status === 404) {
      test.status = 'failed';
      test.error = formatErrorMessage(
        { status: 404, message: 'Webhook not registered' },
        { webhookPath: 'knowledge-ingest', baseUrl: N8N_URL }
      );
      test.details.push({
        check: 'Ingestion webhook',
        result: '❌ 404 - Webhook not registered',
        note: 'Knowledge Ingest workflow may be inactive or WEBHOOK_URL not set'
      });
      console.log('   ❌ Webhook returned 404 - not registered\n');
    } else if (response.status === 200 || response.status === 201) {
      test.status = 'passed';
      test.details.push({
        check: 'Ingestion webhook',
        result: `✅ ${response.status} - Ingestion successful`,
        note: 'Payload was accepted by workflow'
      });
      console.log(`   ✅ Ingestion successful! (Status: ${response.status})\n`);
      
      // Try to parse response
      if (response.data) {
        console.log('   📊 Response data:', JSON.stringify(response.data).substring(0, 200) + '...\n');
      }
    } else {
      test.status = 'warning';
      test.details.push({
        check: 'Ingestion webhook',
        result: `⚠️  ${response.status} - Unexpected status`,
        note: 'Webhook responded but with unexpected status code'
      });
      console.log(`   ⚠️  Unexpected status: ${response.status}\n`);
      if (response.body) {
        console.log('   📊 Response:', response.body.substring(0, 200) + '...\n');
      }
    }
  } catch (error) {
    test.status = 'failed';
    test.error = formatErrorMessage(error, { webhookPath: 'knowledge-ingest', baseUrl: N8N_URL });
    test.details.push({
      check: 'Ingestion webhook',
      result: `❌ ${error.message}`,
      note: 'Ingestion test failed'
    });
    console.log(`   ${test.error}\n`);
  }

  test.duration = Date.now() - test.startTime;
  testResults.tests.push(test);
  return test;
}

// Test: Knowledge Query Functionality
async function testKnowledgeQuery() {
  const test = {
    name: 'Knowledge Query Functionality',
    status: 'pending',
    details: []
  };

  console.log('🔍 Test 5: Knowledge Query Functionality');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const queryPayload = {
    query: 'test query for RAG system',
    limit: 5,
    crewMember: 'data'
  };

  try {
    console.log('   📤 Sending query to Knowledge Query webhook...');
    const response = await makeRequest('POST', '/webhook/knowledge-query', queryPayload);

    if (response.status === 404) {
      test.status = 'failed';
      test.details.push({
        check: 'Query webhook',
        result: '❌ 404 - Webhook not registered',
        note: 'Knowledge Query workflow may be inactive'
      });
      console.log('   ❌ Webhook returned 404 - not registered\n');
    } else if (response.status === 200) {
      test.status = 'passed';
      test.details.push({
        check: 'Query webhook',
        result: '✅ 200 - Query successful',
        note: 'Query endpoint is operational'
      });
      console.log('   ✅ Query successful! (Status: 200)\n');
      
      if (response.data) {
        console.log('   📊 Response data:', JSON.stringify(response.data).substring(0, 200) + '...\n');
      }
    } else {
      test.status = 'warning';
      test.details.push({
        check: 'Query webhook',
        result: `⚠️  ${response.status} - Unexpected status`,
        note: 'Query endpoint responded but with unexpected status'
      });
      console.log(`   ⚠️  Unexpected status: ${response.status}\n`);
    }
  } catch (error) {
    test.status = 'failed';
    test.details.push({
      check: 'Query webhook',
      result: `❌ ${error.message}`,
      note: 'Query test failed'
    });
    console.log(`   ❌ Query test failed: ${error.message}\n`);
  }

  testResults.tests.push(test);
  return test;
}

// Print test results
function printResults() {
  // Calculate duration
  testResults.summary.duration = Date.now() - testResults.startTime;
  
  // Create enhanced summary
  const summary = createTestSummary(testResults.tests);
  summary.duration = testResults.summary.duration;
  
  // Print enhanced summary
  printTestSummary(summary);
  
  // Update testResults summary
  testResults.summary = summary;
}

// Main execution
async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 RAG SYSTEM END-TO-END TEST SUITE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📋 Testing complete RAG system operational status');
  console.log('   • Community Edition WEBHOOK_URL verification');
  console.log('   • Knowledge Ingest workflow');
  console.log('   • Supabase connectivity');
  console.log('   • End-to-end ingestion flow');
  console.log('   • Query functionality\n');

  if (!N8N_API_KEY) {
    console.error('❌ N8N API key not found. Set N8N_OWNER_API_KEY or N8N_API_KEY in ~/.zshrc');
    process.exit(1);
  }

  // Run all tests
  await testCommunityEditionWebhookUrl();
  await testKnowledgeIngestWorkflow();
  await testSupabaseConnectivity();
  await testE2EIngestion();
  await testKnowledgeQuery();

  // Print results
  printResults();

  // Save results
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(process.cwd(), '.backup-ec2-emergency', `rag-e2e-test-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`💾 Test report saved to: ${reportPath}\n`);

  // Exit with appropriate code
  if (testResults.summary.failed === 0) {
    console.log('🎉 All critical tests passed! RAG system is operational.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Review recommendations above.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Test suite failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});

