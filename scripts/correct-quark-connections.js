#!/usr/bin/env node

/**
 * 🔧 Correct Quark Workflow Connections
 * 
 * Implements the proper order of operations for Quark's workflow
 * based on the correct parallel processing architecture
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

class QuarkConnectionsCorrector {
  constructor() {
    this.workflowId = 'L6K4bzSKlGC36ABL';
  }

  /**
   * Correct Quark workflow connections
   */
  async correctQuarkConnections() {
    console.log('🔧 Correcting Quark Workflow Connections');
    console.log('=======================================');
    
    try {
      // Step 1: Get current workflow
      const workflow = await this.getCurrentWorkflow();
      
      // Step 2: Create correct connections structure
      const correctConnections = this.createCorrectConnections();
      
      // Step 3: Update workflow with correct connections
      await this.updateWorkflowConnections(workflow, correctConnections);
      
      // Step 4: Verify the correction
      await this.verifyConnections();
      
    } catch (error) {
      console.error('❌ Correction failed:', error.message);
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
   * Create correct connections structure based on proper order of operations
   */
  createCorrectConnections() {
    console.log('\n🔧 Creating Correct Connections Structure...');
    
    // CORRECT ORDER OF OPERATIONS:
    // 1. Quark Directive (webhook) receives input
    // 2. Parallel branches:
    //    - Branch A: Business Context Analysis → LLM Optimization → AI Agent
    //    - Branch B: Memory Retrieval → AI Agent (provides context)
    // 3. AI Agent processes with both business context and memory
    // 4. Parallel branches from AI Agent:
    //    - Branch C: Memory Storage → Response
    //    - Branch D: Observation Lounge → Response
    // 5. Response combines both memory storage and observation lounge results
    
    const correctConnections = {
      // Quark Directive connects to both parallel branches
      'quark-directive-webhook': {
        main: [[
          { node: 'business-context-analysis', type: 'main', index: 0 },
          { node: 'quark-memory-retrieval', type: 'main', index: 0 }
        ]]
      },
      
      // Business Context Analysis flows to LLM Optimization
      'business-context-analysis': {
        main: [[
          { node: 'llm-optimization-quark', type: 'main', index: 0 }
        ]]
      },
      
      // LLM Optimization flows to AI Agent
      'llm-optimization-quark': {
        main: [[
          { node: 'quark-ai-agent-optimized', type: 'main', index: 0 }
        ]]
      },
      
      // Memory Retrieval flows directly to AI Agent (parallel to business context)
      'quark-memory-retrieval': {
        main: [[
          { node: 'quark-ai-agent-optimized', type: 'main', index: 0 }
        ]]
      },
      
      // AI Agent connects to both parallel branches
      'quark-ai-agent-optimized': {
        main: [[
          { node: 'quark-memory-storage-optimized', type: 'main', index: 0 },
          { node: 'observation-lounge-quark', type: 'main', index: 0 }
        ]]
      },
      
      // Memory Storage flows to Response
      'quark-memory-storage-optimized': {
        main: [[
          { node: 'quark-response-optimized', type: 'main', index: 0 }
        ]]
      },
      
      // Observation Lounge flows to Response
      'observation-lounge-quark': {
        main: [[
          { node: 'quark-response-optimized', type: 'main', index: 0 }
        ]]
      }
    };
    
    console.log('✅ Correct connections structure created');
    console.log('\n📋 CORRECT ORDER OF OPERATIONS:');
    console.log('1. 🔄 Quark Directive (webhook input)');
    console.log('2. 📊 Parallel Branch A: Business Context Analysis → LLM Optimization → AI Agent');
    console.log('3. 💾 Parallel Branch B: Memory Retrieval → AI Agent');
    console.log('4. 🤖 AI Agent (processes with business context + memory)');
    console.log('5. 📊 Parallel Branch C: Memory Storage → Response');
    console.log('6. 🎭 Parallel Branch D: Observation Lounge → Response');
    console.log('7. 📤 Response (combines memory storage + observation lounge)');
    
    return correctConnections;
  }

  /**
   * Update workflow with correct connections
   */
  async updateWorkflowConnections(workflow, correctConnections) {
    console.log('\n🔄 Updating Workflow with Correct Connections...');
    
    // Prepare the update payload
    const updatePayload = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: correctConnections,
      settings: workflow.settings || {}
    };
    
    console.log('📤 Sending correct connections update...');
    
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
   * Verify the connections correction
   */
  async verifyConnections() {
    console.log('\n✅ Verifying Connections Correction...');
    
    // Wait for the update to propagate
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
    
    if (response.status === 200) {
      const workflow = response.data;
      
      console.log(`✅ Workflow: ${workflow.name}`);
      console.log(`✅ Active: ${workflow.active}`);
      console.log(`✅ Connections: ${Object.keys(workflow.connections).length}`);
      
      // Verify each critical connection
      console.log('\n🔗 Connection Verification:');
      
      const expectedConnections = [
        {
          from: 'quark-directive-webhook',
          expected: ['business-context-analysis', 'quark-memory-retrieval'],
          description: 'Webhook should connect to both Business Context and Memory Retrieval (parallel branches)'
        },
        {
          from: 'business-context-analysis',
          expected: ['llm-optimization-quark'],
          description: 'Business Context should connect to LLM Optimization'
        },
        {
          from: 'llm-optimization-quark',
          expected: ['quark-ai-agent-optimized'],
          description: 'LLM Optimization should connect to AI Agent'
        },
        {
          from: 'quark-memory-retrieval',
          expected: ['quark-ai-agent-optimized'],
          description: 'Memory Retrieval should connect to AI Agent (parallel to business context)'
        },
        {
          from: 'quark-ai-agent-optimized',
          expected: ['quark-memory-storage-optimized', 'observation-lounge-quark'],
          description: 'AI Agent should connect to both Memory Storage and Observation Lounge (parallel branches)'
        },
        {
          from: 'quark-memory-storage-optimized',
          expected: ['quark-response-optimized'],
          description: 'Memory Storage should connect to Response'
        },
        {
          from: 'observation-lounge-quark',
          expected: ['quark-response-optimized'],
          description: 'Observation Lounge should connect to Response'
        }
      ];
      
      let allValid = true;
      
      for (const connection of expectedConnections) {
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
        console.log('\n🎉 All connections are correctly configured!');
        console.log('🖖 Quark workflow now follows proper order of operations');
      } else {
        console.log('\n⚠️  Some connections still need correction');
      }
      
    } else {
      console.error(`❌ Failed to verify connections: ${response.status}`);
    }
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const corrector = new QuarkConnectionsCorrector();
  await corrector.correctQuarkConnections();
  
  console.log('\n🎯 Quark Connections Correction Complete!');
  console.log('=========================================');
  console.log('The workflow now follows the correct order of operations:');
  console.log('1. Parallel processing: Business Context + Memory Retrieval');
  console.log('2. AI Agent processes with both contexts');
  console.log('3. Parallel output: Memory Storage + Observation Lounge');
  console.log('4. Response combines all results');
  console.log('\nPlease refresh your N8N UI to see the corrected connections.');
}

main().catch(console.error);
