#!/usr/bin/env node

/**
 * 🖖 Crew N8N Controller Layer Audit
 * 
 * Comprehensive audit of all n8n services in the DDD controller layer.
 * Verifies operational status, webhook registration, and service health.
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖖 CREW N8N CONTROLLER LAYER AUDIT');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const AUDIT = {
  timestamp: new Date().toISOString(),
  n8nStatus: {},
  workflows: [],
  webhooks: [],
  services: {},
  recommendations: []
};

// Critical n8n workflows in controller layer
const CRITICAL_WORKFLOWS = [
  { name: 'Knowledge Ingest', webhook: 'knowledge-ingest', priority: 'HIGH' },
  { name: 'Knowledge Query', webhook: 'knowledge-query', priority: 'HIGH' },
  { name: 'Knowledge Embed', webhook: 'knowledge-embed', priority: 'MEDIUM' },
  { name: 'Knowledge Archive', webhook: 'knowledge-archive', priority: 'MEDIUM' },
  { name: 'Project Content Store', webhook: 'project-content-store', priority: 'HIGH' },
  { name: 'Project Content Retrieve', webhook: 'project-content-retrieve', priority: 'HIGH' },
  { name: 'Project Content Delete', webhook: 'project-content-delete', priority: 'MEDIUM' },
  { name: 'Crew Coordination', webhook: 'llm-collaboration', priority: 'MEDIUM' },
  { name: 'Crew Memory Storage', webhook: 'crew-memory-store', priority: 'MEDIUM' }
];

/**
 * Check n8n API connectivity
 */
