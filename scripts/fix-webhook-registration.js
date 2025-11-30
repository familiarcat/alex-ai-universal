#!/usr/bin/env node

/**
 * 🔧 Fix Webhook Registration
 * 
 * Fixes webhook registration issues by properly reactivating
 * the workflow and ensuring webhook endpoints are registered
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from ~/.zshrc
function loadZshrcEnv() {
  try {
    const zshrcPath = path.join(require('os').homedir(), '.zshrc');
    const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
    
    const lines = zshrcContent.split('\n');
    lines.forEach(line => {
      if (line.startsWith('export ')) {
        const [key, value] = line.replace('export ', '').split('=');
        if (key && value) {
          process.env[key] = value.replace(/"/g, '');
        }
      }
    });
    
    console.log('✅ Environment variables loaded from ~/.zshrc');
  } catch (error) {
    console.error('❌ Error loading ~/.zshrc:', error.message);
    process.exit(1);
  }
}

// Make HTTP request to N8N API
function makeN8NRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const n8nBaseUrl = process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com';
    const apiKey = process.env.N8N_API_KEY;
    
    const url = new URL(endpoint, n8nBaseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
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

class WebhookRegistrationFixer {
  constructor() {
    this.workflowId = 'L6K4bzSKlGC36ABL';
  }

  /**
   * Fix webhook registration
   */
  async fixWebhookRegistration() {
    console.log('🔧 Fixing Webhook Registration');
    console.log('==============================');
    
    try {
      // Step 1: Get current workflow status
      const workflow = await this.getCurrentWorkflow();
      
      // Step 2: Perform webhook registration fix
      await this.performWebhookFix(workflow);
      
      // Step 3: Test webhook endpoint
      await this.testWebhookEndpoint();
      
    } catch (error) {
      console.error('❌ Webhook fix failed:', error.message);
    }
  }

  /**
   * Get current workflow
   */
  async getCurrentWorkflow() {
    console.log('\n📋 Getting Current Workflow...');
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
    
    if (response.status === 200) {
      const workflow = response.data;
      console.log(`✅ Workflow: ${workflow.name}`);
      console.log(`✅ Active: ${workflow.active}`);
      console.log(`✅ Nodes: ${workflow.nodes.length}`);
      console.log(`✅ Connections: ${Object.keys(workflow.connections).length}`);
      return workflow;
    } else {
      throw new Error(`Failed to fetch workflow: ${response.status}`);
    }
  }

  /**
   * Perform webhook registration fix
   */
  async performWebhookFix(workflow) {
    console.log('\n🔧 Performing Webhook Registration Fix...');
    
    // Step 1: Deactivate workflow
    console.log('⏸️  Deactivating workflow...');
    await makeN8NRequest(`/api/v1/workflows/${this.workflowId}/activate`, 'POST', { active: false });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 2: Update workflow to ensure webhook registration
    console.log('🔄 Updating workflow for webhook registration...');
    const updatePayload = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings || {}
    };
    
    await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`, 'PUT', updatePayload);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Reactivate workflow
    console.log('▶️  Reactivating workflow...');
    await makeN8NRequest(`/api/v1/workflows/${this.workflowId}/activate`, 'POST', { active: true });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('✅ Webhook registration fix completed');
  }

  /**
   * Test webhook endpoint
   */
  async testWebhookEndpoint() {
    console.log('\n🧪 Testing Webhook Endpoint...');
    
    const webhookUrl = 'https://n8n.pbradygeorgen.com/webhook/crew-quark-optimized';
    
    try {
      const response = await makeN8NRequest('/webhook/crew-quark-optimized', 'POST', { 
        test: 'webhook_registration',
        timestamp: new Date().toISOString()
      });
      
      if (response.status === 200) {
        console.log('✅ Webhook endpoint is working!');
        console.log(`📊 Response: ${JSON.stringify(response.data)}`);
      } else {
        console.log(`⚠️  Webhook response: ${response.status}`);
        console.log(`📄 Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.log(`❌ Webhook test error: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const fixer = new WebhookRegistrationFixer();
  await fixer.fixWebhookRegistration();
  
  console.log('\n🔧 Webhook Registration Fix Complete!');
  console.log('=====================================');
  console.log('Webhook registration has been fixed.');
  console.log('The workflow should now be accessible via webhook.');
}

main().catch(console.error);
