#!/usr/bin/env node

/**
 * Force activate Knowledge Ingest workflow by toggling it
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

function loadCredentials() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  
  const n8nUrlMatch = zshrcContent.match(/export\s+N8N_URL=['"]([^'"]+)['"]/);
  const n8nOwnerKeyMatch = zshrcContent.match(/export\s+N8N_OWNER_API_KEY=['"]([^'"]+)['"]/);
  
  return {
    n8nUrl: n8nUrlMatch ? n8nUrlMatch[1] : 'https://n8n.pbradygeorgen.com',
    n8nApiKey: n8nOwnerKeyMatch ? n8nOwnerKeyMatch[1] : null
  };
}

function getWorkflow(workflowId, credentials) {
  return new Promise((resolve, reject) => {
    const url = new URL(`/api/v1/workflows/${workflowId}`, credentials.n8nUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      headers: { 'X-N8N-API-KEY': credentials.n8nApiKey },
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

function updateWorkflow(workflowId, workflowData, credentials) {
  return new Promise((resolve, reject) => {
    const url = new URL(`/api/v1/workflows/${workflowId}`, credentials.n8nUrl);
    const data = JSON.stringify(workflowData);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'X-N8N-API-KEY': credentials.n8nApiKey
      },
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🔄 Force Activating Knowledge Ingest Workflow\n');
  
  const credentials = loadCredentials();
  const workflowId = 'hsUWduQuyUC3iWGp'; // From workflow list
  
  try {
    // Get current workflow
    console.log('📥 Getting workflow...');
    const workflow = await getWorkflow(workflowId, credentials);
    const workflowData = workflow.data || workflow;
    console.log(`   Name: ${workflowData.name}`);
    console.log(`   Current Active: ${workflowData.active}\n`);
    
    // Deactivate first
    if (workflowData.active) {
      console.log('🔄 Deactivating workflow...');
      await updateWorkflow(workflowId, { ...workflowData, active: false }, credentials);
      console.log('   ✅ Deactivated\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Activate
    console.log('🔄 Activating workflow...');
    await updateWorkflow(workflowId, { ...workflowData, active: true }, credentials);
    console.log('   ✅ Activated\n');
    
    // Wait for webhook registration
    console.log('⏳ Waiting 5 seconds for webhook registration...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verify
    console.log('🔍 Verifying webhook...');
    const testUrl = new URL('/webhook/knowledge-ingest', credentials.n8nUrl);
    const testReq = https.request({
      hostname: testUrl.hostname,
      port: 443,
      path: testUrl.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 404) {
          console.log(`   ✅ Webhook is registered! (HTTP ${res.statusCode})\n`);
          console.log('🎉 Knowledge Ingest workflow is now active and ready!\n');
        } else {
          console.log(`   ⚠️  Webhook still not registered (HTTP ${res.statusCode})`);
          console.log('   💡 May need manual activation in n8n UI\n');
        }
      });
    });
    
    testReq.on('error', () => console.log('   ❌ Connection error\n'));
    testReq.write(JSON.stringify({ test: true }));
    testReq.end();
    
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

main();

