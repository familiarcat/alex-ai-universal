#!/usr/bin/env node

/**
 * 🖖 Quark Workflow Execution Flow Test
 * 
 * Tests the complete execution flow of Quark's workflow to verify
 * proper order of operations and node connections
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

class QuarkExecutionFlowTester {
  constructor() {
    this.workflowId = 'L6K4bzSKlGC36ABL';
    this.webhookUrl = 'https://n8n.pbradygeorgen.com/webhook/crew-quark-optimized';
  }

  /**
   * Test the complete execution flow
   */
  async testExecutionFlow() {
    console.log('🖖 Testing Quark Workflow Execution Flow');
    console.log('========================================');
    
    try {
      // Step 1: Verify workflow structure
      await this.verifyWorkflowStructure();
      
      // Step 2: Test webhook endpoint
      await this.testWebhookEndpoint();
      
      // Step 3: Check execution history
      await this.checkExecutionHistory();
      
      // Step 4: Test with different payloads
      await this.testWithPayloads();
      
      // Step 5: Verify node execution order
      await this.verifyExecutionOrder();
      
    } catch (error) {
      console.error('❌ Execution flow test failed:', error.message);
    }
  }

  /**
   * Verify workflow structure and connections
   */
  async verifyWorkflowStructure() {
    console.log('\n📋 Step 1: Verifying Workflow Structure...');
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
    
    if (response.status === 200) {
      const workflow = response.data;
      
      console.log(`✅ Workflow Name: ${workflow.name}`);
      console.log(`✅ Active Status: ${workflow.active}`);
      console.log(`✅ Node Count: ${workflow.nodes.length}`);
      console.log(`✅ Connection Count: ${Object.keys(workflow.connections).length}`);
      
      // Verify expected nodes
      const expectedNodes = [
        'quark-directive-webhook',
        'business-context-analysis',
        'quark-memory-retrieval',
        'llm-optimization-quark',
        'quark-ai-agent-optimized',
        'quark-memory-storage-optimized',
        'observation-lounge-quark',
        'quark-response-optimized'
      ];
      
      const actualNodes = workflow.nodes.map(n => n.id);
      const missingNodes = expectedNodes.filter(id => !actualNodes.includes(id));
      
      if (missingNodes.length === 0) {
        console.log('✅ All expected nodes are present');
      } else {
        console.log(`❌ Missing nodes: ${missingNodes.join(', ')}`);
      }
      
      // Verify connections
      this.verifyConnections(workflow.connections);
      
    } else {
      console.error(`❌ Failed to fetch workflow: ${response.status}`);
    }
  }

  /**
   * Verify workflow connections
   */
  verifyConnections(connections) {
    console.log('\n🔗 Verifying Connections...');
    
    const expectedConnections = {
      'quark-directive-webhook': ['business-context-analysis', 'quark-memory-retrieval'],
      'business-context-analysis': ['llm-optimization-quark'],
      'llm-optimization-quark': ['quark-ai-agent-optimized'],
      'quark-ai-agent-optimized': ['quark-memory-storage-optimized', 'observation-lounge-quark'],
      'quark-memory-storage-optimized': ['quark-response-optimized'],
      'observation-lounge-quark': ['quark-response-optimized']
    };
    
    let allConnectionsValid = true;
    
    for (const [source, targets] of Object.entries(expectedConnections)) {
      if (connections[source]) {
        const actualTargets = connections[source].main[0].map(conn => conn.node);
        const missingTargets = targets.filter(target => !actualTargets.includes(target));
        
        if (missingTargets.length === 0) {
          console.log(`✅ ${source} → ${targets.join(', ')}`);
        } else {
          console.log(`❌ ${source} missing connections to: ${missingTargets.join(', ')}`);
          allConnectionsValid = false;
        }
      } else {
        console.log(`❌ ${source} has no connections`);
        allConnectionsValid = false;
      }
    }
    
    if (allConnectionsValid) {
      console.log('✅ All connections are properly configured');
    } else {
      console.log('❌ Some connections are missing or incorrect');
    }
  }

  /**
   * Test webhook endpoint
   */
  async testWebhookEndpoint() {
    console.log('\n🧪 Step 2: Testing Webhook Endpoint...');
    
    const testPayload = {
      prompt: "Quark, analyze the profit potential of this business opportunity: A new Ferengi trade route through the Gamma Quadrant",
      context: "Business analysis request",
      timestamp: new Date().toISOString()
    };
    
    try {
      const response = await makeN8NRequest('/webhook/crew-quark-optimized', 'POST', testPayload);
      
      console.log(`📊 Response Status: ${response.status}`);
      console.log(`📋 Response Headers:`, response.headers);
      
      if (response.data) {
        console.log(`📄 Response Body: ${JSON.stringify(response.data, null, 2)}`);
        console.log(`📏 Response Length: ${JSON.stringify(response.data).length} characters`);
      } else {
        console.log('📄 Response Body: (empty)');
        console.log('⚠️  Empty response - this might indicate a workflow execution issue');
      }
      
    } catch (error) {
      console.error('❌ Webhook test failed:', error.message);
    }
  }

  /**
   * Check execution history
   */
  async checkExecutionHistory() {
    console.log('\n📊 Step 3: Checking Execution History...');
    
    try {
      const response = await makeN8NRequest(`/api/v1/executions?workflowId=${this.workflowId}&limit=5`);
      
      if (response.status === 200) {
        const executions = response.data.data || response.data;
        
        console.log(`📈 Found ${executions.length} recent executions`);
        
        executions.forEach((execution, index) => {
          const status = execution.finished ? (execution.stoppedAt ? '✅ Completed' : '❌ Failed') : '🔄 Running';
          const duration = execution.finished ? 
            `${new Date(execution.stoppedAt) - new Date(execution.startedAt)}ms` : 
            'N/A';
          
          console.log(`  ${index + 1}. ${status} - ${execution.mode} - ${duration}`);
        });
        
        if (executions.length > 0) {
          const latestExecution = executions[0];
          console.log(`\n📋 Latest Execution Details:`);
          console.log(`  ID: ${latestExecution.id}`);
          console.log(`  Started: ${latestExecution.startedAt}`);
          console.log(`  Finished: ${latestExecution.finished ? latestExecution.stoppedAt : 'Still running'}`);
          console.log(`  Mode: ${latestExecution.mode}`);
          console.log(`  Status: ${latestExecution.finished ? 'Completed' : 'Running'}`);
        }
        
      } else {
        console.error(`❌ Failed to fetch execution history: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Execution history check failed:', error.message);
    }
  }

  /**
   * Test with different payloads
   */
  async testWithPayloads() {
    console.log('\n🧪 Step 4: Testing with Different Payloads...');
    
    const testPayloads = [
      {
        name: 'Simple Prompt',
        payload: { prompt: 'Hello Quark, how are you?' }
      },
      {
        name: 'Business Analysis',
        payload: { 
          prompt: 'Analyze the profit potential of this business opportunity',
          context: 'Business analysis',
          priority: 'high'
        }
      },
      {
        name: 'Memory Query',
        payload: { 
          prompt: 'What do you remember about our previous business discussions?',
          queryType: 'memory'
        }
      }
    ];
    
    for (const test of testPayloads) {
      console.log(`\n🔬 Testing: ${test.name}`);
      
      try {
        const response = await makeN8NRequest('/webhook/crew-quark-optimized', 'POST', test.payload);
        
        console.log(`  Status: ${response.status}`);
        
        if (response.data && Object.keys(response.data).length > 0) {
          console.log(`  ✅ Response received: ${JSON.stringify(response.data).length} characters`);
        } else {
          console.log(`  ⚠️  Empty response`);
        }
        
        // Add delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`  ❌ Test failed: ${error.message}`);
      }
    }
  }

  /**
   * Verify execution order by checking node execution
   */
  async verifyExecutionOrder() {
    console.log('\n🔄 Step 5: Verifying Execution Order...');
    
    try {
      // Get the latest execution to analyze node execution order
      const response = await makeN8NRequest(`/api/v1/executions?workflowId=${this.workflowId}&limit=1`);
      
      if (response.status === 200) {
        const executions = response.data.data || response.data;
        
        if (executions.length > 0) {
          const execution = executions[0];
          const executionId = execution.id;
          
          // Get detailed execution data
          const detailResponse = await makeN8NRequest(`/api/v1/executions/${executionId}`);
          
          if (detailResponse.status === 200) {
            const executionData = detailResponse.data;
            
            console.log(`📊 Execution ID: ${executionId}`);
            console.log(`📈 Execution Status: ${executionData.finished ? 'Completed' : 'Running'}`);
            
            if (executionData.data && executionData.data.resultData) {
              const nodeResults = executionData.data.resultData.runData;
              
              console.log('\n🔗 Node Execution Order:');
              
              const expectedOrder = [
                'quark-directive-webhook',
                'business-context-analysis',
                'quark-memory-retrieval',
                'llm-optimization-quark',
                'quark-ai-agent-optimized',
                'quark-memory-storage-optimized',
                'observation-lounge-quark',
                'quark-response-optimized'
              ];
              
              for (const nodeId of expectedOrder) {
                if (nodeResults[nodeId]) {
                  const nodeData = nodeResults[nodeId];
                  const status = nodeData[0] ? '✅ Executed' : '❌ Not executed';
                  console.log(`  ${nodeId}: ${status}`);
                } else {
                  console.log(`  ${nodeId}: ❌ Not found in execution`);
                }
              }
            } else {
              console.log('⚠️  No execution data available');
            }
          }
        } else {
          console.log('⚠️  No executions found');
        }
      }
      
    } catch (error) {
      console.error('❌ Execution order verification failed:', error.message);
    }
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const tester = new QuarkExecutionFlowTester();
  await tester.testExecutionFlow();
  
  console.log('\n🎯 Execution Flow Test Complete!');
  console.log('================================');
  console.log('Review the results above to verify Quark\'s workflow execution order.');
}

main().catch(console.error);
