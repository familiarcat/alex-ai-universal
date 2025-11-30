#!/usr/bin/env node

/**
 * Debug Quark Workflow
 * Debug the Quark workflow to identify connection issues
 */

const https = require('https');

class QuarkWorkflowDebugger {
  constructor() {
    this.loadZshrcEnv();
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
   * Check workflow status
   */
  async checkWorkflowStatus() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: '/api/v1/workflows/L6K4bzSKlGC36ABL',
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': process.env.N8N_API_KEY
        }
      };

      console.log('🔍 Checking Quark workflow status...');

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const workflow = JSON.parse(data);
            
            console.log(`📋 Workflow Name: ${workflow.name}`);
            console.log(`🔄 Active Status: ${workflow.active}`);
            console.log(`🆔 Workflow ID: ${workflow.id}`);
            console.log(`📊 Node Count: ${workflow.nodes ? workflow.nodes.length : 'Unknown'}`);
            console.log(`🔗 Connection Count: ${workflow.connections ? Object.keys(workflow.connections).length : 'Unknown'}`);
            
            if (workflow.nodes) {
              console.log('\n📋 Nodes:');
              workflow.nodes.forEach((node, index) => {
                console.log(`   ${index + 1}. ${node.name} (${node.type}) - ID: ${node.id}`);
              });
            }
            
            if (workflow.connections) {
              console.log('\n🔗 Connections:');
              Object.entries(workflow.connections).forEach(([sourceNode, connections]) => {
                if (connections.main && connections.main[0]) {
                  connections.main[0].forEach(connection => {
                    console.log(`   ${sourceNode} → ${connection.node}`);
                  });
                }
              });
            }
            
            resolve(workflow);
          } catch (error) {
            console.error(`❌ Failed to parse workflow data: ${data}`);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Request failed:', error.message);
        reject(error);
      });

      req.end();
    });
  }

  /**
   * Test webhook endpoint
   */
  async testWebhookEndpoint() {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        prompt: "Test prompt for debugging",
        timestamp: new Date().toISOString(),
        debug: true
      });
      
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: '/webhook/crew-quark-optimized',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      console.log('\n🧪 Testing webhook endpoint...');
      console.log(`📍 URL: https://n8n.pbradygeorgen.com/webhook/crew-quark-optimized`);

      const req = https.request(options, (res) => {
        let data = '';
        
        console.log(`📊 Response Status: ${res.statusCode}`);
        console.log(`📋 Response Headers:`, res.headers);
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`📄 Response Body: "${data}"`);
          console.log(`📏 Response Length: ${data.length} characters`);
          
          if (data.length === 0) {
            console.log('⚠️  Empty response - this might indicate a workflow execution issue');
          } else {
            try {
              const jsonResponse = JSON.parse(data);
              console.log('✅ Valid JSON response received');
              resolve(jsonResponse);
            } catch (error) {
              console.log('⚠️  Response is not valid JSON');
              resolve(data);
            }
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Request failed:', error.message);
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Run complete debug
   */
  async runDebug() {
    try {
      console.log('🔧 Starting Quark Workflow Debug...\n');
      
      // Check workflow status
      await this.checkWorkflowStatus();
      
      // Test webhook endpoint
      await this.testWebhookEndpoint();
      
      console.log('\n🎯 Debug Summary:');
      console.log('   • Workflow status has been checked');
      console.log('   • Webhook endpoint has been tested');
      console.log('   • Review the output above for any issues');
      
    } catch (error) {
      console.error('❌ Debug failed:', error.message);
    }
  }
}

// Main execution
async function main() {
  const workflowDebugger = new QuarkWorkflowDebugger();
  await workflowDebugger.runDebug();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = QuarkWorkflowDebugger;
