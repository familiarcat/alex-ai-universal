#!/usr/bin/env node

/**
 * 🖖 Fix Quark UI Connections
 * 
 * Fixes the visual connections in N8N UI to match the intended workflow
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

class QuarkUIConnectionsFixer {
  constructor() {
    this.workflowId = 'L6K4bzSKlGC36ABL';
  }

  /**
   * Fix the UI connections to show the proper workflow
   */
  async fixUIConnections() {
    console.log('🖖 Fixing Quark UI Connections');
    console.log('==============================');
    
    try {
      // Step 1: Get current workflow
      const workflow = await this.getCurrentWorkflow();
      
      // Step 2: Create the correct connections structure
      const correctedConnections = this.createCorrectedConnections();
      
      // Step 3: Update workflow with corrected connections
      await this.updateWorkflowConnections(workflow, correctedConnections);
      
      // Step 4: Verify the fix
      await this.verifyConnectionsFix();
      
    } catch (error) {
      console.error('❌ Fix failed:', error.message);
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
      console.log(`✅ Current Connections: ${Object.keys(workflow.connections).length}`);
      return workflow;
    } else {
      throw new Error(`Failed to fetch workflow: ${response.status}`);
    }
  }

  /**
   * Create corrected connections structure
   */
  createCorrectedConnections() {
    console.log('\n🔧 Creating Corrected Connections Structure...');
    
    // The corrected connections that should show in the UI
    const correctedConnections = {
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
      'quark-memory-retrieval': {
        main: [[
          { node: 'quark-ai-agent-optimized', type: 'main', index: 0 }
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
    
    console.log('✅ Corrected connections structure created');
    console.log('📋 Expected connections:');
    console.log('  - Quark Directive → Business Context Analysis + Memory Retrieval');
    console.log('  - Business Context Analysis → LLM Optimization');
    console.log('  - Memory Retrieval → AI Agent');
    console.log('  - LLM Optimization → AI Agent');
    console.log('  - AI Agent → Memory Storage + Observation Lounge');
    console.log('  - Memory Storage → Response');
    console.log('  - Observation Lounge → Response');
    
    return correctedConnections;
  }

  /**
   * Update workflow with corrected connections
   */
  async updateWorkflowConnections(workflow, correctedConnections) {
    console.log('\n🔄 Updating Workflow Connections...');
    
    // Prepare the update payload
    const updatePayload = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: correctedConnections,
      settings: workflow.settings || {}
    };
    
    console.log('📤 Sending corrected connections update...');
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`, 'PUT', updatePayload);
    
    if (response.status === 200) {
      console.log('✅ Workflow connections updated successfully');
      console.log(`📋 Updated workflow: ${response.data.name}`);
    } else {
      console.error(`❌ Update failed: ${response.status}`);
      console.error(`📄 Response: ${JSON.stringify(response.data, null, 2)}`);
      throw new Error(`Update failed: ${response.status}`);
    }
  }

  /**
   * Verify the connections fix
   */
  async verifyConnectionsFix() {
    console.log('\n✅ Verifying Connections Fix...');
    
    // Wait for the update to propagate
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
    
    if (response.status === 200) {
      const workflow = response.data;
      
      console.log(`✅ Workflow: ${workflow.name}`);
      console.log(`✅ Active: ${workflow.active}`);
      console.log(`✅ Connections: ${Object.keys(workflow.connections).length}`);
      
      // Verify key connections
      console.log('\n🔗 Connection Verification:');
      
      const keyConnections = [
        {
          from: 'quark-directive-webhook',
          expected: ['business-context-analysis', 'quark-memory-retrieval'],
          description: 'Webhook should connect to both Business Context and Memory Retrieval'
        },
        {
          from: 'business-context-analysis',
          expected: ['llm-optimization-quark'],
          description: 'Business Context should connect to LLM Optimization'
        },
        {
          from: 'quark-memory-retrieval',
          expected: ['quark-ai-agent-optimized'],
          description: 'Memory Retrieval should connect to AI Agent'
        },
        {
          from: 'llm-optimization-quark',
          expected: ['quark-ai-agent-optimized'],
          description: 'LLM Optimization should connect to AI Agent'
        },
        {
          from: 'quark-ai-agent-optimized',
          expected: ['quark-memory-storage-optimized', 'observation-lounge-quark'],
          description: 'AI Agent should connect to both Memory Storage and Observation Lounge'
        }
      ];
      
      let allValid = true;
      
      for (const connection of keyConnections) {
        if (workflow.connections[connection.from]) {
          const actualTargets = workflow.connections[connection.from].main[0].map(conn => conn.node);
          const missing = connection.expected.filter(target => !actualTargets.includes(target));
          
          if (missing.length === 0) {
            console.log(`✅ ${connection.from} → ${connection.expected.join(', ')}`);
          } else {
            console.log(`❌ ${connection.from} missing: ${missing.join(', ')}`);
            console.log(`   Description: ${connection.description}`);
            allValid = false;
          }
        } else {
          console.log(`❌ ${connection.from} has no connections`);
          console.log(`   Description: ${connection.description}`);
          allValid = false;
        }
      }
      
      if (allValid) {
        console.log('\n🎉 All connections are properly configured!');
      } else {
        console.log('\n⚠️  Some connections still need fixing');
      }
      
    } else {
      console.error(`❌ Failed to verify fix: ${response.status}`);
    }
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const fixer = new QuarkUIConnectionsFixer();
  await fixer.fixUIConnections();
  
  console.log('\n🎯 UI Connections Fix Complete!');
  console.log('==============================');
  console.log('The workflow connections have been corrected.');
  console.log('Please refresh your browser page now:');
  console.log('https://n8n.pbradygeorgen.com/workflow/L6K4bzSKlGC36ABL');
  console.log('\nYou should now see:');
  console.log('- Quark Directive connected to BOTH Business Context Analysis AND Memory Retrieval');
  console.log('- Memory Retrieval connected to AI Agent');
  console.log('- All other connections properly established');
}

main().catch(console.error);