async function checkN8NConnectivity() {
  console.log('🔍 Checking N8N API Connectivity...\n');

  const { n8n } = loadCrewCredentials();
  const baseUrl = n8n.baseUrl;
  const apiKey = n8n.apiKey;

  if (!apiKey) {
    console.log('❌ N8N API key not found\n');
    return { connected: false, error: 'No API key' };
  }

  return new Promise((resolve) => {
    const url = new URL('/api/v1/workflows', baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const workflows = JSON.parse(body);
            console.log(`✅ N8N API Connected`);
            console.log(`   Found ${workflows.data ? workflows.data.length : workflows.length} workflows\n`);
            resolve({ connected: true, workflows: workflows.data || workflows });
          } catch (e) {
            console.log(`⚠️  N8N API Connected but response parse failed: ${e.message}\n`);
            resolve({ connected: true, workflows: [] });
          }
        } else {
          console.log(`❌ N8N API Connection Failed: HTTP ${res.statusCode}\n`);
          resolve({ connected: false, error: `HTTP ${res.statusCode}` });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ N8N API Connection Error: ${error.message}\n`);
      resolve({ connected: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`❌ N8N API Connection Timeout\n`);
      resolve({ connected: false, error: 'Timeout' });
    });

    req.end();
  });
}

/**
 * Check webhook registration
 */
async function checkWebhook(webhookPath, workflowName) {
  const { n8n } = loadCrewCredentials();
  const baseUrl = n8n.baseUrl;
  const webhookUrl = `${baseUrl}/webhook/${webhookPath}`;

  return new Promise((resolve) => {
    const url = new URL(`/webhook/${webhookPath}`, baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        // 404 means webhook not registered
        if (res.statusCode === 404) {
          resolve({
            registered: false,
            status: res.statusCode,
            message: 'Webhook not registered'
          });
        } else {
          // Any other response means webhook exists (even if it errors)
          resolve({
            registered: true,
            status: res.statusCode,
            message: res.statusCode === 200 ? 'Webhook active' : `Webhook exists (${res.statusCode})`
          });
        }
      });
    });

    req.on('error', () => {
      resolve({
        registered: false,
        status: 'ERROR',
        message: 'Connection error'
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        registered: false,
        status: 'TIMEOUT',
        message: 'Request timeout'
      });
    });

    // Send minimal test payload
    req.write(JSON.stringify({ test: true }));
    req.end();
  });
}

/**
 * Audit all critical workflows
 */
async function auditWorkflows() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 AUDITING CRITICAL WORKFLOWS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const results = {
    operational: [],
    nonOperational: [],
    webhookIssues: []
  };

  for (const workflow of CRITICAL_WORKFLOWS) {
    console.log(`🔍 Checking: ${workflow.name} (${workflow.webhook})`);
    
    const webhookCheck = await checkWebhook(workflow.webhook, workflow.name);
    
    if (webhookCheck.registered) {
      console.log(`   ✅ Webhook: REGISTERED (${webhookCheck.status})`);
      results.operational.push({
        ...workflow,
        webhookStatus: webhookCheck
      });
    } else {
      console.log(`   ❌ Webhook: NOT REGISTERED (${webhookCheck.message})`);
      results.nonOperational.push({
        ...workflow,
        webhookStatus: webhookCheck
      });
      results.webhookIssues.push(workflow.name);
    }
    console.log('');
  }

  return results;
}

/**
 * Check n8n service health
 */
async function checkServiceHealth() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏥 CHECKING N8N SERVICE HEALTH');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const { n8n } = loadCrewCredentials();
  const baseUrl = n8n.baseUrl;

  // Check health endpoint
  return new Promise((resolve) => {
    const url = new URL('/healthz', baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ N8N Service: HEALTHY\n');
          resolve({ healthy: true, status: res.statusCode });
        } else {
          console.log(`⚠️  N8N Service: RESPONDING (${res.statusCode})\n`);
          resolve({ healthy: true, status: res.statusCode }); // Still responding
        }
      });
    });

    req.on('error', () => {
      console.log('❌ N8N Service: UNREACHABLE\n');
      resolve({ healthy: false, error: 'Unreachable' });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('❌ N8N Service: TIMEOUT\n');
      resolve({ healthy: false, error: 'Timeout' });
    });

    req.end();
  });
}

// Main execution
async function main() {
  // Step 1: Check connectivity
  const connectivity = await checkN8NConnectivity();
  AUDIT.n8nStatus.connectivity = connectivity;

  if (!connectivity.connected) {
    console.log('❌ Cannot proceed with audit - N8N API not accessible\n');
    console.log('💡 Recommendation: Use MCP system instead (already operational)\n');
    process.exit(1);
  }

  // Step 2: Check service health
  const health = await checkServiceHealth();
  AUDIT.n8nStatus.health = health;

  // Step 3: Audit workflows
  const workflowResults = await auditWorkflows();
  AUDIT.workflows = workflowResults;

  // Step 4: Generate summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 AUDIT SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('N8N Service Status:');
  console.log(`   Connectivity: ${connectivity.connected ? '✅ Connected' : '❌ Failed'}`);
  console.log(`   Health: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}\n`);

  console.log('Workflow Status:');
  console.log(`   Operational: ${workflowResults.operational.length}/${CRITICAL_WORKFLOWS.length}`);
  console.log(`   Non-Operational: ${workflowResults.nonOperational.length}/${CRITICAL_WORKFLOWS.length}\n`);

  if (workflowResults.operational.length > 0) {
    console.log('✅ Operational Workflows:');
    workflowResults.operational.forEach(w => {
      console.log(`   • ${w.name} (${w.webhook})`);
    });
    console.log('');
  }

  if (workflowResults.nonOperational.length > 0) {
    console.log('❌ Non-Operational Workflows:');
    workflowResults.nonOperational.forEach(w => {
      console.log(`   • ${w.name} (${w.webhook}) - ${w.webhookStatus.message}`);
    });
    console.log('');
  }

  // Recommendations
  console.log('💡 Recommendations:\n');

  if (workflowResults.nonOperational.length === CRITICAL_WORKFLOWS.length) {
    console.log('   🔴 ALL WORKFLOWS NON-OPERATIONAL');
    console.log('   • n8n webhook registration completely broken');
    console.log('   • Recommend: Use MCP system (already operational)');
    console.log('   • n8n can be decommissioned\n');
  } else if (workflowResults.nonOperational.length > 0) {
    console.log('   🟡 PARTIAL OPERATIONAL STATUS');
    console.log('   • Some workflows operational, some not');
    console.log('   • Recommend: Migrate non-operational workflows to MCP');
    console.log('   • Keep operational workflows in n8n for now\n');
  } else {
    console.log('   🟢 ALL WORKFLOWS OPERATIONAL');
    console.log('   • All n8n workflows functioning');
    console.log('   • Can continue using n8n or migrate to MCP\n');
  }

  // Save audit
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(process.cwd(), '.backup-ec2-emergency', `n8n-controller-audit-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(AUDIT, null, 2));
  console.log(`💾 Audit report saved to: ${reportPath}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(error => {
  console.error('❌ Audit failed:', error);
  process.exit(1);
});

