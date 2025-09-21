#!/usr/bin/env node

/**
 * 🔧 Fix Anti-Hallucination Workflow
 * 
 * Converts the problematic anti-hallucination workflow to use HTTP requests
 * instead of the OpenRouter node
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

class AntiHallucinationWorkflowFixer {
  constructor() {
    this.problematicWorkflowId = 'oaSjbIhny5J1sa7E';
  }

  /**
   * Fix the anti-hallucination workflow
   */
  async fixAntiHallucinationWorkflow() {
    console.log('🔧 Fixing Anti-Hallucination Workflow');
    console.log('====================================');
    
    try {
      // Step 1: Get the problematic workflow
      const workflow = await this.getProblematicWorkflow();
      
      if (!workflow) {
        console.log('❌ Could not fetch problematic workflow');
        return;
      }
      
      // Step 2: Convert OpenRouter node to HTTP request
      const fixedWorkflow = this.convertOpenRouterToHttp(workflow);
      
      // Step 3: Update the workflow
      await this.updateWorkflow(fixedWorkflow);
      
      // Step 4: Verify the fix
      await this.verifyFix();
      
    } catch (error) {
      console.error('❌ Fix failed:', error.message);
    }
  }

  /**
   * Get the problematic workflow
   */
  async getProblematicWorkflow() {
    console.log('\n📋 Fetching Problematic Workflow...');
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.problematicWorkflowId}`);
    
    if (response.status === 200) {
      const workflow = response.data;
      console.log(`✅ Workflow: ${workflow.name}`);
      console.log(`✅ Nodes: ${workflow.nodes.length}`);
      console.log(`✅ Active: ${workflow.active}`);
      
      // Find OpenRouter nodes
      const openRouterNodes = workflow.nodes.filter(node => 
        node.type === 'n8n-nodes-base.openRouter' || 
        node.type === 'n8n-nodes-openrouter'
      );
      
      console.log(`❌ OpenRouter nodes found: ${openRouterNodes.length}`);
      
      return workflow;
    } else {
      console.error(`❌ Failed to fetch workflow: ${response.status}`);
      return null;
    }
  }

  /**
   * Convert OpenRouter node to HTTP request
   */
  convertOpenRouterToHttp(workflow) {
    console.log('\n🔄 Converting OpenRouter Node to HTTP Request...');
    
    const fixedWorkflow = { ...workflow };
    
    // Find and replace OpenRouter nodes
    fixedWorkflow.nodes = workflow.nodes.map(node => {
      if (node.type === 'n8n-nodes-base.openRouter' || node.type === 'n8n-nodes-openrouter') {
        console.log(`  🔄 Converting: ${node.name}`);
        
        // Convert to HTTP Request node
        return {
          ...node,
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          parameters: {
            url: 'https://api.openrouter.ai/api/v1/chat/completions',
            authentication: 'genericCredentialType',
            requestMethod: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: {
              model: 'anthropic/claude-3.5-sonnet',
              messages: [
                {
                  role: 'user',
                  content: '{{ $json.prompt || $json.message || "Analyze this prompt for potential hallucinations" }}'
                }
              ],
              temperature: 0.7,
              max_tokens: 1000
            },
            options: {}
          }
        };
      }
      return node;
    });
    
    console.log('✅ OpenRouter nodes converted to HTTP Request nodes');
    
    return fixedWorkflow;
  }

  /**
   * Update the workflow
   */
  async updateWorkflow(fixedWorkflow) {
    console.log('\n📤 Updating Workflow...');
    
    // Prepare update payload
    const updatePayload = {
      name: fixedWorkflow.name,
      nodes: fixedWorkflow.nodes,
      connections: fixedWorkflow.connections,
      settings: fixedWorkflow.settings || {}
    };
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.problematicWorkflowId}`, 'PUT', updatePayload);
    
    if (response.status === 200) {
      console.log('✅ Workflow updated successfully');
      console.log(`📋 Updated workflow: ${response.data.name}`);
    } else {
      console.error(`❌ Update failed: ${response.status}`);
      console.error(`📄 Response: ${JSON.stringify(response.data, null, 2)}`);
      throw new Error(`Update failed: ${response.status}`);
    }
  }

  /**
   * Verify the fix
   */
  async verifyFix() {
    console.log('\n✅ Verifying Fix...');
    
    // Wait for the update to propagate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.problematicWorkflowId}`);
    
    if (response.status === 200) {
      const workflow = response.data;
      
      console.log(`✅ Workflow: ${workflow.name}`);
      console.log(`✅ Nodes: ${workflow.nodes.length}`);
      
      // Check for remaining OpenRouter nodes
      const openRouterNodes = workflow.nodes.filter(node => 
        node.type === 'n8n-nodes-base.openRouter' || 
        node.type === 'n8n-nodes-openrouter'
      );
      
      if (openRouterNodes.length === 0) {
        console.log('✅ No OpenRouter nodes found - conversion successful!');
        
        // Check for HTTP Request nodes
        const httpNodes = workflow.nodes.filter(node => node.type === 'n8n-nodes-base.httpRequest');
        console.log(`✅ HTTP Request nodes: ${httpNodes.length}`);
        
        // Try to activate the workflow
        console.log('\n🔄 Attempting to activate workflow...');
        const activateResponse = await makeN8NRequest(`/api/v1/workflows/${this.problematicWorkflowId}/activate`, 'POST', { active: true });
        
        if (activateResponse.status === 200) {
          console.log('🎉 Workflow activated successfully!');
        } else {
          console.log(`⚠️  Activation response: ${activateResponse.status}`);
          console.log(`📄 Response: ${JSON.stringify(activateResponse.data, null, 2)}`);
        }
        
      } else {
        console.log(`❌ Still found ${openRouterNodes.length} OpenRouter nodes`);
      }
      
    } else {
      console.error(`❌ Failed to verify fix: ${response.status}`);
    }
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const fixer = new AntiHallucinationWorkflowFixer();
  await fixer.fixAntiHallucinationWorkflow();
  
  console.log('\n🎯 Anti-Hallucination Workflow Fix Complete!');
  console.log('===========================================');
  console.log('The workflow has been converted to use HTTP requests instead of OpenRouter nodes.');
  console.log('This should resolve the activation issues.');
  console.log('\nNext steps:');
  console.log('1. Check the N8N interface to verify the workflow is now active');
  console.log('2. Test the workflow functionality');
  console.log('3. Consider installing the OpenRouter node for future use');
}

main().catch(console.error);
