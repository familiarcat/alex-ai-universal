#!/usr/bin/env node

/**
 * 🖖 Check MCP and n8n System Status
 * 
 * Comprehensive status check for both systems
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖖 System Status Check: MCP vs n8n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const credentials = loadCrewCredentials();
const apiKey = credentials.n8n?.apiKey || process.env.N8N_API_KEY;

// Test MCP System
async function testMCPSystem() {
  console.log('📡 Testing MCP System (mcp.pbradygeorgen.com)...\n');
  
  const results = {
    healthCheck: false,
    apiStatus: false,
    crewRoster: false,
    overall: false
  };

  // Test 1: Health Check
  try {
    const health = await makeRequest('mcp.pbradygeorgen.com', '/healthz', 'GET');
    results.healthCheck = health.success && health.data?.status === 'ok';
    console.log(`   Health Check: ${results.healthCheck ? '✅ Online' : '❌ Offline'}`);
    if (!results.healthCheck) {
      console.log(`   Error: ${health.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`   Health Check: ❌ Error - ${error.message}`);
  }

  // Test 2: API Status
  try {
    const status = await makeRequest('mcp.pbradygeorgen.com', '/api/status', 'GET', apiKey);
    results.apiStatus = status.success && status.data?.status;
    console.log(`   API Status: ${results.apiStatus ? '✅ Operational' : '❌ Failed'}`);
    if (status.data?.services) {
      console.log(`   Services:`, JSON.stringify(status.data.services, null, 2));
    }
  } catch (error) {
    console.log(`   API Status: ❌ Error - ${error.message}`);
  }

  // Test 3: Crew Roster (if API works)
  if (results.apiStatus) {
    try {
      const crew = await makeRequest('mcp.pbradygeorgen.com', '/api/memory/query', 'POST', apiKey, {
        query: 'crew member',
        options: { limit: 5, category: 'crew-member' }
      });
      results.crewRoster = crew.success;
      console.log(`   Crew Roster: ${results.crewRoster ? '✅ Accessible' : '❌ Not accessible'}`);
    } catch (error) {
      console.log(`   Crew Roster: ⚠️  Error - ${error.message}`);
    }
  }

  results.overall = results.healthCheck && results.apiStatus;
  
  console.log(`\n   MCP System Overall: ${results.overall ? '✅ OPERATIONAL' : '❌ FAILING'}\n`);
  
  return results;
}

// Test n8n System
async function testN8NSystem() {
  console.log('📡 Testing n8n System (n8n.pbradygeorgen.com)...\n');
  
  const results = {
    apiAccess: false,
    workflows: false,
    webhooks: false,
    overall: false
  };

  // Test 1: API Access
  try {
    const workflows = await makeRequest('n8n.pbradygeorgen.com', '/api/v1/workflows', 'GET', apiKey);
    results.apiAccess = workflows.success;
    results.workflows = workflows.data?.data?.length > 0;
    console.log(`   API Access: ${results.apiAccess ? '✅ Working' : '❌ Failed'}`);
    if (workflows.data?.data) {
      console.log(`   Workflows Found: ${workflows.data.data.length}`);
    }
  } catch (error) {
    console.log(`   API Access: ❌ Error - ${error.message}`);
  }

  // Test 2: Webhook Registration
  try {
    const webhook = await makeRequest('n8n.pbradygeorgen.com', '/webhook/knowledge-ingest', 'POST', null, { test: 'data' });
    results.webhooks = webhook.success || webhook.statusCode === 200;
    console.log(`   Webhook (knowledge-ingest): ${results.webhooks ? '✅ Registered' : '❌ Not registered'}`);
    if (!results.webhooks && webhook.error) {
      console.log(`   Error: ${webhook.error}`);
    }
  } catch (error) {
    console.log(`   Webhook: ❌ Error - ${error.message}`);
    results.webhooks = false;
  }

  results.overall = results.apiAccess && results.workflows;
  
  console.log(`\n   n8n System Overall: ${results.overall ? '✅ OPERATIONAL' : '❌ FAILING'}\n`);
  
  return results;
}

// Helper function for HTTPS requests
function makeRequest(hostname, path, method = 'GET', apiKey = null, data = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (apiKey) {
      headers['X-MCP-API-KEY'] = apiKey;
      headers['X-N8N-API-KEY'] = apiKey;
    }

    const options = {
      hostname,
      port: 443,
      path,
      method,
      headers,
      timeout: 10000,
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            data: parsed,
            error: parsed.error || parsed.message || (res.statusCode >= 400 ? `HTTP ${res.statusCode}` : null)
          });
        } catch (e) {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            data: body,
            error: null
          });
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

// Main execution
async function main() {
  const mcpResults = await testMCPSystem();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const n8nResults = await testN8NSystem();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 System Status Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('MCP System:');
  console.log(`   Health Check: ${mcpResults.healthCheck ? '✅' : '❌'}`);
  console.log(`   API Status: ${mcpResults.apiStatus ? '✅' : '❌'}`);
  console.log(`   Crew Roster: ${mcpResults.crewRoster ? '✅' : '⚠️'}`);
  console.log(`   Overall: ${mcpResults.overall ? '✅ OPERATIONAL' : '❌ FAILING'}\n`);
  
  console.log('n8n System:');
  console.log(`   API Access: ${n8nResults.apiAccess ? '✅' : '❌'}`);
  console.log(`   Workflows: ${n8nResults.workflows ? '✅' : '❌'}`);
  console.log(`   Webhooks: ${n8nResults.webhooks ? '✅' : '❌'}`);
  console.log(`   Overall: ${n8nResults.overall ? '✅ OPERATIONAL' : '❌ FAILING'}\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 Recommendation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (mcpResults.overall && !n8nResults.overall) {
    console.log('✅ MCP System is OPERATIONAL');
    console.log('❌ n8n System is FAILING');
    console.log('\n💡 Recommendation: Use MCP as primary system. n8n can be decommissioned.\n');
  } else if (mcpResults.overall && n8nResults.overall) {
    console.log('✅ Both systems are OPERATIONAL');
    console.log('\n💡 Recommendation: Continue using MCP as primary. n8n can serve as backup.\n');
  } else if (!mcpResults.overall && n8nResults.overall) {
    console.log('❌ MCP System is FAILING');
    console.log('✅ n8n System is OPERATIONAL');
    console.log('\n⚠️  Recommendation: Investigate MCP issues. n8n can serve as temporary fallback.\n');
  } else {
    console.log('❌ Both systems are FAILING');
    console.log('\n⚠️  Recommendation: Investigate both systems immediately.\n');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

