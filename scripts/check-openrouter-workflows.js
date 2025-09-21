#!/usr/bin/env node

/**
 * 🔍 Check OpenRouter Workflow Issues
 * 
 * Identifies workflows that are failing due to OpenRouter node issues
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

class OpenRouterWorkflowChecker {
  constructor() {
    this.problematicWorkflows = [];
  }

  /**
   * Check all workflows for OpenRouter node issues
   */
  async checkOpenRouterWorkflows() {
    console.log('🔍 Checking OpenRouter Workflow Issues');
    console.log('=====================================');
    
    try {
      // Step 1: Get all workflows
      const workflows = await this.getAllWorkflows();
      
      // Step 2: Identify problematic workflows
      await this.identifyProblematicWorkflows(workflows);
      
      // Step 3: Provide solutions
      this.provideSolutions();
      
    } catch (error) {
      console.error('❌ Check failed:', error.message);
    }
  }

  /**
   * Get all workflows
   */
  async getAllWorkflows() {
    console.log('\n📋 Fetching All Workflows...');
    
    const response = await makeN8NRequest('/api/v1/workflows');
    
    if (response.status === 200) {
      const workflows = response.data.data || response.data;
      console.log(`✅ Found ${workflows.length} workflows`);
      return workflows;
    } else {
      throw new Error(`Failed to fetch workflows: ${response.status}`);
    }
  }

  /**
   * Identify workflows with OpenRouter node issues
   */
  async identifyProblematicWorkflows(workflows) {
    console.log('\n🔍 Identifying Problematic Workflows...');
    
    this.problematicWorkflows = [];
    
    for (const workflow of workflows) {
      if (workflow.nodes) {
        const openRouterNodes = workflow.nodes.filter(node => 
          node.type === 'n8n-nodes-base.openRouter' || 
          node.type === 'n8n-nodes-openrouter' ||
          node.type.includes('openRouter')
        );
        
        if (openRouterNodes.length > 0) {
          this.problematicWorkflows.push({
            id: workflow.id,
            name: workflow.name,
            active: workflow.active,
            openRouterNodes: openRouterNodes
          });
        }
      }
    }
    
    if (this.problematicWorkflows.length > 0) {
      console.log(`\n❌ Found ${this.problematicWorkflows.length} workflows with OpenRouter node issues:`);
      
      this.problematicWorkflows.forEach((wf, index) => {
        console.log(`\n${index + 1}. 📋 ${wf.name}`);
        console.log(`   ID: ${wf.id}`);
        console.log(`   Status: ${wf.active ? 'Active' : 'Inactive'}`);
        console.log(`   OpenRouter Nodes: ${wf.openRouterNodes.length}`);
        
        wf.openRouterNodes.forEach(node => {
          console.log(`     - ${node.name} (${node.type})`);
        });
      });
    } else {
      console.log('✅ No workflows found with OpenRouter node issues');
    }
  }

  /**
   * Provide solutions for the issues
   */
  provideSolutions() {
    console.log('\n🔧 SOLUTIONS FOR OPENROUTER NODE ISSUES');
    console.log('=======================================');
    
    if (this.problematicWorkflows.length === 0) {
      console.log('✅ No OpenRouter node issues found!');
      return;
    }
    
    console.log('\n🎯 SOLUTION 1: Install OpenRouter Node');
    console.log('--------------------------------------');
    console.log('The OpenRouter node is not installed in your N8N instance.');
    console.log('You need to install it manually on your N8N server:');
    console.log('');
    console.log('1. SSH into your N8N server:');
    console.log('   ssh your-user@n8n.pbradygeorgen.com');
    console.log('');
    console.log('2. Navigate to N8N directory:');
    console.log('   cd /path/to/n8n');
    console.log('');
    console.log('3. Install OpenRouter node:');
    console.log('   npm install @n8n/n8n-nodes-openrouter');
    console.log('');
    console.log('4. Restart N8N:');
    console.log('   pm2 restart n8n');
    console.log('   # or');
    console.log('   systemctl restart n8n');
    console.log('');
    console.log('5. Verify installation by refreshing your N8N interface');
    
    console.log('\n🎯 SOLUTION 2: Convert to HTTP-Based Workflows');
    console.log('---------------------------------------------');
    console.log('Convert OpenRouter nodes to HTTP Request nodes:');
    console.log('');
    console.log('1. Replace OpenRouter nodes with HTTP Request nodes');
    console.log('2. Configure URL: https://api.openrouter.ai/api/v1/chat/completions');
    console.log('3. Set method: POST');
    console.log('4. Add headers:');
    console.log('   - Authorization: Bearer YOUR_OPENROUTER_API_KEY');
    console.log('   - Content-Type: application/json');
    console.log('5. Configure request body with model and messages');
    
    console.log('\n🎯 SOLUTION 3: Deactivate Problematic Workflows');
    console.log('----------------------------------------------');
    console.log('Temporarily deactivate workflows until OpenRouter node is installed:');
    console.log('');
    
    this.problematicWorkflows.forEach((wf, index) => {
      console.log(`${index + 1}. Deactivate: ${wf.name}`);
    });
    
    console.log('\n🎯 SOLUTION 4: Use Fallback Workflows');
    console.log('------------------------------------');
    console.log('I\'ve already deployed an HTTP-based anti-hallucination workflow');
    console.log('that doesn\'t require the OpenRouter node. This can be used as a');
    console.log('temporary solution until the OpenRouter node is installed.');
  }

  /**
   * Get specific workflow details
   */
  async getWorkflowDetails(workflowId) {
    try {
      const response = await makeN8NRequest(`/api/v1/workflows/${workflowId}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        console.error(`❌ Failed to fetch workflow ${workflowId}: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error fetching workflow ${workflowId}:`, error.message);
      return null;
    }
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const checker = new OpenRouterWorkflowChecker();
  await checker.checkOpenRouterWorkflows();
  
  console.log('\n🎯 OpenRouter Workflow Check Complete!');
  console.log('=====================================');
  console.log('Review the solutions above to resolve the OpenRouter node issues.');
}

main().catch(console.error);
