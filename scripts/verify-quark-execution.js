#!/usr/bin/env node

/**
 * 🖖 Quark Workflow Execution Verification
 * 
 * Verifies that Quark's workflow nodes are properly connected and executing
 * in the correct order of operations
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

class QuarkExecutionVerifier {
  constructor() {
    this.workflowId = 'L6K4bzSKlGC36ABL';
    this.expectedOrder = [
      'quark-directive-webhook',
      'business-context-analysis',
      'quark-memory-retrieval',
      'llm-optimization-quark',
      'quark-ai-agent-optimized',
      'quark-memory-storage-optimized',
      'observation-lounge-quark',
      'quark-response-optimized'
    ];
  }

  /**
   * Verify complete execution flow
   */
  async verifyExecutionFlow() {
    console.log('🖖 Verifying Quark Workflow Execution Flow');
    console.log('==========================================');
    
    try {
      // Step 1: Verify workflow structure
      const workflow = await this.getWorkflowStructure();
      
      // Step 2: Verify connections
      this.verifyConnections(workflow);
      
      // Step 3: Test execution with detailed monitoring
      await this.testExecutionWithMonitoring();
      
      // Step 4: Verify order of operations
      await this.verifyOrderOfOperations();
      
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
    }
  }

  /**
   * Get workflow structure
   */
  async getWorkflowStructure() {
    console.log('\n📋 Getting Workflow Structure...');
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
    
    if (response.status === 200) {
      const workflow = response.data;
      
      console.log(`✅ Workflow: ${workflow.name}`);
      console.log(`✅ Active: ${workflow.active}`);
      console.log(`✅ Nodes: ${workflow.nodes.length}`);
      console.log(`✅ Connections: ${Object.keys(workflow.connections).length}`);
      
      return workflow;
    } else {
      throw new Error(`Failed to fetch workflow: ${response.status}`);
    }
  }

  /**
   * Verify workflow connections
   */
  verifyConnections(workflow) {
    console.log('\n🔗 Verifying Connections...');
    
    const expectedConnections = {
      'quark-directive-webhook': ['business-context-analysis', 'quark-memory-retrieval'],
      'business-context-analysis': ['llm-optimization-quark'],
      'llm-optimization-quark': ['quark-ai-agent-optimized'],
      'quark-ai-agent-optimized': ['quark-memory-storage-optimized', 'observation-lounge-quark'],
      'quark-memory-storage-optimized': ['quark-response-optimized'],
      'observation-lounge-quark': ['quark-response-optimized']
    };
    
    let allValid = true;
    
    for (const [source, expectedTargets] of Object.entries(expectedConnections)) {
      if (workflow.connections[source]) {
        const actualTargets = workflow.connections[source].main[0].map(conn => conn.node);
        const missing = expectedTargets.filter(target => !actualTargets.includes(target));
        
        if (missing.length === 0) {
          console.log(`✅ ${source} → ${expectedTargets.join(', ')}`);
        } else {
          console.log(`❌ ${source} missing: ${missing.join(', ')}`);
          allValid = false;
        }
      } else {
        console.log(`❌ ${source} has no connections`);
        allValid = false;
      }
    }
    
    if (allValid) {
      console.log('✅ All connections are properly configured');
      return true;
    } else {
      console.log('❌ Some connections are missing');
      return false;
    }
  }

  /**
   * Test execution with detailed monitoring
   */
  async testExecutionWithMonitoring() {
    console.log('\n🧪 Testing Execution with Monitoring...');
    
    const testPayload = {
      prompt: "Quark, analyze the profit potential of establishing a Ferengi trading post on Bajor",
      context: "Business analysis for profit maximization",
      priority: "high",
      timestamp: new Date().toISOString()
    };
    
    console.log('📤 Sending test payload:', JSON.stringify(testPayload, null, 2));
    
    try {
      // Send request
      const startTime = Date.now();
      const response = await makeN8NRequest('/webhook/crew-quark-optimized', 'POST', testPayload);
      const endTime = Date.now();
      
      console.log(`📊 Response Status: ${response.status}`);
      console.log(`⏱️  Response Time: ${endTime - startTime}ms`);
      console.log(`📄 Response Body: ${JSON.stringify(response.data)}`);
      
      // Wait for execution to complete
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return response;
      
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      return null;
    }
  }

  /**
   * Verify order of operations by analyzing execution
   */
  async verifyOrderOfOperations() {
    console.log('\n🔄 Verifying Order of Operations...');
    
    try {
      // Get latest execution
      const execResponse = await makeN8NRequest(`/api/v1/executions?workflowId=${this.workflowId}&limit=1`);
      
      if (execResponse.status === 200) {
        const executions = execResponse.data.data || execResponse.data;
        
        if (executions.length > 0) {
          const execution = executions[0];
          console.log(`📋 Analyzing Execution ${execution.id}`);
          console.log(`⏱️  Duration: ${execution.finished ? 
            `${new Date(execution.stoppedAt) - new Date(execution.startedAt)}ms` : 
            'Still running'}`);
          
          // Get detailed execution data
          const detailResponse = await makeN8NRequest(`/api/v1/executions/${execution.id}`);
          
          if (detailResponse.status === 200) {
            const executionData = detailResponse.data;
            
            // Check if we have detailed execution data
            if (executionData.data && executionData.data.resultData) {
              const runData = executionData.data.resultData.runData;
              
              console.log('\n📊 Node Execution Analysis:');
              
              let executedNodes = [];
              let failedNodes = [];
              
              for (const nodeId of this.expectedOrder) {
                if (runData[nodeId]) {
                  const nodeData = runData[nodeId];
                  const hasOutput = nodeData[0] && (nodeData[0].json || nodeData[0].data);
                  
                  if (hasOutput) {
                    executedNodes.push(nodeId);
                    console.log(`✅ ${nodeId}: Executed with output`);
                  } else {
                    failedNodes.push(nodeId);
                    console.log(`⚠️  ${nodeId}: Executed but no output`);
                  }
                } else {
                  failedNodes.push(nodeId);
                  console.log(`❌ ${nodeId}: Not executed`);
                }
              }
              
              console.log(`\n📈 Execution Summary:`);
              console.log(`✅ Successfully Executed: ${executedNodes.length}/${this.expectedOrder.length}`);
              console.log(`❌ Failed/Not Executed: ${failedNodes.length}/${this.expectedOrder.length}`);
              
              if (executedNodes.length > 0) {
                console.log(`\n✅ Executed Nodes: ${executedNodes.join(' → ')}`);
              }
              
              if (failedNodes.length > 0) {
                console.log(`\n❌ Failed Nodes: ${failedNodes.join(', ')}`);
                
                // Provide suggestions for failed nodes
                this.provideFailureSuggestions(failedNodes);
              }
              
            } else {
              console.log('⚠️  No detailed execution data available');
              console.log('💡 This might indicate the workflow is completing too quickly or not executing properly');
            }
            
          } else {
            console.error(`❌ Failed to get execution details: ${detailResponse.status}`);
          }
          
        } else {
          console.log('⚠️  No executions found');
        }
        
      } else {
        console.error(`❌ Failed to get executions: ${execResponse.status}`);
      }
      
    } catch (error) {
      console.error('❌ Order verification failed:', error.message);
    }
  }

  /**
   * Provide suggestions for failed nodes
   */
  provideFailureSuggestions(failedNodes) {
    console.log('\n💡 Suggestions for Failed Nodes:');
    
    for (const nodeId of failedNodes) {
      switch (nodeId) {
        case 'quark-memory-retrieval':
          console.log(`  🔹 ${nodeId}: Check Supabase credentials and URL`);
          break;
        case 'quark-ai-agent-optimized':
          console.log(`  🔹 ${nodeId}: Check OpenRouter API key and credentials`);
          break;
        case 'quark-memory-storage-optimized':
          console.log(`  🔹 ${nodeId}: Check Supabase credentials and URL`);
          break;
        case 'observation-lounge-quark':
          console.log(`  🔹 ${nodeId}: Check OpenRouter API key and credentials`);
          break;
        case 'quark-response-optimized':
          console.log(`  🔹 ${nodeId}: Check response body template and data availability`);
          break;
        default:
          console.log(`  🔹 ${nodeId}: Check node configuration and dependencies`);
      }
    }
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const verifier = new QuarkExecutionVerifier();
  await verifier.verifyExecutionFlow();
  
  console.log('\n🎯 Quark Execution Verification Complete!');
  console.log('=========================================');
  console.log('Review the results above to ensure proper order of operations.');
}

main().catch(console.error);
