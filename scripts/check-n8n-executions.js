#!/usr/bin/env node

/**
 * Check N8N Execution Statistics
 * Analyzes N8N workflow execution statistics to identify systemic issues
 */

const https = require('https');

class N8NExecutionAnalyzer {
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
      const fs = require('fs');
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
   * Get all executions for a specific workflow
   */
  async getWorkflowExecutions(workflowId) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: `/api/v1/executions?workflowId=${workflowId}&limit=20`,
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
            resolve(response.data || response);
          } catch (error) {
            reject(new Error(`Failed to parse executions: ${data}`));
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
   * Get all executions (recent)
   */
  async getAllExecutions() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: '/api/v1/executions?limit=50',
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
            resolve(response.data || response);
          } catch (error) {
            reject(new Error(`Failed to parse executions: ${data}`));
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
   * Get execution details
   */
  async getExecutionDetails(executionId) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: `/api/v1/executions/${executionId}`,
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
            resolve(response);
          } catch (error) {
            reject(new Error(`Failed to parse execution details: ${data}`));
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
   * Analyze execution statistics
   */
  async analyzeExecutions() {
    try {
      console.log('🔍 Analyzing N8N execution statistics...\n');
      
      // Get all recent executions
      const executions = await this.getAllExecutions();
      
      if (!executions || executions.length === 0) {
        console.log('📊 No executions found in recent history');
        return;
      }

      console.log(`📊 Found ${executions.length} recent executions\n`);

      // Analyze by workflow
      const workflowStats = {};
      const statusStats = {};

      executions.forEach(execution => {
        const workflowId = execution.workflowId;
        const status = execution.finished ? 'finished' : execution.stoppedAt ? 'stopped' : 'running';
        
        if (!workflowStats[workflowId]) {
          workflowStats[workflowId] = {
            total: 0,
            finished: 0,
            stopped: 0,
            running: 0,
            errors: 0
          };
        }
        
        workflowStats[workflowId].total++;
        workflowStats[workflowId][status]++;
        
        if (execution.status === 'error') {
          workflowStats[workflowId].errors++;
        }
        
        statusStats[status] = (statusStats[status] || 0) + 1;
      });

      console.log('📈 Execution Statistics by Status:');
      Object.entries(statusStats).forEach(([status, count]) => {
        const percentage = ((count / executions.length) * 100).toFixed(1);
        console.log(`   ${status}: ${count} (${percentage}%)`);
      });

      console.log('\n📋 Execution Statistics by Workflow:');
      Object.entries(workflowStats).forEach(([workflowId, stats]) => {
        console.log(`\n   Workflow ID: ${workflowId}`);
        console.log(`   Total Executions: ${stats.total}`);
        console.log(`   Finished: ${stats.finished}`);
        console.log(`   Stopped: ${stats.stopped}`);
        console.log(`   Running: ${stats.running}`);
        console.log(`   Errors: ${stats.errors}`);
        
        if (stats.errors > 0) {
          console.log(`   ⚠️  Error Rate: ${((stats.errors / stats.total) * 100).toFixed(1)}%`);
        }
      });

      // Check Quark workflow specifically
      const quarkWorkflowId = 'L6K4bzSKlGC36ABL';
      const quarkExecutions = await this.getWorkflowExecutions(quarkWorkflowId);
      
      if (quarkExecutions && quarkExecutions.length > 0) {
        console.log(`\n🖖 Quark Workflow (${quarkWorkflowId}) Executions:`);
        console.log(`   Total: ${quarkExecutions.length}`);
        
        const quarkStats = {
          finished: 0,
          stopped: 0,
          running: 0,
          errors: 0
        };
        
        quarkExecutions.forEach(execution => {
          const status = execution.finished ? 'finished' : execution.stoppedAt ? 'stopped' : 'running';
          quarkStats[status]++;
          
          if (execution.status === 'error') {
            quarkStats.errors++;
          }
        });
        
        console.log(`   Finished: ${quarkStats.finished}`);
        console.log(`   Stopped: ${quarkStats.stopped}`);
        console.log(`   Running: ${quarkStats.running}`);
        console.log(`   Errors: ${quarkStats.errors}`);
        
        if (quarkStats.errors > 0) {
          console.log(`   ⚠️  Error Rate: ${((quarkStats.errors / quarkExecutions.length) * 100).toFixed(1)}%`);
          
          // Get details of failed executions
          console.log('\n🔍 Analyzing failed Quark executions...');
          const failedExecutions = quarkExecutions.filter(e => e.status === 'error');
          
          for (let i = 0; i < Math.min(3, failedExecutions.length); i++) {
            const execution = failedExecutions[i];
            console.log(`\n   Failed Execution ${i + 1}:`);
            console.log(`     ID: ${execution.id}`);
            console.log(`     Started: ${execution.startedAt}`);
            console.log(`     Stopped: ${execution.stoppedAt}`);
            console.log(`     Status: ${execution.status}`);
            
            try {
              const details = await this.getExecutionDetails(execution.id);
              if (details.data && details.data.resultData && details.data.resultData.error) {
                console.log(`     Error: ${details.data.resultData.error.message}`);
                console.log(`     Node: ${details.data.resultData.error.node.name}`);
              }
            } catch (error) {
              console.log(`     Could not get error details: ${error.message}`);
            }
          }
        }
      } else {
        console.log(`\n🖖 Quark Workflow (${quarkWorkflowId}): No executions found`);
      }

      // Summary
      console.log('\n🎯 Analysis Summary:');
      if (Object.values(workflowStats).some(stats => stats.errors > 0)) {
        console.log('   ⚠️  System has execution errors - this explains the empty responses');
        console.log('   🔧 Recommended actions:');
        console.log('     1. Check N8N interface for error details');
        console.log('     2. Verify OpenRouter API credentials');
        console.log('     3. Test individual workflow nodes');
        console.log('     4. Check Supabase connection for memory storage');
      } else if (Object.values(workflowStats).some(stats => stats.stopped > 0)) {
        console.log('   ⚠️  Some workflows are stopping unexpectedly');
        console.log('   🔧 Check for timeout issues or missing connections');
      } else {
        console.log('   ✅ No obvious execution errors detected');
        console.log('   🔧 The issue might be in node configuration or data flow');
      }

    } catch (error) {
      console.error('❌ Failed to analyze executions:', error.message);
    }
  }
}

// Main execution
async function main() {
  const analyzer = new N8NExecutionAnalyzer();
  await analyzer.analyzeExecutions();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = N8NExecutionAnalyzer;
