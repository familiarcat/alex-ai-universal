#!/usr/bin/env node

/**
 * N8N Simple Mock Execution Fix
 * Creates test workflows with mock data for N8N UI testing
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class N8NSimpleMockExecutionFix {
  constructor() {
    this.n8nApiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTA3ZGJlZi0yZDJmLTQ2YjUtYWQ3ZC0yYjIzZTk2ZWE1NjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU2MDk3MjIyfQ.wFPf3jA0X2zdNkaPqoPzTEAE-MsS-XcM6Gk20KYr4Dw';
    this.n8nBaseUrl = 'https://n8n.pbradygeorgen.com';
    this.supabaseUrl = 'https://rpkkkbufdwxmjaerbhbn.supabase.co';
    this.openRouterUrl = 'https://api.openrouter.ai/api/v1/chat/completions';
    
    this.headers = {
      'X-N8N-API-KEY': this.n8nApiKey,
      'Content-Type': 'application/json'
    };
  }

  async log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
  }

  generateMockDataForCrewMember(crewMember) {
    return {
      prompt: `Test prompt for ${crewMember} - This is mock data for testing the workflow in N8N UI. Please provide your perspective on optimizing team communication and coordination in a Star Trek context.`,
      message: `Mock message for ${crewMember} testing - analyze the current situation and provide recommendations.`,
      timestamp: new Date().toISOString(),
      testMode: true,
      source: 'n8n-ui-manual-testing',
      crewMember: crewMember,
      context: {
        domain: 'testing',
        complexity: 'medium',
        type: 'analytical',
        urgency: 'normal'
      },
      body: {
        prompt: `Test prompt for ${crewMember} - This is mock data for testing the workflow in N8N UI. Please provide your perspective on optimizing team communication and coordination in a Star Trek context.`,
        message: `Mock message for ${crewMember} testing - analyze the current situation and provide recommendations.`
      }
    };
  }

  createTestWorkflowForCrewMember(crewMember) {
    const crewMemberLower = crewMember.toLowerCase().replace(/\s+/g, '-');
    const timestamp = Date.now();
    
    return {
      name: `TEST - ${crewMember} - Mock Execution - OpenRouter - Production`,
      active: true,
      nodes: [
        {
          id: `manual-trigger-${timestamp}`,
          name: 'Manual Trigger (Mock Data)',
          type: 'n8n-nodes-base.manualTrigger',
          typeVersion: 1,
          position: [240, 304],
          parameters: {
            mockData: [this.generateMockDataForCrewMember(crewMember)]
          }
        },
        {
          id: `memory-retrieval-${timestamp}`,
          name: `${crewMember} Memory Retrieval (Test)`,
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [464, 112],
          parameters: {
            authentication: 'genericCredentialType',
            url: `${this.supabaseUrl}/rest/v1/crew_memories?crew_member=eq.${crewMember}&limit=5`,
            requestMethod: 'GET',
            options: {}
          }
        },
        {
          id: `llm-selection-${timestamp}`,
          name: 'LLM Selection Agent (Test)',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [464, 304],
          parameters: {
            functionCode: `// Mock LLM selection for testing
const input = $input.first().json;
const crewMember = "${crewMember}";

// Simple LLM selection based on crew member
const llmMapping = {
  "Captain Jean-Luc Picard": "anthropic/claude-3-opus",
  "Commander Data": "openai/gpt-4-turbo", 
  "Commander William Riker": "anthropic/claude-3-sonnet",
  "Dr. Beverly Crusher": "anthropic/claude-3-sonnet",
  "Counselor Deanna Troi": "anthropic/claude-3-sonnet",
  "Lieutenant Uhura": "anthropic/claude-3-haiku",
  "Lieutenant Worf": "anthropic/claude-3-sonnet",
  "Lieutenant Commander Geordi La Forge": "openai/gpt-4-turbo"
};

const optimalLLM = llmMapping[crewMember] || "anthropic/claude-3-sonnet";

return {
  crewMember,
  optimalLLM,
  confidence: 0.95,
  reasoning: \`Selected \${optimalLLM} for \${crewMember} based on expertise mapping\`,
  originalPrompt: input.prompt || input.body?.prompt || "Test prompt",
  timestamp: new Date().toISOString(),
  testMode: true
};`
          }
        },
        {
          id: `ai-agent-${timestamp}`,
          name: `${crewMember} AI Agent (Test)`,
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [688, 304],
          parameters: {
            authentication: 'genericCredentialType',
            url: this.openRouterUrl,
            requestMethod: 'POST',
            sendHeaders: true,
            headerParameters: {
              parameters: [
                {
                  name: "Authorization",
                  value: "Bearer {{ $credentials.genericCredentialType.password }}"
                },
                {
                  name: "Content-Type", 
                  value: "application/json"
                }
              ]
            },
            sendBody: true,
            bodyParameters: {
              parameters: [
                {
                  name: "model",
                  value: "={{ $json.optimalLLM }}"
                },
                {
                  name: "messages",
                  value: `=[{
  "role": "system", 
  "content": "You are ${crewMember} from Star Trek: The Next Generation. You are currently in TEST MODE. Provide your perspective on the given prompt, drawing from your unique expertise and personality. Be specific, insightful, and maintain your character's voice while providing valuable analysis. Indicate that this is a test response."
}, {
  "role": "user", 
  "content": "Original Prompt: {{ $json.originalPrompt }}\\n\\nPlease provide your perspective on this prompt, drawing from your unique expertise and personality. Be specific, insightful, and maintain your character's voice while providing valuable analysis."
}]`
                },
                {
                  name: "temperature",
                  value: "0.7"
                },
                {
                  name: "max_tokens", 
                  value: "800"
                }
              ]
            },
            options: {}
          }
        },
        {
          id: `memory-storage-${timestamp}`,
          name: `${crewMember} Memory Storage (Test)`,
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [912, 112],
          parameters: {
            functionCode: `// Mock memory storage for testing
const input = $input.first().json;
const aiResponse = $input.all()[1]?.json;

return {
  crew_member: "${crewMember}",
  memory_type: "test_interaction",
  content: aiResponse?.choices?.[0]?.message?.content || "Test response generated",
  context: input.originalPrompt || "Test prompt",
  metadata: JSON.stringify({
    llm_used: input.optimalLLM,
    confidence: input.confidence,
    reasoning: input.reasoning,
    test_mode: true,
    timestamp: new Date().toISOString()
  }),
  testMode: true,
  status: "stored"
};`
          }
        },
        {
          id: `observation-communication-${timestamp}`,
          name: 'Observation Lounge Communication (Test)',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [912, 304],
          parameters: {
            functionCode: `// Mock observation lounge communication for testing
const input = $input.first().json;
const aiResponse = $input.all()[1]?.json;

return {
  crew_member: "${crewMember}",
  message: "Test communication to Observation Lounge",
  response: aiResponse?.choices?.[0]?.message?.content || "Test response",
  timestamp: new Date().toISOString(),
  testMode: true,
  status: "communicated"
};`
          }
        },
        {
          id: `response-${timestamp}`,
          name: `${crewMember} Response (Test)`,
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [1120, 304],
          parameters: {
            functionCode: `// Generate final test response
const aiResponse = $input.all()[1]?.json;
const memoryData = $input.all()[0]?.json;
const communicationData = $input.all()[2]?.json;

return {
  crew_member: "${crewMember}",
  response: aiResponse?.choices?.[0]?.message?.content || "Test response generated",
  llm_used: aiResponse?.optimalLLM || "test-model",
  confidence: 0.95,
  timestamp: new Date().toISOString(),
  testMode: true,
  source: "n8n-ui-manual-execution",
  execution_summary: {
    memory_stored: memoryData?.status === "stored",
    communication_sent: communicationData?.status === "communicated", 
    response_generated: true
  },
  mockData: {
    originalPrompt: "Test prompt for ${crewMember} - This is mock data for testing the workflow in N8N UI.",
    testContext: "Manual execution testing in N8N UI",
    executionMode: "mock"
  }
};`
          }
        }
      ],
      connections: {
        'Manual Trigger (Mock Data)': {
          main: [
            [
              { node: `${crewMember} Memory Retrieval (Test)`, type: 'main', index: 0 },
              { node: 'LLM Selection Agent (Test)', type: 'main', index: 0 }
            ]
          ]
        },
        [`${crewMember} Memory Retrieval (Test)`]: {
          main: [[{ node: 'LLM Selection Agent (Test)', type: 'main', index: 0 }]]
        },
        'LLM Selection Agent (Test)': {
          main: [[{ node: `${crewMember} AI Agent (Test)`, type: 'main', index: 0 }]]
        },
        [`${crewMember} AI Agent (Test)`]: {
          main: [
            [
              { node: `${crewMember} Memory Storage (Test)`, type: 'main', index: 0 },
              { node: 'Observation Lounge Communication (Test)', type: 'main', index: 0 }
            ]
          ]
        },
        [`${crewMember} Memory Storage (Test)`]: {
          main: [[{ node: `${crewMember} Response (Test)`, type: 'main', index: 0 }]]
        },
        'Observation Lounge Communication (Test)': {
          main: [[{ node: `${crewMember} Response (Test)`, type: 'main', index: 0 }]]
        }
      },
      settings: { executionOrder: 'v1' }
    };
  }

  async createTestWorkflow(crewMember) {
    this.log(`Creating test workflow for: ${crewMember}`, 'INFO');
    
    try {
      const testWorkflow = this.createTestWorkflowForCrewMember(crewMember);
      
      const response = await axios.post(`${this.n8nBaseUrl}/api/v1/workflows`, testWorkflow, {
        headers: this.headers
      });
      
      this.log(`Created test workflow for ${crewMember}: ${response.data.id}`, 'SUCCESS');
      return response.data;
      
    } catch (error) {
      this.log(`Failed to create test workflow for ${crewMember}: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async testWorkflowExecution(workflowId, workflowName) {
    this.log(`Testing workflow execution: ${workflowName}`, 'INFO');
    
    try {
      // Test manual execution by triggering the workflow
      const response = await axios.post(`${this.n8nBaseUrl}/api/v1/workflows/${workflowId}/execute`, {
        test: true
      }, {
        headers: this.headers
      });
      
      this.log(`Manual execution test successful: ${workflowName}`, 'SUCCESS');
      return {
        success: true,
        executionId: response.data.executionId,
        status: response.data.status
      };
      
    } catch (error) {
      this.log(`Manual execution test failed: ${workflowName} - ${error.message}`, 'ERROR');
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createAllTestWorkflows() {
    this.log('Creating test workflows for all crew members...', 'INFO');
    
    const crewMembers = [
      'Captain Jean-Luc Picard',
      'Commander Data',
      'Commander William Riker',
      'Dr. Beverly Crusher',
      'Counselor Deanna Troi',
      'Lieutenant Uhura',
      'Lieutenant Worf',
      'Lieutenant Commander Geordi La Forge'
    ];
    
    const results = {
      created: [],
      errors: [],
      summary: {
        total: crewMembers.length,
        successful: 0,
        failed: 0
      }
    };

    for (const crewMember of crewMembers) {
      try {
        const testWorkflow = await this.createTestWorkflow(crewMember);
        
        // Test the workflow
        const testResult = await this.testWorkflowExecution(testWorkflow.id, testWorkflow.name);
        
        results.created.push({
          crewMember,
          workflowId: testWorkflow.id,
          workflowName: testWorkflow.name,
          testResult
        });
        
        results.summary.successful++;
        this.log(`Successfully created and tested workflow for ${crewMember}`, 'SUCCESS');
        
      } catch (error) {
        this.log(`Failed to create workflow for ${crewMember}: ${error.message}`, 'ERROR');
        results.errors.push({
          crewMember,
          error: error.message
        });
        results.summary.failed++;
      }
    }

    return results;
  }

  async runFullTestWorkflowCreation() {
    this.log('Starting test workflow creation and testing...', 'INFO');
    
    try {
      const results = await this.createAllTestWorkflows();
      
      // Save results
      await fs.writeFile(
        path.join(__dirname, 'n8n-test-workflow-creation-results.json'),
        JSON.stringify(results, null, 2)
      );

      this.log('Test workflow creation completed!', 'SUCCESS');
      return results;
      
    } catch (error) {
      this.log(`Test workflow creation failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Main execution
async function main() {
  const creator = new N8NSimpleMockExecutionFix();
  
  try {
    const results = await creator.runFullTestWorkflowCreation();
    
    console.log('\n🧪 N8N TEST WORKFLOW CREATION COMPLETE!');
    console.log('========================================');
    console.log(`📊 Total Crew Members: ${results.summary.total}`);
    console.log(`✅ Test Workflows Created: ${results.summary.successful}`);
    console.log(`❌ Creation Errors: ${results.summary.failed}`);
    
    if (results.created.length > 0) {
      console.log('\n🎯 TEST WORKFLOWS CREATED:');
      results.created.forEach((item, index) => {
        console.log(`${index + 1}. ${item.crewMember}`);
        console.log(`   Workflow ID: ${item.workflowId}`);
        console.log(`   Test Status: ${item.testResult.success ? '✅ PASS' : '❌ FAIL'}`);
      });
    }
    
    console.log('\n📋 HOW TO USE:');
    console.log('1. Go to n8n.pbradygeorgen.com');
    console.log('2. Look for workflows starting with "TEST - [Crew Member]"');
    console.log('3. Click "Execute workflow" button');
    console.log('4. The workflow will run with mock data automatically');
    console.log('5. Check the logs to see the execution results');
    
    console.log('\n📋 Detailed results saved to n8n-test-workflow-creation-results.json');
    
  } catch (error) {
    console.error('❌ Test workflow creation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = N8NSimpleMockExecutionFix;
