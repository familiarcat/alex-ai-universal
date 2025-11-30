#!/usr/bin/env node

/**
 * 🖖 Refresh Quark Workflow UI
 * 
 * Deactivates and reactivates the workflow to force UI refresh
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

class QuarkWorkflowUIRefresher {
  constructor() {
    this.workflowId = 'L6K4bzSKlGC36ABL';
  }

  /**
   * Refresh workflow UI by deactivating and reactivating
   */
  async refreshWorkflowUI() {
    console.log('🖖 Refreshing Quark Workflow UI');
    console.log('==============================');
    
    try {
      // Step 1: Get current workflow state
      const workflow = await this.getCurrentWorkflow();
      
      // Step 2: Deactivate workflow
      await this.deactivateWorkflow();
      
      // Step 3: Wait a moment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 4: Reactivate workflow
      await this.activateWorkflow();
      
      // Step 5: Verify final state
      await this.verifyFinalState();
      
    } catch (error) {
      console.error('❌ UI refresh failed:', error.message);
    }
  }

  /**
   * Get current workflow state
   */
  async getCurrentWorkflow() {
    console.log('\n📋 Getting Current Workflow State...');
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
    
    if (response.status === 200) {
      const workflow = response.data;
      
      console.log(`✅ Workflow: ${workflow.name}`);
      console.log(`✅ Current Status: ${workflow.active ? 'Active' : 'Inactive'}`);
      console.log(`✅ Nodes: ${workflow.nodes.length}`);
      console.log(`✅ Connections: ${Object.keys(workflow.connections).length}`);
      
      return workflow;
    } else {
      throw new Error(`Failed to fetch workflow: ${response.status}`);
    }
  }

  /**
   * Deactivate workflow
   */
  async deactivateWorkflow() {
    console.log('\n⏸️  Deactivating Workflow...');
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}/activate`, 'POST', { active: false });
    
    if (response.status === 200) {
      console.log('✅ Workflow deactivated successfully');
    } else {
      console.log(`⚠️  Deactivation response: ${response.status}`);
      console.log(`📄 Response: ${JSON.stringify(response.data, null, 2)}`);
    }
  }

  /**
   * Activate workflow
   */
  async activateWorkflow() {
    console.log('\n▶️  Activating Workflow...');
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}/activate`, 'POST', { active: true });
    
    if (response.status === 200) {
      console.log('✅ Workflow activated successfully');
    } else {
      console.log(`⚠️  Activation response: ${response.status}`);
      console.log(`📄 Response: ${JSON.stringify(response.data, null, 2)}`);
    }
  }

  /**
   * Verify final state
   */
  async verifyFinalState() {
    console.log('\n✅ Verifying Final State...');
    
    // Wait for activation to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
    
    if (response.status === 200) {
      const workflow = response.data;
      
      console.log(`✅ Final Status: ${workflow.active ? 'Active' : 'Inactive'}`);
      console.log(`✅ Nodes: ${workflow.nodes.length}`);
      console.log(`✅ Connections: ${Object.keys(workflow.connections).length}`);
      
      // Verify key connections
      const keyConnections = [
        'quark-directive-webhook',
        'business-context-analysis',
        'llm-optimization-quark',
        'quark-ai-agent-optimized'
      ];
      
      console.log('\n🔗 Key Connection Verification:');
      for (const nodeId of keyConnections) {
        if (workflow.connections[nodeId]) {
          const targets = workflow.connections[nodeId].main[0].map(conn => conn.node);
          console.log(`✅ ${nodeId} → ${targets.join(', ')}`);
        } else {
          console.log(`❌ ${nodeId} has no connections`);
        }
      }
      
    } else {
      console.error(`❌ Failed to verify final state: ${response.status}`);
    }
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const refresher = new QuarkWorkflowUIRefresher();
  await refresher.refreshWorkflowUI();
  
  console.log('\n🎯 UI Refresh Complete!');
  console.log('======================');
  console.log('The workflow has been deactivated and reactivated.');
  console.log('Please refresh your browser page (https://n8n.pbradygeorgen.com/workflow/L6K4bzSKlGC36ABL)');
  console.log('to see the updated connections.');
  console.log('\nIf connections still appear disconnected:');
  console.log('1. Try a hard refresh (Ctrl+F5 or Cmd+Shift+R)');
  console.log('2. Clear browser cache');
  console.log('3. Wait 30 seconds and refresh again');
  console.log('4. Try opening the workflow in an incognito/private window');
}

main().catch(console.error);
