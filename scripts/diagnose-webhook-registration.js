#!/usr/bin/env node

/**
 * 🔍 Diagnose Webhook Registration Issue
 * 
 * Comprehensive diagnostic to identify why webhook isn't registering
 * even after manual UI toggle and proper configuration.
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 WEBHOOK REGISTRATION DIAGNOSTIC');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

function makeApiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
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
          resolve({ status: res.statusCode, data: body, body: body });
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

async function testWebhook(path) {
  return new Promise((resolve) => {
    const url = new URL(`/webhook/${path}`, N8N_URL);
    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, registered: res.statusCode !== 404, body });
      });
    });
    req.on('error', () => resolve({ status: 0, registered: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, registered: false });
    });
    req.write(JSON.stringify({ test: true }));
    req.end();
  });
}

async function main() {
  const diagnostics = {
    workflow: {},
    webhook: {},
    settings: {},
    recommendations: []
  };

  // 1. Check workflow status
  console.log('1️⃣  Checking workflow status...');
  try {
    const workflowsResponse = await makeApiRequest('GET', '/api/v1/workflows');
    let workflows = [];
    const data = workflowsResponse.data;
    if (Array.isArray(data)) {
      workflows = data;
    } else if (data.data && Array.isArray(data.data)) {
      workflows = data.data;
    } else if (data.results && Array.isArray(data.results)) {
      workflows = data.results;
    }
    
    const workflow = workflows.find(w => 
      w.name.includes('Knowledge Base RAG Ingestion') && !w.name.includes('Clean')
    );
    
    if (workflow) {
      diagnostics.workflow = {
        name: workflow.name,
        id: workflow.id,
        active: workflow.active,
        found: true
      };
      console.log(`   ✅ Found: ${workflow.name}`);
      console.log(`   📋 ID: ${workflow.id}`);
      console.log(`   🔄 Active: ${workflow.active ? 'Yes' : 'No'}\n`);
      
      if (!workflow.active) {
        diagnostics.recommendations.push('Workflow is not active - activate it in UI');
      }
    } else {
      console.log('   ❌ Workflow not found\n');
      diagnostics.workflow.found = false;
      diagnostics.recommendations.push('Knowledge Ingest workflow not found');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // 2. Check workflow details and webhook node
  if (diagnostics.workflow.found) {
    console.log('2️⃣  Checking webhook node configuration...');
    try {
      const detailResponse = await makeApiRequest('GET', `/api/v1/workflows/${diagnostics.workflow.id}`);
      const workflowData = detailResponse.data.data || detailResponse.data;
      
      const webhookNode = (workflowData.nodes || []).find(n => 
        n.type && (n.type.includes('webhook') || n.type.includes('Webhook'))
      );
      
      if (webhookNode) {
        const path = webhookNode.parameters?.path || webhookNode.parameters?.options?.path || 'N/A';
        const method = webhookNode.parameters?.httpMethod || webhookNode.parameters?.method || 'POST';
        
        diagnostics.webhook = {
          found: true,
          path: path,
          method: method,
          nodeId: webhookNode.id,
          nodeName: webhookNode.name
        };
        
        console.log(`   ✅ Webhook node found: ${webhookNode.name}`);
        console.log(`   📍 Path: ${path}`);
        console.log(`   🔧 Method: ${method}\n`);
        
        // Test webhook
        console.log('3️⃣  Testing webhook endpoint...');
        const testResult = await testWebhook(path);
        console.log(`   Status: ${testResult.status}`);
        console.log(`   Registered: ${testResult.registered ? '✅ Yes' : '❌ No'}\n`);
        
        diagnostics.webhook.testResult = testResult;
        
        if (!testResult.registered) {
          diagnostics.recommendations.push(`Webhook at /webhook/${path} is not registered (404)`);
        }
      } else {
        console.log('   ❌ No webhook node found in workflow\n');
        diagnostics.webhook.found = false;
        diagnostics.recommendations.push('No webhook node found in workflow');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  // 4. Check n8n settings
  console.log('4️⃣  Checking n8n settings...');
  try {
    const settingsResponse = await makeApiRequest('GET', '/rest/settings');
    if (settingsResponse.status === 200) {
      const settings = settingsResponse.data;
      diagnostics.settings = {
        webhookUrl: settings.webhookUrl,
        baseUrl: settings.baseUrl,
        timezone: settings.timezone
      };
      console.log(`   Webhook URL: ${settings.webhookUrl || 'null (expected for Community Edition)'}`);
      console.log(`   Base URL: ${settings.baseUrl || 'N/A'}\n`);
      
      if (!settings.webhookUrl) {
        diagnostics.recommendations.push('WEBHOOK_URL is null in settings (expected for Community Edition, but verify container env)');
      }
    } else {
      console.log(`   ⚠️  Settings API returned status ${settingsResponse.status}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // 5. Summary and recommendations
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('Workflow:');
  console.log(`   Found: ${diagnostics.workflow.found ? '✅' : '❌'}`);
  console.log(`   Active: ${diagnostics.workflow.active ? '✅' : '❌'}`);
  
  if (diagnostics.webhook.found) {
    console.log('\nWebhook:');
    console.log(`   Found: ✅`);
    console.log(`   Path: ${diagnostics.webhook.path}`);
    console.log(`   Registered: ${diagnostics.webhook.testResult?.registered ? '✅' : '❌'}`);
  }
  
  if (diagnostics.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    diagnostics.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
  }
  
  console.log('\n🔧 Next Steps:');
  if (!diagnostics.webhook.testResult?.registered) {
    console.log('   1. Verify WEBHOOK_URL in container: docker exec n8n env | grep WEBHOOK_URL');
    console.log('   2. Check n8n logs: docker logs n8n | grep -i webhook | tail -20');
    console.log('   3. Restart container: node scripts/restart-n8n-container-ec2.js');
    console.log('   4. Wait 90 seconds after restart');
    console.log('   5. Toggle workflow in UI again');
    console.log('   6. Wait 60 seconds after toggle');
    console.log('   7. Test webhook again\n');
  } else {
    console.log('   ✅ Webhook is registered! No action needed.\n');
  }
}

main().catch(error => {
  console.error('\n❌ Diagnostic failed:', error.message);
  process.exit(1);
});

