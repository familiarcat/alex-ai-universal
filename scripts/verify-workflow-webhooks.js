#!/usr/bin/env node

/**
 * VERIFY WORKFLOW WEBHOOK REGISTRATION
 * 
 * Checks if workflows are active and webhooks are properly registered
 */

const https = require('https');
const http = require('http');

function loadCredentials() {
  const fs = require('fs');
  const zshrcPath = `${process.env.HOME}/.zshrc`;
  const zshrc = fs.readFileSync(zshrcPath, 'utf8');
  
  const getEnvVar = (name) => {
    const match = zshrc.match(new RegExp(`export ${name}="([^"]+)"`));
    return match ? match[1] : process.env[name];
  };
  
  return {
    n8nUrl: getEnvVar('N8N_URL'),
    n8nApiKey: getEnvVar('N8N_API_KEY')
  };
}

const { n8nUrl, n8nApiKey } = loadCredentials();

const WORKFLOWS = [
  { id: '2eoq8ycgL5M8dG7z', name: 'Project Content Store', webhook: 'project-content-store', method: 'POST' },
  { id: 'NmxfBurDWPEQDqeE', name: 'Project Content Retrieve', webhook: 'project-content-retrieve', method: 'GET' },
  { id: 'bgfljtVeLVCSnfI5', name: 'Project Content Delete', webhook: 'project-content-delete', method: 'POST' }
];

function apiRequest(method, url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'X-N8N-API-KEY': n8nApiKey,
        'Content-Type': 'application/json'
      }
    };
    
    const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function verifyWorkflow(workflow) {
  console.log(`\n📋 ${workflow.name}`);
  console.log(`   ID: ${workflow.id}`);
  
  // Check workflow status
  const workflowResponse = await apiRequest('GET', `${n8nUrl}/api/v1/workflows/${workflow.id}`);
  
  if (workflowResponse.status !== 200) {
    console.log(`   ❌ Failed to fetch workflow: ${workflowResponse.status}`);
    return false;
  }
  
  const wf = workflowResponse.data;
  console.log(`   Active: ${wf.active ? '✅ YES' : '❌ NO'}`);
  console.log(`   Nodes: ${wf.nodes?.length || 0}`);
  
  // Check Supabase node
  const supabaseNode = wf.nodes?.find(n => n.type === 'n8n-nodes-base.supabase');
  if (supabaseNode) {
    console.log(`   Supabase Node: ${supabaseNode.name}`);
    console.log(`   Table: ${supabaseNode.parameters?.table || 'NOT SET'}`);
    console.log(`   Operation: ${supabaseNode.parameters?.operation || 'NOT SET'}`);
    console.log(`   Credential: ${supabaseNode.credentials?.supabaseApi?.id || 'NOT LINKED'}`);
  }
  
  // Test webhook
  console.log(`   Testing webhook: ${workflow.method} /webhook/${workflow.webhook}`);
  
  try {
    const webhookUrl = `${n8nUrl}/webhook/${workflow.webhook}${workflow.method === 'GET' ? '?projectId=temporal' : ''}`;
    const webhookResponse = await apiRequest(workflow.method, webhookUrl, workflow.method === 'POST' ? { projectId: 'temporal' } : null);
    
    if (webhookResponse.status === 404) {
      console.log(`   ⚠️  Webhook: 404 NOT REGISTERED (workflow may need manual save in UI)`);
    } else if (webhookResponse.status === 200 || webhookResponse.status === 201) {
      console.log(`   ✅ Webhook: ${webhookResponse.status} RESPONDING`);
      if (typeof webhookResponse.data === 'object' && webhookResponse.data !== null) {
        console.log(`      Response preview: ${JSON.stringify(webhookResponse.data).substring(0, 100)}`);
      }
    } else {
      console.log(`   ⚠️  Webhook: ${webhookResponse.status} ${webhookResponse.data?.message || webhookResponse.data || ''}`);
    }
  } catch (error) {
    console.log(`   ❌ Webhook error: ${error.message}`);
  }
  
  return wf.active && supabaseNode?.parameters?.table === 'projects';
}

(async () => {
  console.log('🔍 VERIFY WORKFLOW WEBHOOKS');
  console.log('============================');
  console.log('');
  
  let allGood = true;
  
  for (const workflow of WORKFLOWS) {
    const verified = await verifyWorkflow(workflow);
    if (!verified) allGood = false;
  }
  
  console.log('');
  console.log('=========================================');
  console.log('📊 Verification Summary');
  console.log('=========================================');
  
  if (allGood) {
    console.log('✅ All workflows configured correctly!');
    console.log('');
    console.log('⚠️  If webhooks still 404, try:');
    console.log('   1. Open each workflow in n8n UI');
    console.log('   2. Click "Save" button (even if no changes)');
    console.log('   3. This forces webhook re-registration');
  } else {
    console.log('⚠️  Some issues detected - check details above');
  }
})();

