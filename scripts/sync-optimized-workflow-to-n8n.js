#!/usr/bin/env node
/**
 * Sync Optimized Crew Memory Storage Workflow to N8N
 * 
 * Imports the optimized workflow with deduplication and enhanced tagging
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

function loadCrewCredentials() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  const credentials = {};

  const n8nUrlMatch = zshrcContent.match(/export N8N_URL=['"]?([^'"\n]+)['"]?/);
  const n8nApiKeyMatch = zshrcContent.match(/export N8N_OWNER_API_KEY=['"]?([^'"\n]+)['"]?/);

  if (n8nUrlMatch) credentials.n8n = { baseUrl: n8nUrlMatch[1] };
  if (n8nApiKeyMatch) {
    if (!credentials.n8n) credentials.n8n = {};
    credentials.n8n.apiKey = n8nApiKeyMatch[1];
  }

  return credentials;
}

function importWorkflow(baseUrl, apiKey, workflowData) {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/v1/workflows', baseUrl);
    const data = JSON.stringify(workflowData);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 30000
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
            reject(new Error(`N8N returned ${res.statusCode}: ${JSON.stringify(result)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('\n' + '═'.repeat(80));
  console.log('🔄 SYNC OPTIMIZED WORKFLOW TO N8N');
  console.log('═'.repeat(80));
  console.log('\nImporting optimized crew-memory-storage workflow with deduplication...\n');

  let creds;
  try {
    const { loadCrewCredentials: loadCreds } = require('./utils/load-crew-credentials');
    creds = loadCreds();
  } catch (e) {
    creds = loadCrewCredentials();
  }
  
  const N8N_BASE_URL = creds.n8n?.baseUrl || creds.n8n?.baseUrl || 'https://n8n.pbradygeorgen.com';
  const N8N_API_KEY = creds.n8n?.apiKey || creds.n8n?.ownerApiKey || creds.n8n?.serviceApiKey;

  if (!N8N_API_KEY) {
    console.error('❌ N8N API key not found. Please set N8N_OWNER_API_KEY or N8N_API_KEY in your environment.');
    process.exit(1);
  }

  const workflowPath = path.join(__dirname, '..', 'n8n-workflows', 'crew-memory-storage-workflow-optimized.json');
  
  if (!fs.existsSync(workflowPath)) {
    console.error(`❌ Workflow file not found: ${workflowPath}`);
    process.exit(1);
  }

  const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

  try {
    console.log('📤 Importing workflow to N8N...');
    const result = await importWorkflow(N8N_BASE_URL, N8N_API_KEY, workflowData);
    
    console.log('✅ Workflow imported successfully!');
    console.log(`   Workflow ID: ${result.data.id}`);
    console.log(`   Name: ${result.data.name}`);
    console.log(`\n⚠️  IMPORTANT: You need to:`);
    console.log(`   1. Activate the workflow in N8N UI`);
    console.log(`   2. Deactivate the old workflow if it exists`);
    console.log(`   3. Run the migration: supabase db push`);
    console.log(`   4. Test the workflow with a sample memory\n`);
    
  } catch (error) {
    console.error(`❌ Failed to import workflow: ${error.message}`);
    if (error.message.includes('409') || error.message.includes('duplicate')) {
      console.log('\n💡 Workflow may already exist. Try updating it instead or delete the old one first.');
    }
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`\n❌ Unexpected error: ${error.message}`);
  if (error.stack) {
    console.error('   Stack:', error.stack);
  }
  process.exit(1);
});

