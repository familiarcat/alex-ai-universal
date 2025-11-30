#!/usr/bin/env node

/**
 * 🧪 Knowledge Workflows Webhook Testing Harness
 * 
 * Tests webhook endpoints directly without requiring API authentication.
 * Useful when workflows are active but API access is limited.
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');
const { retryWithBackoff, formatErrorMessage, createTestSummary, printTestSummary } = require('./utils/test-helpers');
const { getPayload } = require('./test-fixtures/workflow-fixtures');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';

// Expected webhooks based on workflow names from n8n UI
// Use fixtures when available, fallback to inline definitions
const EXPECTED_WEBHOOKS = [
  {
    name: 'Knowledge Ingest',
    webhookPath: 'knowledge-ingest',
    webhookMethod: 'POST',
    description: 'Crew Memories → Supabase RAG',
    testPayload: getPayload('knowledgeIngest') || {
      body: {
        title: 'Test Ingestion - Harness',
        text: 'This is a test ingestion to verify the Knowledge Ingest workflow is operational after reactivation.',
        content: 'Test content for ingestion verification from testing harness',
        tags: ['test', 'harness', 'reactivation-test'],
        source: 'test-harness',
        doc_id: `TEST_INGEST_HARNESS_${Date.now()}`,
        crewMember: 'data',
        knowledgeType: 'test',
        priority: 'low',
        platform: 'test-harness',
        sessionId: `harness-test-${Date.now()}`,
        metadata: {
          date: new Date().toISOString().split('T')[0],
          type: 'test',
          test: true,
          harness: true
        }
      }
    }
  },
  {
    name: 'Knowledge Query',
    webhookPath: 'knowledge-query',
    webhookMethod: 'POST',
    description: 'RAG READ - Hybrid Search',
    testPayload: getPayload('knowledgeQuery') || {
      query: 'test query from harness',
      limit: 5,
      crewMember: 'data'
    }
  },
  {
    name: 'Knowledge Embed',
    webhookPath: 'knowledge-embed',
    webhookMethod: 'POST',
    description: 'Generate AI Embeddings',
    testPayload: getPayload('knowledgeEmbed') || {
      text: 'Test text for embedding generation from harness',
      model: 'text-embedding-ada-002'
    }
  },
  {
    name: 'Knowledge Archive',
    webhookPath: 'knowledge-archive',
    webhookMethod: 'POST',
    description: 'RAG DELETE - Soft Delete',
    testPayload: getPayload('knowledgeArchive') || {
      doc_id: `TEST_DOC_HARNESS_${Date.now()}`,
      soft_delete: true
    }
  }
];

const testResults = {
  webhooks: [],
  summary: {
    total: 0,
    registered: 0,
    operational: 0,
    failed: 0
  },
  startTime: Date.now()
};

// Test webhook registration and operation
async function testWebhook(webhookConfig) {
  const result = {
    name: webhookConfig.name,
    description: webhookConfig.description,
    webhookPath: webhookConfig.webhookPath,
    registered: false,
    operational: false,
    status: null,
    response: null,
    error: null
  };

  console.log(`\n🔍 Testing: ${webhookConfig.name}`);
  console.log(`   Description: ${webhookConfig.description}`);
  console.log(`   Webhook: /webhook/${webhookConfig.webhookPath}`);

  // Test 1: Check if webhook is registered (not 404) with retry logic
  console.log('   📋 Checking webhook registration...');
  try {
    const testPayload = { test: true, timestamp: Date.now() };
    
    const registrationResult = await retryWithBackoff(
      () => makeRequest(
        webhookConfig.webhookMethod,
        `/webhook/${webhookConfig.webhookPath}`,
        testPayload
      ),
      {
        maxRetries: 3,
        initialDelay: 2000,
        retryableErrors: [404, 429, 500, 502, 503, 504],
        onRetry: (attempt, maxRetries, delay, error) => {
          console.log(`   ⏳ Retry ${attempt}/${maxRetries} after ${delay/1000}s... (${error.status || error.message})`);
        }
      }
    );

    result.registered = registrationResult.status !== 404;
    result.status = registrationResult.status;

    if (result.registered) {
      console.log(`   ✅ Webhook registered (Status: ${registrationResult.status})`);
      testResults.summary.registered++;
    } else {
      console.log(`   ❌ Webhook not registered (Status: ${registrationResult.status})`);
      result.error = formatErrorMessage(
        { status: 404, message: 'Webhook not registered' },
        { webhookPath: webhookConfig.webhookPath, baseUrl: N8N_URL }
      );
      testResults.summary.failed++;
      return result;
    }
  } catch (error) {
    console.log(`   ${formatErrorMessage(error, { webhookPath: webhookConfig.webhookPath, baseUrl: N8N_URL })}`);
    result.error = formatErrorMessage(error, { webhookPath: webhookConfig.webhookPath, baseUrl: N8N_URL });
    testResults.summary.failed++;
    return result;
  }

  // Test 2: Test actual operation with proper payload
  if (result.registered) {
    console.log('   🧪 Testing workflow operation...');
    try {
      const operationResult = await makeRequest(
        webhookConfig.webhookMethod,
        `/webhook/${webhookConfig.webhookPath}`,
        webhookConfig.testPayload
      );

      // Consider operational if status is not 404/500
      result.operational = operationResult.status !== 404 && operationResult.status < 500;
      result.response = operationResult.body;

      if (result.operational) {
        console.log(`   ✅ Operation successful (Status: ${operationResult.status})`);
        testResults.summary.operational++;
      } else {
        console.log(`   ⚠️  Operation returned error status: ${operationResult.status}`);
        result.error = `Operation failed with status ${operationResult.status}`;
      }
    } catch (error) {
      console.log(`   ❌ Operation failed: ${error.message}`);
      result.error = error.message;
    }
  }

  return result;
}

// Make HTTPS request
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000
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

// Print results
function printResults() {
  // Convert webhook results to test format for summary
  const testFormatResults = testResults.webhooks.map(result => ({
    name: result.name,
    status: result.registered && result.operational ? 'passed' :
            result.registered ? 'warning' : 'failed',
    error: result.error || null,
    duration: 0
  }));

  // Create and print enhanced summary
  const summary = createTestSummary(testFormatResults);
  summary.duration = Date.now() - testResults.startTime;
  
  // Print detailed webhook info
  console.log('\n' + '═'.repeat(80));
  console.log('📊 WEBHOOK TEST DETAILS');
  console.log('═'.repeat(80) + '\n');

  testResults.webhooks.forEach(result => {
    const icon = result.registered && result.operational ? '✅' : 
                 result.registered ? '⚠️ ' : '❌';
    console.log(`${icon} ${result.name}`);
    console.log(`   Description: ${result.description}`);
    console.log(`   Webhook: /webhook/${result.webhookPath}`);
    console.log(`   Registered: ${result.registered ? '✅' : '❌'}`);
    console.log(`   Operational: ${result.operational ? '✅' : '❌'}`);
    console.log(`   Status: ${result.status || 'N/A'}`);
    
    if (result.error && result.error.includes('💡')) {
      // Error already formatted with actionable steps
      console.log(`   ${result.error}`);
    } else if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    if (result.response) {
      try {
        const parsed = JSON.parse(result.response);
        if (parsed.message || parsed.error) {
          console.log(`   Response: ${parsed.message || parsed.error}`);
        }
      } catch (e) {
        // Not JSON, skip
      }
    }
    console.log('');
  });

  // Print enhanced summary
  printTestSummary(summary);
}

// Main execution
async function main() {
  console.log('\n🧪 Knowledge Workflows Webhook Testing Harness');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`🔗 N8N URL: ${N8N_URL}`);
  console.log(`📋 Testing ${EXPECTED_WEBHOOKS.length} webhook endpoints\n`);
  console.log('💡 This test verifies webhook registration and operation');
  console.log('   without requiring API authentication.\n');

  testResults.summary.total = EXPECTED_WEBHOOKS.length;

  // Test each webhook
  for (const webhook of EXPECTED_WEBHOOKS) {
    const result = await testWebhook(webhook);
    testResults.webhooks.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Print results
  printResults();

  // Determine exit code
  if (testResults.summary.failed === 0 && testResults.summary.operational === testResults.summary.total) {
    console.log('🎉 All webhooks are registered and operational!\n');
    process.exit(0);
  } else if (testResults.summary.registered === testResults.summary.total) {
    console.log('⚠️  All webhooks are registered, but some operations failed.\n');
    process.exit(1);
  } else {
    console.log('❌ Some webhooks are not registered. Activate workflows in n8n UI.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Test harness failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});

