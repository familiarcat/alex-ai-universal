#!/usr/bin/env node
/**
 * Sync N8N workflows using session-based authentication
 * Falls back to API key if session auth fails
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const credentials = loadCrewCredentials();
const N8N_URL = credentials.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_EMAIL = credentials.n8n.email;
const N8N_PASSWORD = credentials.n8n.password;

// Read API key directly from ~/.zshrc (more reliable)
let N8N_API_KEY = credentials.n8n.apiKey;
if (!N8N_API_KEY || N8N_API_KEY.length < 100) {
  try {
    const zshrc = fs.readFileSync(path.join(os.homedir(), '.zshrc'), 'utf8');
    const match = zshrc.match(/export N8N_API_KEY="([^"]+)"/);
    if (match) {
      N8N_API_KEY = match[1];
    }
  } catch (e) {
    // Fallback to credential loader value
  }
}

console.log('\n🔄 N8N Workflow Sync (Session Auth)\n');
console.log(`📍 N8N URL: ${N8N_URL}`);

// Try session-based authentication first
async function getSessionClient() {
  if (!N8N_EMAIL || !N8N_PASSWORD) {
    console.log('⚠️  No email/password found, trying API key only...\n');
    return null;
  }

  try {
    console.log('🔐 Attempting session-based authentication...');
    console.log(`   Email: ${N8N_EMAIL ? N8N_EMAIL.substring(0, 10) + '...' : 'NOT SET'}`);
    const response = await axios.post(
      `${N8N_URL}/rest/login`,
      {
        emailOrLdapLoginId: N8N_EMAIL,
        password: N8N_PASSWORD,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
        withCredentials: true,
      }
    );

    const setCookie = response.headers['set-cookie'];
    const authCookie = Array.isArray(setCookie)
      ? setCookie.find((cookie) => cookie.startsWith('n8n-auth='))
      : setCookie;

    if (!authCookie) {
      console.log('⚠️  No session cookie returned, falling back to API key...\n');
      return null;
    }

    const sessionCookie = authCookie.split(';')[0];
    const client = axios.create({
      baseURL: N8N_URL,
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
        ...(N8N_API_KEY ? { 'X-N8N-API-KEY': N8N_API_KEY } : {}),
      },
      timeout: 30000,
      withCredentials: true,
    });

    // Test the session (API endpoints require API key header even with session)
    const testResponse = await client.get('/api/v1/workflows');
    console.log('✅ Session authentication successful!');
    console.log(`   Found ${testResponse.data?.data?.length || 0} existing workflows\n`);
    return client;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    console.log(`⚠️  Session auth failed: ${status || 'unknown'} - ${message}`);
    if (error.response?.data) {
      console.log(`   Response: ${JSON.stringify(error.response.data).substring(0, 100)}`);
    }
    console.log('   Falling back to API key...\n');
    return null;
  }
}

// Try API key authentication
async function getApiKeyClient() {
  // Ensure we have the API key from file
  let apiKey = N8N_API_KEY;
  if (!apiKey || apiKey.length < 100) {
    try {
      const zshrc = fs.readFileSync(path.join(os.homedir(), '.zshrc'), 'utf8');
      const match = zshrc.match(/export N8N_API_KEY="([^"]+)"/);
      if (match) {
        apiKey = match[1];
      }
    } catch (e) {
      // Ignore
    }
  }

  if (!apiKey) {
    return null;
  }

  try {
    console.log(`🔑 Testing API key (length: ${apiKey.length})...`);
    const client = axios.create({
      baseURL: N8N_URL,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey,
      },
      timeout: 30000,
    });

    const testResponse = await client.get('/api/v1/workflows');
    console.log('✅ API Key authentication successful!');
    console.log(`   Found ${testResponse.data?.data?.length || 0} existing workflows\n`);
    return client;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    console.log(`❌ API Key auth failed: ${status || 'unknown'} - ${message}\n`);
    return null;
  }
}

// Get workflow files
function getWorkflowFiles() {
  const workflowsDir = path.join(process.cwd(), 'n8n-workflows');
  const workflowFiles = [];
  
  function findJsonFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() && !file.includes('node_modules')) {
        findJsonFiles(filePath);
      } else if (file.endsWith('.json')) {
        workflowFiles.push(filePath);
      }
    });
  }
  
  findJsonFiles(workflowsDir);
  return workflowFiles.map(f => path.relative(process.cwd(), f));
}

// Main sync function
async function syncWorkflows() {
  // Try session auth first, then API key
  let client = await getSessionClient();
  if (!client) {
    client = await getApiKeyClient();
  }

  if (!client) {
    console.log('❌ No authentication method succeeded');
    console.log('\n📋 Options:');
    console.log('   1. Set N8N_EMAIL and N8N_PASSWORD in ~/.zshrc for session auth');
    console.log('   2. Verify N8N_OWNER_API_KEY is correct and enabled in N8N settings');
    console.log('   3. Import workflows manually via N8N UI\n');
    return;
  }

  console.log('🔄 Starting workflow sync...\n');
  
  const workflowFiles = getWorkflowFiles();
  console.log(`📦 Found ${workflowFiles.length} workflow files\n`);

  // Get existing workflows
  let existingWorkflows = [];
  try {
    const response = await client.get('/api/v1/workflows');
    existingWorkflows = response.data?.data || response.data || [];
  } catch (error) {
    console.error('❌ Failed to fetch existing workflows:', error.message);
    return;
  }

  const workflowByName = new Map(
    existingWorkflows
      .filter(w => w?.name)
      .map(w => [w.name, w])
  );

  let synced = 0;
  let created = 0;
  let failed = 0;

  for (const filePath of workflowFiles) {
    try {
      const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const workflowName = workflow.name || path.basename(filePath, '.json');
      
      const existing = workflowByName.get(workflowName);
      const workflowId = existing?.id || workflow.id;

      const payload = {
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections,
        settings: workflow.settings || {},
        staticData: workflow.staticData || null
      };

      if (workflowId && existing) {
        // Update existing
        await client.put(`/api/v1/workflows/${workflowId}`, payload);
        console.log(`✅ Updated: ${workflowName} (${workflowId})`);
        synced++;
      } else {
        // Create new
        const response = await client.post('/api/v1/workflows', payload);
        console.log(`✅ Created: ${workflowName} (${response.data.id})`);
        created++;
      }
    } catch (error) {
      const fileName = path.basename(filePath);
      const errorMsg = error.response?.data?.message || error.message;
      console.error(`❌ Failed: ${fileName} - ${errorMsg}`);
      failed++;
    }
  }

  console.log(`\n✨ Sync complete: ${synced} updated, ${created} created, ${failed} failed\n`);
}

syncWorkflows().catch(error => {
  console.error('❌ Sync failed:', error.message);
  process.exit(1);
});

