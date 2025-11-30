#!/usr/bin/env node

/**
 * 🖖 Quark Data Flow Test
 * 
 * Tests the actual data flow through Quark's workflow to identify
 * where the data might be getting lost
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

class QuarkDataFlowTester {
  constructor() {
    this.workflowId = 'L6K4bzSKlGC36ABL';
    this.webhookUrl = 'https://n8n.pbradygeorgen.com/webhook/crew-quark-optimized';
  }

  /**
   * Test data flow through the workflow
   */
  async testDataFlow() {
    console.log('🖖 Testing Quark Data Flow');
    console.log('=========================');
    
    try {
      // Step 1: Send a test request and capture execution
      const executionId = await this.sendTestRequest();
      
      if (executionId) {
        // Step 2: Analyze the execution data
        await this.analyzeExecutionData(executionId);
      }
      
    } catch (error) {
      console.error('❌ Data flow test failed:', error.message);
    }
  }

  /**
   * Send a test request and get execution ID
   */
  async sendTestRequest() {
    console.log('\n📤 Sending Test Request...');
    
    const testPayload = {
      prompt: "Quark, what's the profit potential of opening a new bar on Deep Space Nine?",
      context: "Business analysis test",
      timestamp: new Date().toISOString()
    };
    
    try {
      const response = await makeN8NRequest('/webhook/crew-quark-optimized', 'POST', testPayload);
      
      console.log(`📊 Response Status: ${response.status}`);
      console.log(`📄 Response Body: ${JSON.stringify(response.data)}`);
      
      // Wait a moment for execution to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get the latest execution
      const execResponse = await makeN8NRequest(`/api/v1/executions?workflowId=${this.workflowId}&limit=1`);
      
      if (execResponse.status === 200) {
        const executions = execResponse.data.data || execResponse.data;
        if (executions.length > 0) {
          const executionId = executions[0].id;
          console.log(`📋 Latest Execution ID: ${executionId}`);
          return executionId;
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Test request failed:', error.message);
      return null;
    }
  }

  /**
   * Analyze execution data to see where data might be lost
   */
  async analyzeExecutionData(executionId) {
    console.log(`\n🔍 Analyzing Execution ${executionId}...`);
    
    try {
      const response = await makeN8NRequest(`/api/v1/executions/${executionId}`);
      
      if (response.status === 200) {
        const execution = response.data;
        
        console.log(`📊 Execution Status: ${execution.finished ? 'Completed' : 'Running'}`);
        console.log(`⏱️  Duration: ${execution.finished ? 
          `${new Date(execution.stoppedAt) - new Date(execution.startedAt)}ms` : 
          'Still running'}`);
        
        if (execution.data && execution.data.resultData) {
          const runData = execution.data.resultData.runData;
          const executionData = execution.data.resultData.lastNodeRunData;
          
          console.log('\n📋 Node Execution Results:');
          
          // Check each node's output
          const nodes = [
            'quark-directive-webhook',
            'business-context-analysis', 
            'quark-memory-retrieval',
            'llm-optimization-quark',
            'quark-ai-agent-optimized',
            'quark-memory-storage-optimized',
            'observation-lounge-quark',
            'quark-response-optimized'
          ];
          
          for (const nodeId of nodes) {
            if (runData[nodeId]) {
              const nodeData = runData[nodeId];
              const output = nodeData[0]?.json || nodeData[0]?.data;
              
              console.log(`\n🔹 ${nodeId}:`);
              if (output) {
                console.log(`  ✅ Has output data`);
                console.log(`  📄 Output keys: ${Object.keys(output).join(', ')}`);
                
                // Show relevant data for key nodes
                if (nodeId === 'business-context-analysis') {
                  console.log(`  🧠 Business Context: ${JSON.stringify(output.businessContext || output, null, 2)}`);
                } else if (nodeId === 'quark-ai-agent-optimized') {
                  console.log(`  🤖 AI Response: ${JSON.stringify(output.choices || output, null, 2)}`);
                } else if (nodeId === 'quark-response-optimized') {
                  console.log(`  📤 Final Response: ${JSON.stringify(output, null, 2)}`);
                }
              } else {
                console.log(`  ❌ No output data`);
              }
            } else {
              console.log(`\n🔹 ${nodeId}: ❌ Not executed`);
            }
          }
          
          // Check for errors
          if (execution.data.resultData.error) {
            console.log('\n❌ Execution Errors:');
            console.log(JSON.stringify(execution.data.resultData.error, null, 2));
          }
          
        } else {
          console.log('⚠️  No execution data available');
        }
        
      } else {
        console.error(`❌ Failed to fetch execution details: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Execution analysis failed:', error.message);
    }
  }

  /**
   * Test individual node configurations
   */
  async testNodeConfigurations() {
    console.log('\n🔧 Testing Node Configurations...');
    
    try {
      const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
      
      if (response.status === 200) {
        const workflow = response.data;
        
        console.log('\n📋 Node Configuration Analysis:');
        
        for (const node of workflow.nodes) {
          console.log(`\n🔹 ${node.name} (${node.id}):`);
          console.log(`  Type: ${node.type}`);
          
          // Check for potential issues in parameters
          if (node.parameters) {
            if (node.type === 'n8n-nodes-base.function') {
              console.log(`  Function: ${node.parameters.functionCode ? 'Has code' : 'No code'}`);
            } else if (node.type === 'n8n-nodes-base.httpRequest') {
              console.log(`  URL: ${node.parameters.url || 'No URL'}`);
              console.log(`  Auth: ${node.parameters.authentication || 'No auth'}`);
            } else if (node.type === 'n8n-nodes-base.respondToWebhook') {
              console.log(`  Response Body: ${node.parameters.responseBody || 'No response body'}`);
            }
          }
        }
        
      }
      
    } catch (error) {
      console.error('❌ Node configuration test failed:', error.message);
    }
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const tester = new QuarkDataFlowTester();
  await tester.testDataFlow();
  await tester.testNodeConfigurations();
  
  console.log('\n🎯 Data Flow Test Complete!');
  console.log('===========================');
  console.log('Review the results above to identify where data might be lost in the workflow.');
}

main().catch(console.error);
