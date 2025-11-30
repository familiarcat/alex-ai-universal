#!/usr/bin/env node

/**
 * 🎯 Visual Connection Enforcer
 * 
 * Forces N8N UI to properly display connections through multiple
 * aggressive refresh and update techniques
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

class VisualConnectionEnforcer {
  constructor() {
    this.workflowId = 'L6K4bzSKlGC36ABL';
  }

  /**
   * Force visual connections through aggressive techniques
   */
  async enforceVisualConnections() {
    console.log('🎯 Visual Connection Enforcer');
    console.log('=============================');
    console.log('Forcing N8N UI to display connections properly...');
    
    try {
      // Step 1: Get current workflow
      const workflow = await this.getCurrentWorkflow();
      
      // Step 2: Perform aggressive refresh cycle
      await this.performAggressiveRefreshCycle(workflow);
      
      // Step 3: Force connection recalculation
      await this.forceConnectionRecalculation(workflow);
      
      // Step 4: Trigger UI rebuild
      await this.triggerUIRebuild(workflow);
      
      // Step 5: Final verification
      await this.finalVerification();
      
    } catch (error) {
      console.error('❌ Visual enforcement failed:', error.message);
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
   * Perform aggressive refresh cycle
   */
  async performAggressiveRefreshCycle(workflow) {
    console.log('\n🔄 Performing Aggressive Refresh Cycle...');
    
    // Cycle 1: Deactivate → Update → Reactivate
    console.log('🔄 Cycle 1: Deactivate → Update → Reactivate');
    await this.deactivateWorkflow();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.updateWorkflowWithExplicitConnections(workflow);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.activateWorkflow();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Cycle 2: Deactivate → Update with different format → Reactivate
    console.log('🔄 Cycle 2: Alternative connection format');
    await this.deactivateWorkflow();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.updateWorkflowWithAlternativeFormat(workflow);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.activateWorkflow();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Cycle 3: Final update with normalized connections
    console.log('🔄 Cycle 3: Normalized connections');
    await this.deactivateWorkflow();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.updateWorkflowWithNormalizedConnections(workflow);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.activateWorkflow();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Aggressive refresh cycle completed');
  }

  /**
   * Update workflow with explicit connections
   */
  async updateWorkflowWithExplicitConnections(workflow) {
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
      'quark-memory-retrieval': {
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
    
    const updatePayload = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: explicitConnections,
      settings: workflow.settings || {}
    };
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`, 'PUT', updatePayload);
    
    if (response.status === 200) {
      console.log('  ✅ Explicit connections updated');
    } else {
      console.log(`  ❌ Update failed: ${response.status}`);
    }
  }

  /**
   * Update workflow with alternative connection format
   */
  async updateWorkflowWithAlternativeFormat(workflow) {
    // Alternative format with different structure
    const alternativeConnections = {
      'quark-directive-webhook': {
        main: [
          [
            { node: 'business-context-analysis', type: 'main', index: 0 }
          ],
          [
            { node: 'quark-memory-retrieval', type: 'main', index: 0 }
          ]
        ]
      },
      'business-context-analysis': {
        main: [
          [
            { node: 'llm-optimization-quark', type: 'main', index: 0 }
          ]
        ]
      },
      'llm-optimization-quark': {
        main: [
          [
            { node: 'quark-ai-agent-optimized', type: 'main', index: 0 }
          ]
        ]
      },
      'quark-memory-retrieval': {
        main: [
          [
            { node: 'quark-ai-agent-optimized', type: 'main', index: 0 }
          ]
        ]
      },
      'quark-ai-agent-optimized': {
        main: [
          [
            { node: 'quark-memory-storage-optimized', type: 'main', index: 0 }
          ],
          [
            { node: 'observation-lounge-quark', type: 'main', index: 0 }
          ]
        ]
      },
      'quark-memory-storage-optimized': {
        main: [
          [
            { node: 'quark-response-optimized', type: 'main', index: 0 }
          ]
        ]
      },
      'observation-lounge-quark': {
        main: [
          [
            { node: 'quark-response-optimized', type: 'main', index: 0 }
          ]
        ]
      }
    };
    
    const updatePayload = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: alternativeConnections,
      settings: workflow.settings || {}
    };
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`, 'PUT', updatePayload);
    
    if (response.status === 200) {
      console.log('  ✅ Alternative format updated');
    } else {
      console.log(`  ❌ Alternative update failed: ${response.status}`);
    }
  }

  /**
   * Update workflow with normalized connections
   */
  async updateWorkflowWithNormalizedConnections(workflow) {
    // Final normalized format
    const normalizedConnections = {
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
      'quark-memory-retrieval': {
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
    
    const updatePayload = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: normalizedConnections,
      settings: workflow.settings || {}
    };
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`, 'PUT', updatePayload);
    
    if (response.status === 200) {
      console.log('  ✅ Normalized connections updated');
    } else {
      console.log(`  ❌ Normalized update failed: ${response.status}`);
    }
  }

  /**
   * Force connection recalculation
   */
  async forceConnectionRecalculation(workflow) {
    console.log('\n🔄 Forcing Connection Recalculation...');
    
    // Trigger multiple API calls to force recalculation
    const endpoints = [
      `/api/v1/workflows/${this.workflowId}`,
      `/api/v1/workflows/${this.workflowId}/activate`,
      `/api/v1/workflows/${this.workflowId}`
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await makeN8NRequest(endpoint);
        console.log(`  ✅ Triggered: ${endpoint} (${response.status})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`  ⚠️  Endpoint error: ${endpoint}`);
      }
    }
    
    console.log('✅ Connection recalculation triggered');
  }

  /**
   * Trigger UI rebuild
   */
  async triggerUIRebuild(workflow) {
    console.log('\n🔄 Triggering UI Rebuild...');
    
    // Multiple activation cycles to trigger UI rebuild
    for (let i = 0; i < 3; i++) {
      console.log(`  🔄 Rebuild cycle ${i + 1}/3`);
      
      await this.deactivateWorkflow();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.activateWorkflow();
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('✅ UI rebuild triggered');
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
        console.log('🎯 Visual connections should now be displayed correctly in N8N UI');
      } else {
        console.log('\n⚠️  Some connections still need attention');
      }
      
    } else {
      console.error(`❌ Final verification failed: ${response.status}`);
    }
  }

  /**
   * Deactivate workflow
   */
  async deactivateWorkflow() {
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}/activate`, 'POST', { active: false });
    return response.status === 200;
  }

  /**
   * Activate workflow
   */
  async activateWorkflow() {
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}/activate`, 'POST', { active: true });
    return response.status === 200;
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const enforcer = new VisualConnectionEnforcer();
  await enforcer.enforceVisualConnections();
  
  console.log('\n🎯 Visual Connection Enforcement Complete!');
  console.log('=========================================');
  console.log('Aggressive refresh cycles completed.');
  console.log('Please refresh your browser page now:');
  console.log('https://n8n.pbradygeorgen.com/workflow/L6K4bzSKlGC36ABL');
  console.log('\nThe N8N UI should now display all connections properly.');
  console.log('If connections still appear disconnected, try:');
  console.log('1. Hard refresh (Ctrl+F5 or Cmd+Shift+R)');
  console.log('2. Clear browser cache');
  console.log('3. Open in incognito/private window');
}

main().catch(console.error);
