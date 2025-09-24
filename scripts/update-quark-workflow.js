#!/usr/bin/env node

/**
 * Update Quark Workflow with OpenRouter Optimization
 * Updates the existing Quark workflow to use optimized LLM selection
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class QuarkWorkflowUpdater {
  constructor() {
    this.loadZshrcEnv();
    this.n8nBaseUrl = process.env.N8N_API_URL || 'https://n8n.pbradygeorgen.com/api/v1';
    this.apiKey = process.env.N8N_API_KEY;
    
    if (!this.apiKey) {
      console.error('❌ N8N_API_KEY not found in ~/.zshrc or environment variables');
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
      });
      
      console.log('✅ Environment variables loaded from ~/.zshrc');
    } catch (error) {
      console.error('❌ Failed to load ~/.zshrc:', error.message);
    }
  }

  /**
   * Find existing Quark workflow
   */
  async findQuarkWorkflow() {
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
            const workflows = Array.isArray(response) ? response : response.data || response.workflows || [];
            
            const quarkWorkflow = workflows.find(w => 
              w.name.includes('Quark') || 
              w.name.includes('quark') ||
              w.id === 'L6K4bzSKlGC36ABL'
            );
            
            resolve(quarkWorkflow);
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
              resolve(response);
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

  /**
   * Activate workflow
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
        if (res.statusCode === 200 || res.statusCode === 204) {
          resolve();
        } else {
          reject(new Error(`Failed to activate workflow: ${res.statusCode}`));
        }
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Main update process
   */
  async updateQuarkWorkflow() {
    try {
      console.log('🔍 Looking for existing Quark workflow...');
      
      const existingWorkflow = await this.findQuarkWorkflow();
      
      if (!existingWorkflow) {
        console.log('❌ Quark workflow not found');
        console.log('💡 Creating new optimized Quark workflow...');
        await this.createNewWorkflow();
        return;
      }
      
      console.log(`✅ Found Quark workflow: ${existingWorkflow.name} (ID: ${existingWorkflow.id})`);
      
      // Load optimized workflow configuration
      const workflowPath = path.join(__dirname, '../packages/core/src/anti-hallucination/n8n-workflows/optimized-quark-workflow.json');
      
      if (!fs.existsSync(workflowPath)) {
        throw new Error(`Optimized workflow file not found: ${workflowPath}`);
      }
      
      const optimizedConfig = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
      
      // Remove read-only fields
      delete optimizedConfig.id;
      delete optimizedConfig.active;
      delete optimizedConfig.versionId;
      delete optimizedConfig.meta;
      delete optimizedConfig.tags;
      
      // Preserve the existing webhook ID
      if (existingWorkflow.nodes && existingWorkflow.nodes[0] && existingWorkflow.nodes[0].webhookId) {
        optimizedConfig.nodes[0].webhookId = existingWorkflow.nodes[0].webhookId;
      }
      
      console.log('🔄 Updating Quark workflow with OpenRouter optimization...');
      
      await this.updateWorkflow(existingWorkflow.id, optimizedConfig);
      
      console.log('✅ Quark workflow updated successfully!');
      
      // Activate the workflow
      await this.activateWorkflow(existingWorkflow.id);
      
      console.log('✅ Quark workflow activated successfully!');
      
      console.log('\n🎉 Quark Workflow Optimization Complete!');
      console.log('🖖 Quark now has:');
      console.log('  • Dynamic LLM optimization based on business context');
      console.log('  • OpenRouter integration for optimal model selection');
      console.log('  • Business-focused prompt analysis');
      console.log('  • Enhanced memory storage with context metadata');
      console.log('  • Observation Lounge integration');
      console.log('  • Complete query unification from Alex AI to N8N');
      
    } catch (error) {
      console.error('❌ Failed to update Quark workflow:', error.message);
      process.exit(1);
    }
  }

  /**
   * Create new workflow if not found
   */
  async createNewWorkflow() {
    return new Promise((resolve, reject) => {
      const workflowPath = path.join(__dirname, '../packages/core/src/anti-hallucination/n8n-workflows/optimized-quark-workflow.json');
      const workflowConfig = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
      
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
              console.log(`✅ New Quark workflow created (ID: ${response.id})`);
              resolve(response);
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
}

// Main execution
async function main() {
  const updater = new QuarkWorkflowUpdater();
  await updater.updateQuarkWorkflow();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = QuarkWorkflowUpdater;
