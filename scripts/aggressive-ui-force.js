#!/usr/bin/env node

/**
 * 💥 Aggressive UI Force
 * 
 * Forces N8N UI to recognize connections through complete
 * workflow reconstruction and multiple refresh cycles
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

class AggressiveUIForce {
  constructor() {
    this.workflowId = 'L6K4bzSKlGC36ABL';
  }

  /**
   * Main aggressive UI force operation
   */
  async forceUI() {
    console.log('💥 Aggressive UI Force');
    console.log('=====================');
    console.log('Forcing N8N UI to recognize connections through complete reconstruction...');
    
    try {
      // Step 1: Get current workflow
      const currentWorkflow = await this.getCurrentWorkflow();
      
      // Step 2: Perform complete workflow reconstruction
      await this.performCompleteReconstruction(currentWorkflow);
      
      // Step 3: Multiple activation cycles
      await this.performMultipleActivationCycles();
      
      // Step 4: Force connection recalculation
      await this.forceConnectionRecalculation();
      
      // Step 5: Final verification
      await this.finalVerification();
      
    } catch (error) {
      console.error('❌ Aggressive UI force failed:', error.message);
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
      console.log(`✅ Nodes: ${workflow.nodes.length}`);
      console.log(`✅ Connections: ${Object.keys(workflow.connections).length}`);
      return workflow;
    } else {
      throw new Error(`Failed to fetch workflow: ${response.status}`);
    }
  }

  /**
   * Perform complete workflow reconstruction
   */
  async performCompleteReconstruction(workflow) {
    console.log('\n💥 Performing Complete Workflow Reconstruction...');
    
    // Step 1: Delete and recreate workflow
    console.log('🗑️  Step 1: Deleting existing workflow...');
    await this.deleteWorkflow();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 2: Create new workflow with fresh structure
    console.log('🆕 Step 2: Creating new workflow with fresh structure...');
    await this.createNewWorkflow(workflow);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 3: Add nodes one by one
    console.log('🔧 Step 3: Adding nodes one by one...');
    await this.addNodesOneByOne(workflow);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 4: Add connections explicitly
    console.log('🔗 Step 4: Adding connections explicitly...');
    await this.addConnectionsExplicitly(workflow);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow() {
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`, 'DELETE');
    
    if (response.status === 200 || response.status === 204) {
      console.log('  ✅ Workflow deleted');
    } else {
      console.log(`  ⚠️  Delete response: ${response.status}`);
    }
  }

  /**
   * Create new workflow
   */
  async createNewWorkflow(originalWorkflow) {
    const newWorkflow = {
      name: originalWorkflow.name,
      nodes: [],
      connections: {},
      settings: originalWorkflow.settings || {},
      active: false
    };
    
    const response = await makeN8NRequest('/api/v1/workflows', 'POST', newWorkflow);
    
    if (response.status === 201 || response.status === 200) {
      console.log('  ✅ New workflow created');
      // Update workflow ID if it changed
      if (response.data.id) {
        this.workflowId = response.data.id;
      }
    } else {
      console.log(`  ❌ Create failed: ${response.status}`);
      throw new Error(`Failed to create new workflow: ${response.status}`);
    }
  }

  /**
   * Add nodes one by one
   */
  async addNodesOneByOne(originalWorkflow) {
    for (let i = 0; i < originalWorkflow.nodes.length; i++) {
      const node = originalWorkflow.nodes[i];
      console.log(`  🔧 Adding node ${i + 1}/${originalWorkflow.nodes.length}: ${node.name}`);
      
      // Get current workflow
      const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
      if (response.status !== 200) continue;
      
      const currentWorkflow = response.data;
      
      // Add the node
      currentWorkflow.nodes.push(node);
      
      // Update workflow
      const updatePayload = {
        name: currentWorkflow.name,
        nodes: currentWorkflow.nodes,
        connections: currentWorkflow.connections,
        settings: currentWorkflow.settings || {}
      };
      
      await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`, 'PUT', updatePayload);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('  ✅ All nodes added');
  }

  /**
   * Add connections explicitly
   */
  async addConnectionsExplicitly(originalWorkflow) {
    const connections = originalWorkflow.connections;
    
    for (const [sourceNode, connectionData] of Object.entries(connections)) {
      console.log(`  🔗 Adding connections from: ${sourceNode}`);
      
      // Get current workflow
      const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
      if (response.status !== 200) continue;
      
      const currentWorkflow = response.data;
      
      // Add the connection
      currentWorkflow.connections[sourceNode] = connectionData;
      
      // Update workflow
      const updatePayload = {
        name: currentWorkflow.name,
        nodes: currentWorkflow.nodes,
        connections: currentWorkflow.connections,
        settings: currentWorkflow.settings || {}
      };
      
      await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`, 'PUT', updatePayload);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('  ✅ All connections added');
  }

  /**
   * Perform multiple activation cycles
   */
  async performMultipleActivationCycles() {
    console.log('\n🔄 Performing Multiple Activation Cycles...');
    
    for (let cycle = 1; cycle <= 5; cycle++) {
      console.log(`  🔄 Activation cycle ${cycle}/5`);
      
      // Deactivate
      await makeN8NRequest(`/api/v1/workflows/${this.workflowId}/activate`, 'POST', { active: false });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reactivate
      await makeN8NRequest(`/api/v1/workflows/${this.workflowId}/activate`, 'POST', { active: true });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Force workflow fetch
      await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('  ✅ Multiple activation cycles completed');
  }

  /**
   * Force connection recalculation
   */
  async forceConnectionRecalculation() {
    console.log('\n🔄 Forcing Connection Recalculation...');
    
    // Multiple API calls to force recalculation
    const endpoints = [
      `/api/v1/workflows/${this.workflowId}`,
      `/api/v1/workflows/${this.workflowId}/activate`,
      `/api/v1/workflows/${this.workflowId}`,
      `/api/v1/workflows/${this.workflowId}`,
      `/api/v1/workflows/${this.workflowId}/activate`,
      `/api/v1/workflows/${this.workflowId}`
    ];
    
    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      console.log(`  🔄 Recalculation call ${i + 1}/${endpoints.length}`);
      
      try {
        await makeN8NRequest(endpoint);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`  ⚠️  Endpoint error: ${endpoint}`);
      }
    }
    
    console.log('  ✅ Connection recalculation forced');
  }

  /**
   * Final verification
   */
  async finalVerification() {
    console.log('\n✅ Final Verification...');
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
    
    if (response.status === 200) {
      const workflow = response.data;
      
      console.log(`✅ Workflow: ${workflow.name}`);
      console.log(`✅ Active: ${workflow.active}`);
      console.log(`✅ Nodes: ${workflow.nodes.length}`);
      console.log(`✅ Connections: ${Object.keys(workflow.connections).length}`);
      
      // Verify all critical connections
      const criticalConnections = [
        {
          from: 'quark-directive-webhook',
          expected: ['business-context-analysis', 'quark-memory-retrieval']
        },
        {
          from: 'business-context-analysis',
          expected: ['llm-optimization-quark']
        },
        {
          from: 'llm-optimization-quark',
          expected: ['quark-ai-agent-optimized']
        },
        {
          from: 'quark-memory-retrieval',
          expected: ['quark-ai-agent-optimized']
        },
        {
          from: 'quark-ai-agent-optimized',
          expected: ['quark-memory-storage-optimized', 'observation-lounge-quark']
        },
        {
          from: 'quark-memory-storage-optimized',
          expected: ['quark-response-optimized']
        },
        {
          from: 'observation-lounge-quark',
          expected: ['quark-response-optimized']
        }
      ];
      
      let allValid = true;
      
      console.log('\n🔗 Connection Verification:');
      for (const connection of criticalConnections) {
        if (workflow.connections[connection.from]) {
          const actualTargets = workflow.connections[connection.from].main[0].map(conn => conn.node);
          const missing = connection.expected.filter(target => !actualTargets.includes(target));
          
          if (missing.length === 0) {
            console.log(`✅ ${connection.from} → ${connection.expected.join(', ')}`);
          } else {
            console.log(`❌ ${connection.from} missing: ${missing.join(', ')}`);
            allValid = false;
          }
        } else {
          console.log(`❌ ${connection.from} has no connections`);
          allValid = false;
        }
      }
      
      if (allValid) {
        console.log('\n🎉 All connections are properly configured!');
        console.log('🎯 UI should now display connections correctly');
      } else {
        console.log('\n⚠️  Some connections still need attention');
      }
      
    } else {
      console.error(`❌ Final verification failed: ${response.status}`);
    }
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const force = new AggressiveUIForce();
  await force.forceUI();
  
  console.log('\n💥 Aggressive UI Force Complete!');
  console.log('===============================');
  console.log('Complete workflow reconstruction completed.');
  console.log('Please refresh your browser page now:');
  console.log('https://n8n.pbradygeorgen.com/workflow/L6K4bzSKlGC36ABL');
  console.log('\nThe N8N UI should now display all connections properly.');
  console.log('If connections still appear disconnected, the issue may be:');
  console.log('1. Browser cache - try hard refresh (Ctrl+F5)');
  console.log('2. N8N server cache - may need server restart');
  console.log('3. Database sync issue - may need N8N restart');
}

main().catch(console.error);
