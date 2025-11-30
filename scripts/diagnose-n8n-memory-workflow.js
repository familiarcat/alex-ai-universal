#!/usr/bin/env node
/**
 * Diagnose N8N Memory Workflow
 * 
 * Checks N8N workflow configuration, execution status, and Supabase connectivity
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

// Load credentials
function loadCrewCredentials() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  const credentials = {};

  const supabaseUrlMatch = zshrcContent.match(/export SUPABASE_URL=['"]?([^'"\n]+)['"]?/);
  const supabaseKeyMatch = zshrcContent.match(/export SUPABASE_SERVICE_ROLE_KEY=['"]?([^'"\n]+)['"]?/);
  const n8nUrlMatch = zshrcContent.match(/export N8N_URL=['"]?([^'"\n]+)['"]?/);
  const n8nApiKeyMatch = zshrcContent.match(/export N8N_OWNER_API_KEY=['"]?([^'"\n]+)['"]?/);

  if (supabaseUrlMatch) credentials.supabase = { url: supabaseUrlMatch[1] };
  if (supabaseKeyMatch) {
    if (!credentials.supabase) credentials.supabase = {};
    credentials.supabase.key = supabaseKeyMatch[1];
  }
  if (n8nUrlMatch) credentials.n8n = { baseUrl: n8nUrlMatch[1] };
  if (n8nApiKeyMatch) {
    if (!credentials.n8n) credentials.n8n = {};
    credentials.n8n.apiKey = n8nApiKeyMatch[1];
  }

  return credentials;
}

// Query N8N API
function queryN8N(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const creds = loadCrewCredentials();
    const N8N_BASE_URL = creds.n8n?.baseUrl || 'https://n8n.pbradygeorgen.com';
    const N8N_API_KEY = creds.n8n?.apiKey;

    if (!N8N_API_KEY) {
      reject(new Error('N8N API key not found'));
      return;
    }

    const url = new URL(endpoint, `${N8N_BASE_URL}/api/v1`);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

    if (data) {
      const dataStr = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(dataStr);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: result });
          } else {
            reject(new Error(`N8N returned ${res.statusCode}: ${JSON.stringify(result)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: body });
          } else {
            reject(new Error(`N8N returned ${res.statusCode}: ${body.substring(0, 200)}`));
          }
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

// Query Supabase
function querySupabase(endpoint) {
  return new Promise((resolve, reject) => {
    const creds = loadCrewCredentials();
    const SUPABASE_URL = creds.supabase?.url;
    const SUPABASE_KEY = creds.supabase?.key;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      reject(new Error('Supabase credentials not found'));
      return;
    }

    const url = new URL(endpoint, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: result });
          } else {
            reject(new Error(`Supabase returned ${res.statusCode}: ${JSON.stringify(result)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: body });
          } else {
            reject(new Error(`Supabase returned ${res.statusCode}: ${body.substring(0, 200)}`));
          }
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function main() {
  console.log('\n' + '═'.repeat(80));
  console.log('🔍 N8N MEMORY WORKFLOW DIAGNOSTIC');
  console.log('═'.repeat(80));
  console.log('\nDiagnosing crew-memory-storage workflow configuration and connectivity...\n');

  const creds = loadCrewCredentials();
  const results = {
    n8nConnectivity: null,
    workflowStatus: null,
    supabaseConnectivity: null,
    tableCheck: null,
    recentExecutions: null,
    recommendations: []
  };

  // Test 1: N8N API Connectivity
  console.log('1️⃣  Testing N8N API Connectivity...');
  console.log('─'.repeat(80));
  try {
    const n8nTest = await queryN8N('/workflows');
    console.log(`   ✅ N8N API accessible (Status: ${n8nTest.status})`);
    results.n8nConnectivity = { success: true, status: n8nTest.status };
  } catch (error) {
    console.error(`   ❌ N8N API not accessible: ${error.message}`);
    results.n8nConnectivity = { success: false, error: error.message };
    results.recommendations.push('Check N8N API key in ~/.zshrc (N8N_OWNER_API_KEY)');
  }

  // Test 2: Find crew-memory-storage workflow
  console.log('\n2️⃣  Finding crew-memory-storage Workflow...');
  console.log('─'.repeat(80));
  try {
    const workflows = await queryN8N('/workflows');
    const workflowList = Array.isArray(workflows.data) ? workflows.data : workflows.data?.data || [];
    const memoryWorkflow = workflowList.find(w => 
      w.name?.toLowerCase().includes('crew-memory-storage') ||
      w.name?.toLowerCase().includes('memory-storage') ||
      w.nodes?.some(n => n.webhookId === 'crew-memory-storage')
    );

    if (memoryWorkflow) {
      console.log(`   ✅ Found workflow: "${memoryWorkflow.name}"`);
      console.log(`      ID: ${memoryWorkflow.id}`);
      console.log(`      Active: ${memoryWorkflow.active ? '✅ Yes' : '❌ No'}`);
      console.log(`      Nodes: ${memoryWorkflow.nodes?.length || 0}`);
      
      // Check for Supabase node
      const supabaseNode = memoryWorkflow.nodes?.find(n => 
        n.name?.toLowerCase().includes('supabase') ||
        n.type === 'n8n-nodes-base.supabase'
      );
      
      if (supabaseNode) {
        console.log(`      Supabase Node: ✅ Found (${supabaseNode.name})`);
      } else {
        console.log(`      Supabase Node: ⚠️  Not found (check workflow configuration)`);
        results.recommendations.push('Workflow may not have Supabase storage node configured');
      }

      // Check webhook configuration
      const webhookNode = memoryWorkflow.nodes?.find(n => 
        n.webhookId === 'crew-memory-storage' ||
        n.parameters?.path === 'crew-memory-storage'
      );
      
      if (webhookNode) {
        console.log(`      Webhook: ✅ Configured (path: ${webhookNode.parameters?.path || webhookNode.webhookId})`);
      } else {
        console.log(`      Webhook: ⚠️  Not found`);
        results.recommendations.push('Webhook node may not be configured correctly');
      }

      results.workflowStatus = {
        success: true,
        workflow: {
          id: memoryWorkflow.id,
          name: memoryWorkflow.name,
          active: memoryWorkflow.active,
          hasSupabaseNode: !!supabaseNode,
          hasWebhook: !!webhookNode
        }
      };

      if (!memoryWorkflow.active) {
        results.recommendations.push('Workflow is not active - activate it in N8N UI');
      }
    } else {
      console.log('   ⚠️  crew-memory-storage workflow not found');
      results.workflowStatus = { success: false, reason: 'Workflow not found' };
      results.recommendations.push('Import crew-memory-storage-workflow.json to N8N');
    }
  } catch (error) {
    console.error(`   ❌ Failed to find workflow: ${error.message}`);
    results.workflowStatus = { success: false, error: error.message };
  }

  // Test 3: Check recent workflow executions
  console.log('\n3️⃣  Checking Recent Workflow Executions...');
  console.log('─'.repeat(80));
  try {
    const executions = await queryN8N('/executions?limit=10');
    const executionList = Array.isArray(executions.data) ? executions.data : executions.data?.data || [];
    
    const memoryExecutions = executionList.filter(e => 
      e.workflowId === results.workflowStatus?.workflow?.id ||
      e.workflowData?.name?.toLowerCase().includes('memory')
    );

    console.log(`   Found ${memoryExecutions.length} recent memory workflow execution(s)`);
    
    if (memoryExecutions.length > 0) {
      memoryExecutions.slice(0, 3).forEach((exec, idx) => {
        const status = exec.finished ? (exec.stoppedAt ? '✅ Success' : '❌ Failed') : '⏳ Running';
        console.log(`      ${idx + 1}. ${status} - ${new Date(exec.startedAt).toLocaleString()}`);
        if (exec.stoppedAt && !exec.finished) {
          console.log(`         Error: ${exec.data?.resultData?.error?.message || 'Unknown error'}`);
        }
      });
    } else {
      console.log('   ⚠️  No recent executions found');
      results.recommendations.push('No workflow executions - test the webhook to trigger execution');
    }

    results.recentExecutions = {
      total: executionList.length,
      memoryWorkflow: memoryExecutions.length,
      recent: memoryExecutions.slice(0, 3).map(e => ({
        status: e.finished ? 'success' : 'failed',
        startedAt: e.startedAt,
        stoppedAt: e.stoppedAt
      }))
    };
  } catch (error) {
    console.error(`   ❌ Failed to check executions: ${error.message}`);
    results.recentExecutions = { error: error.message };
  }

  // Test 4: Supabase Connectivity
  console.log('\n4️⃣  Testing Supabase Connectivity...');
  console.log('─'.repeat(80));
  try {
    const supabaseTest = await querySupabase('/rest/v1/');
    console.log(`   ✅ Supabase REST API accessible (Status: ${supabaseTest.status})`);
    results.supabaseConnectivity = { success: true, status: supabaseTest.status };
  } catch (error) {
    console.error(`   ❌ Supabase not accessible: ${error.message}`);
    results.supabaseConnectivity = { success: false, error: error.message };
    results.recommendations.push('Check Supabase credentials in ~/.zshrc');
  }

  // Test 5: Check for both tables (crew_memories and alex_ai_memories)
  console.log('\n5️⃣  Checking Supabase Tables...');
  console.log('─'.repeat(80));
  
  const tablesToCheck = ['crew_memories', 'alex_ai_memories'];
  const tableResults = {};

  for (const tableName of tablesToCheck) {
    try {
      const tableCheck = await querySupabase(`/rest/v1/${tableName}?limit=1`);
      const count = await querySupabase(`/rest/v1/${tableName}?select=id&limit=1000`);
      const recordCount = Array.isArray(count.data) ? count.data.length : 0;
      
      console.log(`   ✅ Table "${tableName}" exists (${recordCount} record(s))`);
      tableResults[tableName] = { exists: true, recordCount };
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log(`   ❌ Table "${tableName}" does not exist`);
        tableResults[tableName] = { exists: false };
        results.recommendations.push(`Table "${tableName}" missing - may need to run migrations`);
      } else {
        console.log(`   ⚠️  Error checking "${tableName}": ${error.message}`);
        tableResults[tableName] = { exists: null, error: error.message };
      }
    }
  }

  results.tableCheck = tableResults;

  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('═'.repeat(80));

  const allChecks = [
    { name: 'N8N API Connectivity', result: results.n8nConnectivity },
    { name: 'Workflow Status', result: results.workflowStatus },
    { name: 'Supabase Connectivity', result: results.supabaseConnectivity },
    { name: 'Table Check', result: results.tableCheck }
  ];

  allChecks.forEach(check => {
    const status = check.result?.success || (check.result && typeof check.result === 'object' && !check.result.error) ? '✅' : '❌';
    console.log(`   ${status} ${check.name}`);
  });

  if (results.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    results.recommendations.forEach((rec, idx) => {
      console.log(`   ${idx + 1}. ${rec}`);
    });
  }

  // Save results
  const resultsPath = path.join(__dirname, '..', '.backup-ec2-emergency', 'N8N_WORKFLOW_DIAGNOSTIC.json');
  const resultsDir = path.dirname(resultsPath);
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Diagnostic results saved to: ${resultsPath}\n`);
}

main().catch(error => {
  console.error(`\n❌ Diagnostic failed: ${error.message}`);
  if (error.stack) {
    console.error('   Stack:', error.stack);
  }
  process.exit(1);
});

