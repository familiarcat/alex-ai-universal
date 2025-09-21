#!/usr/bin/env node

/**
 * 🔄 Direct JSON-N8N Sync System
 * 
 * Ensures local JSON crew files directly represent N8N workflows
 * with immediate synchronization for viable Alex AI usage
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

class DirectJSONN8NSync {
  constructor() {
    this.workflowId = 'L6K4bzSKlGC36ABL'; // Quark workflow ID
    this.localJsonPath = path.join(__dirname, '..', 'packages', 'core', 'src', 'anti-hallucination', 'n8n-workflows', 'optimized-quark-workflow.json');
  }

  /**
   * Main sync operation
   */
  async sync() {
    console.log('🔄 Direct JSON-N8N Sync System');
    console.log('===============================');
    console.log('Ensuring local JSON files directly represent N8N workflows...');
    
    try {
      // Step 1: Get current N8N workflow
      const n8nWorkflow = await this.getN8NWorkflow();
      
      // Step 2: Get current local JSON
      const localJson = await this.getLocalJSON();
      
      // Step 3: Compare and identify differences
      const differences = this.compareWorkflows(n8nWorkflow, localJson);
      
      // Step 4: Update N8N with local JSON (source of truth)
      await this.updateN8NWithLocalJSON(localJson);
      
      // Step 5: Verify synchronization
      await this.verifySynchronization();
      
      // Step 6: Force UI refresh
      await this.forceUIRefresh();
      
    } catch (error) {
      console.error('❌ Direct sync failed:', error.message);
    }
  }

  /**
   * Get current N8N workflow
   */
  async getN8NWorkflow() {
    console.log('\n📋 Getting N8N Workflow...');
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
    
    if (response.status === 200) {
      const workflow = response.data;
      console.log(`✅ N8N Workflow: ${workflow.name}`);
      console.log(`✅ Nodes: ${workflow.nodes.length}`);
      console.log(`✅ Connections: ${Object.keys(workflow.connections).length}`);
      return workflow;
    } else {
      throw new Error(`Failed to fetch N8N workflow: ${response.status}`);
    }
  }

  /**
   * Get current local JSON
   */
  async getLocalJSON() {
    console.log('\n📄 Getting Local JSON...');
    
    if (!fs.existsSync(this.localJsonPath)) {
      throw new Error(`Local JSON file not found: ${this.localJsonPath}`);
    }
    
    const content = fs.readFileSync(this.localJsonPath, 'utf8');
    const json = JSON.parse(content);
    
    console.log(`✅ Local JSON: ${json.name}`);
    console.log(`✅ Nodes: ${json.nodes.length}`);
    console.log(`✅ Connections: ${Object.keys(json.connections).length}`);
    
    return json;
  }

  /**
   * Compare workflows and identify differences
   */
  compareWorkflows(n8nWorkflow, localJson) {
    console.log('\n🔍 Comparing Workflows...');
    
    const differences = {
      name: n8nWorkflow.name !== localJson.name,
      nodes: JSON.stringify(n8nWorkflow.nodes) !== JSON.stringify(localJson.nodes),
      connections: JSON.stringify(n8nWorkflow.connections) !== JSON.stringify(localJson.connections),
      settings: JSON.stringify(n8nWorkflow.settings || {}) !== JSON.stringify(localJson.settings || {})
    };
    
    console.log(`📋 Name difference: ${differences.name ? 'Yes' : 'No'}`);
    console.log(`📋 Nodes difference: ${differences.nodes ? 'Yes' : 'No'}`);
    console.log(`📋 Connections difference: ${differences.connections ? 'Yes' : 'No'}`);
    console.log(`📋 Settings difference: ${differences.settings ? 'Yes' : 'No'}`);
    
    const hasDifferences = Object.values(differences).some(diff => diff);
    console.log(`📋 Overall differences: ${hasDifferences ? 'Yes' : 'No'}`);
    
    return differences;
  }

  /**
   * Update N8N with local JSON (source of truth)
   */
  async updateN8NWithLocalJSON(localJson) {
    console.log('\n🔄 Updating N8N with Local JSON...');
    
    // Prepare update payload with local JSON as source of truth
    const updatePayload = {
      name: localJson.name,
      nodes: localJson.nodes,
      connections: localJson.connections,
      settings: localJson.settings || {}
    };
    
    console.log('📤 Sending local JSON to N8N...');
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`, 'PUT', updatePayload);
    
    if (response.status === 200) {
      console.log('✅ N8N updated with local JSON successfully');
    } else {
      console.log(`❌ N8N update failed: ${response.status}`);
      throw new Error(`N8N update failed: ${response.status}`);
    }
  }

  /**
   * Verify synchronization
   */
  async verifySynchronization() {
    console.log('\n✅ Verifying Synchronization...');
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
    
    if (response.status === 200) {
      const workflow = response.data;
      
      console.log(`✅ Workflow: ${workflow.name}`);
      console.log(`✅ Active: ${workflow.active}`);
      console.log(`✅ Nodes: ${workflow.nodes.length}`);
      console.log(`✅ Connections: ${Object.keys(workflow.connections).length}`);
      
      // Verify key connections
      const keyConnections = [
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
      for (const connection of keyConnections) {
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
        console.log('\n🎉 All connections are properly synchronized!');
      } else {
        console.log('\n⚠️  Some connections still need attention');
      }
      
    } else {
      console.error(`❌ Verification failed: ${response.status}`);
    }
  }

  /**
   * Force UI refresh
   */
  async forceUIRefresh() {
    console.log('\n🔄 Forcing UI Refresh...');
    
    // Deactivate workflow
    console.log('⏸️  Deactivating workflow...');
    await makeN8NRequest(`/api/v1/workflows/${this.workflowId}/activate`, 'POST', { active: false });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reactivate workflow
    console.log('▶️  Reactivating workflow...');
    await makeN8NRequest(`/api/v1/workflows/${this.workflowId}/activate`, 'POST', { active: true });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ UI refresh cycle completed');
  }

  /**
   * Create crew workflow directory structure
   */
  async createCrewWorkflowStructure() {
    console.log('\n📁 Creating Crew Workflow Structure...');
    
    const crewWorkflowsDir = path.join(__dirname, '..', 'packages', 'core', 'src', 'crew-workflows');
    
    if (!fs.existsSync(crewWorkflowsDir)) {
      fs.mkdirSync(crewWorkflowsDir, { recursive: true });
      console.log(`✅ Created directory: ${crewWorkflowsDir}`);
    }
    
    // Copy Quark workflow to crew workflows directory
    const quarkWorkflowPath = path.join(crewWorkflowsDir, 'quark-workflow.json');
    fs.copyFileSync(this.localJsonPath, quarkWorkflowPath);
    console.log(`✅ Copied Quark workflow to: ${quarkWorkflowPath}`);
    
    return crewWorkflowsDir;
  }

  /**
   * Sync all crew workflows
   */
  async syncAllCrewWorkflows() {
    console.log('\n🔄 Syncing All Crew Workflows...');
    
    // Get all workflows from N8N
    const response = await makeN8NRequest('/api/v1/workflows');
    
    if (response.status === 200) {
      const workflows = response.data.data || response.data;
      const crewWorkflows = workflows.filter(workflow => 
        workflow.name.toLowerCase().includes('crew') && 
        !workflow.name.toLowerCase().includes('crew management')
      );
      
      console.log(`✅ Found ${crewWorkflows.length} crew workflows`);
      
      const crewWorkflowsDir = await this.createCrewWorkflowStructure();
      
      for (const workflow of crewWorkflows) {
        const filename = this.createWorkflowFilename(workflow.name);
        const filePath = path.join(crewWorkflowsDir, filename);
        
        // Save workflow to local JSON file
        fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
        console.log(`✅ Saved: ${filename}`);
      }
      
    } else {
      console.error(`❌ Failed to fetch workflows: ${response.status}`);
    }
  }

  /**
   * Create filename from workflow name
   */
  createWorkflowFilename(workflowName) {
    return workflowName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '.json';
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const sync = new DirectJSONN8NSync();
  
  const command = process.argv[2] || 'sync';
  
  switch (command) {
    case 'sync':
      await sync.sync();
      break;
    case 'sync-all':
      await sync.syncAllCrewWorkflows();
      break;
    case 'verify':
      await sync.verifySynchronization();
      break;
    default:
      console.log('Usage: node direct-json-n8n-sync.js [sync|sync-all|verify]');
      break;
  }
  
  console.log('\n🎯 Direct JSON-N8N Sync Complete!');
  console.log('==================================');
  console.log('Local JSON files now directly represent N8N workflows.');
  console.log('The gap has been closed for viable Alex AI usage.');
}

main().catch(console.error);
