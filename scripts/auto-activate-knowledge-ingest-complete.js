#!/usr/bin/env node

/**
 * 🎯 Auto-Activate Knowledge Ingest Webhook (Complete Solution)
 * 
 * Comprehensive automation that:
 * 1. Tries API activation (fast)
 * 2. Falls back to UI automation if API doesn't register webhook
 * 3. Verifies webhook registration
 * 4. Provides detailed diagnostics
 * 
 * This ensures the Knowledge Ingest webhook is always operational.
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;

if (!N8N_API_KEY) {
  console.error('❌ N8N API key not found. Set N8N_OWNER_API_KEY or N8N_API_KEY in ~/.zshrc');
  process.exit(1);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 AUTO-ACTIVATE KNOWLEDGE INGEST WEBHOOK (COMPLETE)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Make API request
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

// Test webhook
async function testWebhook(webhookPath) {
  return new Promise((resolve) => {
    const url = new URL(`/webhook/${webhookPath}`, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          registered: res.statusCode !== 404,
          body: body
        });
      });
    });

    req.on('error', () => resolve({ status: 0, registered: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, registered: false, error: 'timeout' });
    });

    req.write(JSON.stringify({ test: true, timestamp: Date.now() }));
    req.end();
  });
}

// Extract webhook path
function extractWebhookPath(workflowData) {
  if (!workflowData || !workflowData.nodes) return null;
  for (const node of workflowData.nodes) {
    if (node.type === 'n8n-nodes-base.webhook' || node.type === '@n8n/n8n-nodes-langchain.webhook') {
      const path = node.parameters?.path || node.parameters?.options?.path;
      if (path) return path.replace(/^\//, '');
    }
  }
  return null;
}

// UI Automation fallback (requires Puppeteer)
async function activateViaUI(workflowId, workflowName) {
  try {
    const puppeteer = require('puppeteer');
    const N8N_EMAIL = process.env.N8N_EMAIL || process.env.N8N_USER_EMAIL;
    const N8N_PASSWORD = process.env.N8N_PASSWORD || process.env.N8N_USER_PASSWORD;
    
    if (!N8N_EMAIL || !N8N_PASSWORD) {
      console.log('   ⚠️  UI automation requires N8N_EMAIL and N8N_PASSWORD');
      return false;
    }
    
    console.log('   🖥️  Attempting UI automation...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Login
    await page.goto(N8N_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const needsLogin = await page.evaluate(() => {
      return document.querySelector('input[type="email"]') !== null;
    });
    
    if (needsLogin) {
      await page.type('input[type="email"]', N8N_EMAIL, { delay: 50 });
      await page.type('input[type="password"]', N8N_PASSWORD, { delay: 50 });
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 })
      ]);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Navigate to workflow
    await page.goto(`${N8N_URL}/workflow/${workflowId}`, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Find and toggle activation switch
    const toggleFound = await page.evaluate(() => {
      const selectors = [
        'button[data-test-id="workflow-activate-switch"]',
        'button[aria-label*="Activate"]',
        'button[aria-label*="Deactivate"]',
        '.workflow-activator button',
        'button.workflow-activate-toggle'
      ];
      
      for (const selector of selectors) {
        const button = document.querySelector(selector);
        if (button) {
          // Toggle OFF then ON
          button.click();
          return true;
        }
      }
      return false;
    });
    
    if (!toggleFound) {
      throw new Error('Could not find toggle button');
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Toggle ON
    await page.evaluate(() => {
      const selectors = [
        'button[data-test-id="workflow-activate-switch"]',
        'button[aria-label*="Activate"]',
        '.workflow-activator button',
        'button.workflow-activate-toggle'
      ];
      
      for (const selector of selectors) {
        const button = document.querySelector(selector);
        if (button) {
          button.click();
          return true;
        }
      }
      return false;
    });
    
    await browser.close();
    console.log('   ✅ UI toggle complete');
    return true;
  } catch (error) {
    console.log(`   ❌ UI automation failed: ${error.message}`);
    return false;
  }
}

async function main() {
  // Step 1: Find workflow
  console.log('🔍 Step 1: Finding Knowledge Ingest workflow...');
  const workflowsResponse = await makeApiRequest('GET', '/api/v1/workflows');
  
  if (workflowsResponse.status !== 200) {
    console.log(`❌ Failed to fetch workflows`);
    process.exit(1);
  }
  
  let workflows = [];
  const data = workflowsResponse.data;
  if (Array.isArray(data)) {
    workflows = data;
  } else if (data.data && Array.isArray(data.data)) {
    workflows = data.data;
  } else if (data.results && Array.isArray(data.results)) {
    workflows = data.results;
  }
  
  const workflow = workflows.find(w => {
    const name = (w.name || '').toLowerCase();
    return name.includes('knowledge ingest') || 
           name.includes('knowledge-ingest') ||
           name.includes('rag ingestion');
  });
  
  if (!workflow) {
    console.log('❌ Knowledge Ingest workflow not found!');
    process.exit(1);
  }
  
  console.log(`   ✅ Found: ${workflow.name} (${workflow.id})\n`);
  
  // Step 2: Get webhook path
  console.log('🔍 Step 2: Extracting webhook path...');
  const detailResponse = await makeApiRequest('GET', `/api/v1/workflows/${workflow.id}`);
  const workflowData = detailResponse.data.data || detailResponse.data;
  const webhookPath = extractWebhookPath(workflowData) || 'ingest-knowledge';
  console.log(`   ✅ Webhook path: ${webhookPath}\n`);
  
  // Step 3: Test webhook before
  console.log('🧪 Step 3: Testing webhook before activation...');
  const beforeTest = await testWebhook(webhookPath);
  console.log(`   Status: ${beforeTest.status} (${beforeTest.registered ? '✅ Registered' : '❌ Not Registered'})\n`);
  
  if (beforeTest.registered) {
    console.log('✅ Webhook is already registered! No action needed.\n');
    process.exit(0);
  }
  
  // Step 4: Try API activation
  console.log('🔄 Step 4: Activating via API...');
  try {
    if (workflow.active) {
      await makeApiRequest('POST', `/api/v1/workflows/${workflow.id}/deactivate`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    await makeApiRequest('POST', `/api/v1/workflows/${workflow.id}/activate`);
    console.log('   ✅ API activation sent\n');
  } catch (error) {
    console.log(`   ❌ API activation failed: ${error.message}\n`);
  }
  
  // Step 5: Wait and test
  console.log('⏳ Step 5: Waiting 15 seconds for webhook registration...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  const apiTest = await testWebhook(webhookPath);
  if (apiTest.registered) {
    console.log(`   ✅ Webhook registered via API! (Status: ${apiTest.status})\n`);
    console.log('🎉 SUCCESS: Knowledge Ingest webhook is operational!\n');
    process.exit(0);
  }
  
  console.log(`   ❌ Webhook not registered via API (Status: ${apiTest.status})\n`);
  
  // Step 6: Fallback to UI automation
  console.log('🔄 Step 6: Trying UI automation fallback...');
  const uiSuccess = await activateViaUI(workflow.id, workflow.name);
  
  if (uiSuccess) {
    console.log('   ⏳ Waiting 30 seconds for webhook registration...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const uiTest = await testWebhook(webhookPath);
    if (uiTest.registered) {
      console.log(`   ✅ Webhook registered via UI! (Status: ${uiTest.status})\n`);
      console.log('🎉 SUCCESS: Knowledge Ingest webhook is operational!\n');
      process.exit(0);
    }
  }
  
  // Final status
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 FINAL STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const finalTest = await testWebhook(webhookPath);
  if (finalTest.registered) {
    console.log('✅ SUCCESS: Webhook is registered!\n');
    process.exit(0);
  }
  
  console.log('⚠️  Webhook still not registered after all attempts');
  console.log(`   Status: ${finalTest.status}\n`);
  console.log('💡 Manual intervention required:');
  console.log('   1. Visit: https://n8n.pbradygeorgen.com');
  console.log(`   2. Open workflow: "${workflow.name}"`);
  console.log('   3. Toggle activation switch (top-right)');
  console.log('   4. Wait 30 seconds\n');
  
  process.exit(1);
}

main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  process.exit(1);
});

