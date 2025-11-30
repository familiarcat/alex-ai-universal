#!/usr/bin/env node

/**
 * 🖖 Verify Workflow Migration
 * 
 * Verifies that all n8n workflows have been migrated to MCP
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖖 Workflow Migration Verification');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function fetchN8NWorkflows() {
  const { n8n } = loadCrewCredentials();
  const baseUrl = n8n.baseUrl;
  const apiKey = n8n.apiKey;

  return new Promise((resolve, reject) => {
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
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body);
            resolve(data.data || data);
          } catch (e) {
            reject(new Error(`Parse error: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
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

function getMigratedWorkflows() {
  const migratedDir = path.join(process.cwd(), 'workflows', 'migrated');
  
  if (!fs.existsSync(migratedDir)) {
    return [];
  }

  const files = fs.readdirSync(migratedDir).filter(f => f.endsWith('.json'));
  return files.map(file => {
    const content = JSON.parse(fs.readFileSync(path.join(migratedDir, file), 'utf8'));
    return {
      name: content.name,
      file: file,
      originalId: content.metadata?.originalId,
      originalName: content.metadata?.originalName
    };
  });
}

async function main() {
  console.log('📋 Step 1: Fetching n8n workflows...\n');

  let n8nWorkflows = [];
  try {
    n8nWorkflows = await fetchN8NWorkflows();
    console.log(`✅ Found ${n8nWorkflows.length} n8n workflows\n`);
  } catch (error) {
    console.error(`❌ Failed to fetch n8n workflows: ${error.message}\n`);
    process.exit(1);
  }

  console.log('📋 Step 2: Checking migrated workflows...\n');

  const migratedWorkflows = getMigratedWorkflows();
  console.log(`✅ Found ${migratedWorkflows.length} migrated workflows\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Verification Results');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Create mapping
  const n8nMap = new Map();
  n8nWorkflows.forEach(w => {
    n8nMap.set(w.id, w);
    n8nMap.set(w.name, w);
  });

  const migratedMap = new Map();
  migratedWorkflows.forEach(w => {
    if (w.originalId) migratedMap.set(w.originalId, w);
    if (w.originalName) migratedMap.set(w.originalName, w);
  });

  // Check each n8n workflow
  const missing = [];
  const migrated = [];

  n8nWorkflows.forEach(n8nWorkflow => {
    const found = migratedMap.has(n8nWorkflow.id) || migratedMap.has(n8nWorkflow.name);
    
    if (found) {
      migrated.push({
        n8nId: n8nWorkflow.id,
        n8nName: n8nWorkflow.name
      });
    } else {
      missing.push({
        n8nId: n8nWorkflow.id,
        n8nName: n8nWorkflow.name
      });
    }
  });

  console.log(`Total N8N Workflows: ${n8nWorkflows.length}`);
  console.log(`✅ Migrated: ${migrated.length}`);
  console.log(`❌ Missing: ${missing.length}`);
  console.log(`📈 Coverage: ${((migrated.length / n8nWorkflows.length) * 100).toFixed(1)}%\n`);

  if (missing.length > 0) {
    console.log('⚠️  Missing Workflows (Not Migrated):');
    missing.forEach(w => {
      console.log(`   • ${w.n8nName} (ID: ${w.n8nId})`);
    });
    console.log('');
    console.log('💡 Run migration script to migrate missing workflows:');
    console.log('   node scripts/migrate-n8n-workflows-to-mcp.js\n');
  } else {
    console.log('✅ All workflows have been migrated!\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});

