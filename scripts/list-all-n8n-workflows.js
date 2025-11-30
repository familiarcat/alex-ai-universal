#!/usr/bin/env node

/**
 * List all n8n workflows to find correct IDs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

function loadCredentials() {
  try {
    const zshrcPath = path.join(process.env.HOME, '.zshrc');
    const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
    
    const n8nUrlMatch = zshrcContent.match(/export\s+N8N_URL=['"]([^'"]+)['"]/);
    const n8nApiKeyMatch = zshrcContent.match(/export\s+N8N_API_KEY=['"]([^'"]+)['"]/);
    const n8nOwnerKeyMatch = zshrcContent.match(/export\s+N8N_OWNER_API_KEY=['"]([^'"]+)['"]/);
    
    const n8nUrl = n8nUrlMatch ? n8nUrlMatch[1] : 'https://n8n.pbradygeorgen.com';
    const n8nApiKey = n8nOwnerKeyMatch ? n8nOwnerKeyMatch[1] : (n8nApiKeyMatch ? n8nApiKeyMatch[1] : null);
    
    if (!n8nApiKey) {
      console.error('❌ N8N_API_KEY or N8N_OWNER_API_KEY not found');
      process.exit(1);
    }
    
    return { n8nUrl, n8nApiKey };
  } catch (error) {
    console.error('❌ Failed to load credentials:', error.message);
    process.exit(1);
  }
}

function listWorkflows(credentials) {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/v1/workflows', credentials.n8nUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': credentials.n8nApiKey
      },
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve({ data: body });
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

async function main() {
  console.log('📋 Listing All N8N Workflows\n');
  
  const credentials = loadCredentials();
  console.log(`N8N URL: ${credentials.n8nUrl}\n`);
  
  try {
    const result = await listWorkflows(credentials);
    const workflows = result.data || result;
    
    console.log(`Found ${Array.isArray(workflows) ? workflows.length : '?'} workflows\n`);
    
    if (Array.isArray(workflows)) {
      // Filter for inactive workflows with webhooks
      const inactiveWithWebhooks = workflows.filter(w => !w.active && w.nodes?.some(n => n.type === 'n8n-nodes-base.webhook'));
      
      console.log('🔍 Inactive Workflows with Webhooks:');
      console.log('─'.repeat(70) + '\n');
      
      inactiveWithWebhooks.forEach(w => {
        const webhookNodes = w.nodes.filter(n => n.type === 'n8n-nodes-base.webhook');
        console.log(`Name: ${w.name}`);
        console.log(`ID: ${w.id}`);
        console.log(`Active: ${w.active}`);
        webhookNodes.forEach(n => {
          const path = n.parameters?.path || n.parameters?.options?.path || 'unknown';
          console.log(`  Webhook: ${path} (${n.parameters?.httpMethod || 'POST'})`);
        });
        console.log('');
      });
      
      // Save to file
      const outputPath = path.join(__dirname, '..', '.backup-ec2-emergency', 'all-n8n-workflows.json');
      fs.writeFileSync(outputPath, JSON.stringify(workflows, null, 2));
      console.log(`📄 Full workflow list saved to: ${outputPath}\n`);
    } else {
      console.log('Response:', JSON.stringify(workflows, null, 2));
    }
  } catch (error) {
    console.error('❌ Failed to list workflows:', error.message);
  }
}

main();

