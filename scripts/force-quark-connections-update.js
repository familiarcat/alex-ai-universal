#!/usr/bin/env node

/**
 * 🖖 Force Quark Workflow Connections Update
 * 
 * Forces an update to ensure all connections are properly synced
 * to the N8N UI
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

class QuarkConnectionsUpdater {
  constructor() {
    this.workflowId = 'L6K4bzSKlGC36ABL';
  }

  /**
   * Force update workflow connections
   */
  async forceUpdateConnections() {
    console.log('🖖 Forcing Quark Workflow Connections Update');
    console.log('============================================');
    
    try {
      // Step 1: Get current workflow
      const workflow = await this.getCurrentWorkflow();
      
      // Step 2: Verify current connections
      this.verifyCurrentConnections(workflow);
      
      // Step 3: Force update with explicit connections
      await this.forceUpdateWorkflow(workflow);
      
      // Step 4: Verify update was successful
      await this.verifyUpdateSuccess();
      
    } catch (error) {
      console.error('❌ Force update failed:', error.message);
    }
  }

  /**
   * Get current workflow configuration
   */
  async getCurrentWorkflow() {
    console.log('\n📋 Getting Current Workflow Configuration...');
    
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
   * Verify current connections
   */
  verifyCurrentConnections(workflow) {
    console.log('\n🔗 Verifying Current Connections...');
    
    const expectedConnections = {
      'quark-directive-webhook': ['business-context-analysis', 'quark-memory-retrieval'],
      'business-context-analysis': ['llm-optimization-quark'],
      'llm-optimization-quark': ['quark-ai-agent-optimized'],
      'quark-ai-agent-optimized': ['quark-memory-storage-optimized', 'observation-lounge-quark'],
      'quark-memory-storage-optimized': ['quark-response-optimized'],
      'observation-lounge-quark': ['quark-response-optimized']
    };
    
    let allValid = true;
    
    for (const [source, expectedTargets] of Object.entries(expectedConnections)) {
      if (workflow.connections[source]) {
        const actualTargets = workflow.connections[source].main[0].map(conn => conn.node);
        const missing = expectedTargets.filter(target => !actualTargets.includes(target));
        
        if (missing.length === 0) {
          console.log(`✅ ${source} → ${expectedTargets.join(', ')}`);
        } else {
          console.log(`❌ ${source} missing: ${missing.join(', ')}`);
          allValid = false;
        }
      } else {
        console.log(`❌ ${source} has no connections`);
        allValid = false;
      }
    }
    
    if (allValid) {
      console.log('✅ All connections are properly configured in API');
    } else {
      console.log('❌ Some connections are missing in API');
    }
    
    return allValid;
  }

  /**
   * Force update workflow to ensure UI sync
   */
  async forceUpdateWorkflow(workflow) {
    console.log('\n🔄 Forcing Workflow Update...');
    
    // Create explicit connections object
    const explicitConnections = {
      'quark-directive-webhook': {
        main: [[
          { node: 'business-context-analysis', type: 'main', index: 0 },
          { node: 'quark-memory-retrieval', type: 'main', index: 0 }
        ]]
      },
      'business-context-analysis': {
        main: [[
          { node: 'llm-optimization-quark', type: 'main', index: 0 }
        ]]
      },
      'llm-optimization-quark': {
        main: [[
          { node: 'quark-ai-agent-optimized', type: 'main', index: 0 }
        ]]
      },
      'quark-ai-agent-optimized': {
        main: [[
          { node: 'quark-memory-storage-optimized', type: 'main', index: 0 },
          { node: 'observation-lounge-quark', type: 'main', index: 0 }
        ]]
      },
      'quark-memory-storage-optimized': {
        main: [[
          { node: 'quark-response-optimized', type: 'main', index: 0 }
        ]]
      },
      'observation-lounge-quark': {
        main: [[
          { node: 'quark-response-optimized', type: 'main', index: 0 }
        ]]
      }
    };
    
    // Prepare update payload
    const updatePayload = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: explicitConnections,
      settings: workflow.settings || {},
      active: workflow.active
    };
    
    console.log('📤 Sending explicit connections update...');
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`, 'PUT', updatePayload);
    
    if (response.status === 200) {
      console.log('✅ Workflow update successful');
      console.log(`📋 Updated workflow: ${response.data.name}`);
    } else {
      console.error(`❌ Workflow update failed: ${response.status}`);
      console.error(`📄 Response: ${JSON.stringify(response.data, null, 2)}`);
    }
  }

  /**
   * Verify update was successful
   */
  async verifyUpdateSuccess() {
    console.log('\n✅ Verifying Update Success...');
    
    // Wait a moment for the update to propagate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
    
    if (response.status === 200) {
      const workflow = response.data;
      
      console.log(`✅ Workflow: ${workflow.name}`);
      console.log(`✅ Active: ${workflow.active}`);
      console.log(`✅ Connections: ${Object.keys(workflow.connections).length}`);
      
      // Verify connections are still intact
      const connectionCount = Object.keys(workflow.connections).length;
      if (connectionCount >= 6) {
        console.log('✅ Connections preserved after update');
      } else {
        console.log(`⚠️  Connection count reduced to ${connectionCount}`);
      }
      
    } else {
      console.error(`❌ Failed to verify update: ${response.status}`);
    }
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const updater = new QuarkConnectionsUpdater();
  await updater.forceUpdateConnections();
  
  console.log('\n🎯 Force Update Complete!');
  console.log('=========================');
  console.log('Please refresh the N8N UI to see the updated connections.');
  console.log('If connections still appear disconnected, try:');
  console.log('1. Hard refresh (Ctrl+F5 or Cmd+Shift+R)');
  console.log('2. Clear browser cache');
  console.log('3. Wait 30 seconds and refresh again');
}

main().catch(console.error);
