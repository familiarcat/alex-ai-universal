#!/usr/bin/env node

/**
 * Deploy Anti-Hallucination Workflows to N8N
 * Deploys the new anti-hallucination system workflows to n8n.pbradygeorgen.com
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class AntiHallucinationWorkflowDeployer {
  constructor() {
    // Load credentials from ~/.zshrc first
    this.loadZshrcEnv();
    
    this.n8nBaseUrl = process.env.N8N_API_URL || 'https://n8n.pbradygeorgen.com/api/v1';
    this.apiKey = process.env.N8N_API_KEY;
    this.webhookBaseUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.pbradygeorgen.com/webhook';
    
    if (!this.apiKey) {
      console.error('❌ N8N_API_KEY not found in ~/.zshrc or environment variables');
      console.log('💡 Make sure you have the following in your ~/.zshrc:');
      console.log('   export N8N_API_KEY="your-actual-api-key"');
      process.exit(1);
    }
  }

  /**
   * Load environment variables from ~/.zshrc
   */
  loadZshrcEnv() {
    try {
      const zshrcContent = fs.readFileSync(process.env.HOME + '/.zshrc', 'utf8');
      const lines = zshrcContent.split('\n');
      
      lines.forEach(line => {
        if (line.includes('export N8N_API_URL=')) {
          process.env.N8N_API_URL = line.split('=')[1].replace(/['"]/g, '');
        }
        if (line.includes('export N8N_API_KEY=')) {
          process.env.N8N_API_KEY = line.split('=')[1].replace(/['"]/g, '');
        }
        if (line.includes('export N8N_WEBHOOK_URL=')) {
          process.env.N8N_WEBHOOK_URL = line.split('=')[1].replace(/['"]/g, '');
        }
      });
      
      console.log('✅ Environment variables loaded from ~/.zshrc');
    } catch (error) {
      console.error('❌ Failed to load ~/.zshrc:', error.message);
      console.log('💡 Continuing with environment variables...');
    }
  }

  /**
   * Deploy all anti-hallucination workflows
   */
  async deployAllWorkflows() {
    console.log('🚀 Deploying Anti-Hallucination Workflows to N8N...');
    console.log(`📍 Target: ${this.n8nBaseUrl}`);
    
    try {
      // Check N8N connection
      await this.validateConnection();
      
      // Deploy main anti-hallucination workflow
      await this.deployWorkflow('anti-hallucination-workflow-simple.json', 'Anti-Hallucination Crew Workflow');
      
      // Deploy monitoring workflow
      await this.deployWorkflow('hallucination-monitoring-workflow.json', 'Hallucination Monitoring Dashboard');
      
      console.log('✅ All anti-hallucination workflows deployed successfully!');
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Deploy individual workflow
   */
  async deployWorkflow(filename, workflowName) {
    try {
      console.log(`📦 Deploying: ${workflowName}`);
      
      // Load workflow configuration
      const workflowPath = path.join(__dirname, '../packages/core/src/anti-hallucination/n8n-workflows', filename);
      
      if (!fs.existsSync(workflowPath)) {
        throw new Error(`Workflow file not found: ${workflowPath}`);
      }
      
      const workflowConfig = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
      
      // Update webhook URLs to use the correct base URL
      this.updateWebhookUrls(workflowConfig);
      
      // Deploy to N8N
      const workflowId = await this.createWorkflow(workflowConfig);
      
      // Activate the workflow
      await this.activateWorkflow(workflowId);
      
      console.log(`✅ ${workflowName} deployed and activated (ID: ${workflowId})`);
      
      return workflowId;
      
    } catch (error) {
      console.error(`❌ Failed to deploy ${workflowName}:`, error.message);
      throw error;
    }
  }

  /**
   * Update webhook URLs in workflow configuration
   */
  updateWebhookUrls(workflowConfig) {
    workflowConfig.nodes.forEach(node => {
      if (node.type === 'n8n-nodes-base.webhook') {
        const webhookPath = node.parameters.path;
        if (webhookPath) {
          node.parameters.webhookUrl = `${this.webhookBaseUrl}/${webhookPath}`;
        }
      }
    });
  }

  /**
   * Create workflow in N8N
   */
  async createWorkflow(workflowConfig) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(workflowConfig);
      
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: '/api/v1/workflows',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'X-N8N-API-KEY': this.apiKey
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 201 || res.statusCode === 200) {
              resolve(response.id);
            } else {
              reject(new Error(`Failed to create workflow: ${res.statusCode} - ${data}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Activate workflow in N8N
   */
  async activateWorkflow(workflowId) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({ active: true });
      
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: `/api/v1/workflows/${workflowId}/activate`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'X-N8N-API-KEY': this.apiKey
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 204) {
            resolve();
          } else {
            reject(new Error(`Failed to activate workflow: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Validate N8N connection
   */
  async validateConnection() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: '/api/v1/workflows',
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': this.apiKey
        }
      };

      const req = https.request(options, (res) => {
        if (res.statusCode === 200) {
          console.log('✅ N8N connection validated');
          resolve();
        } else {
          reject(new Error(`N8N connection failed: ${res.statusCode}`));
        }
      });

      req.on('error', (error) => {
        reject(new Error(`N8N connection failed: ${error.message}`));
      });

      req.end();
    });
  }

  /**
   * List existing workflows
   */
  async listWorkflows() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: '/api/v1/workflows',
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': this.apiKey
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            // Handle different response formats
            const workflows = Array.isArray(response) ? response : 
                             response.data ? response.data : 
                             response.workflows ? response.workflows : [];
            resolve(workflows);
          } catch (error) {
            reject(new Error(`Failed to parse workflows: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  /**
   * Check if anti-hallucination workflows exist
   */
  async checkExistingWorkflows() {
    try {
      console.log('🔍 Checking for existing anti-hallucination workflows...');
      
      const workflows = await this.listWorkflows();
      const antiHallucinationWorkflows = workflows.filter(w => 
        w.name.includes('Anti-Hallucination') || w.name.includes('Hallucination')
      );
      
      if (antiHallucinationWorkflows.length > 0) {
        console.log('📋 Existing anti-hallucination workflows found:');
        antiHallucinationWorkflows.forEach(workflow => {
          console.log(`  - ${workflow.name} (ID: ${workflow.id}, Active: ${workflow.active})`);
        });
      } else {
        console.log('📝 No existing anti-hallucination workflows found');
      }
      
      return antiHallucinationWorkflows;
      
    } catch (error) {
      console.error('❌ Failed to check existing workflows:', error.message);
      return [];
    }
  }

  /**
   * Update existing workflow
   */
  async updateWorkflow(workflowId, workflowConfig) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(workflowConfig);
      
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: `/api/v1/workflows/${workflowId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'X-N8N-API-KEY': this.apiKey
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200) {
              resolve(response.id);
            } else {
              reject(new Error(`Failed to update workflow: ${res.statusCode} - ${data}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }
}

// Main execution
async function main() {
  const deployer = new AntiHallucinationWorkflowDeployer();
  
  try {
    // Check existing workflows
    await deployer.checkExistingWorkflows();
    
    // Deploy new workflows
    await deployer.deployAllWorkflows();
    
    console.log('\n🎉 Anti-Hallucination Workflow Deployment Complete!');
    console.log('🛡️ Your N8N instance now has the latest anti-hallucination system workflows');
    console.log('📊 Monitor your workflows at: https://n8n.pbradygeorgen.com');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = AntiHallucinationWorkflowDeployer;
