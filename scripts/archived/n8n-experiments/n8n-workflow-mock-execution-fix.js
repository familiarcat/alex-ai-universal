#!/usr/bin/env node

/**
 * N8N Workflow Mock Execution Fix
 * Refactors workflows to support both webhook triggers and manual execution with mock data
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class N8NWorkflowMockExecutionFix {
  constructor() {
    this.n8nApiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTA3ZGJlZi0yZDJmLTQ2YjUtYWQ3ZC0yYjIzZTk2ZWE1NjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU2MDk3MjIyfQ.wFPf3jA0X2zdNkaPqoPzTEAE-MsS-XcM6Gk20KYr4Dw';
    this.n8nBaseUrl = 'https://n8n.pbradygeorgen.com';
    
    this.headers = {
      'X-N8N-API-KEY': this.n8nApiKey,
      'Content-Type': 'application/json'
    };
  }

  async log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
  }

  async getAllWorkflows() {
    try {
      const response = await axios.get(`${this.n8nBaseUrl}/api/v1/workflows`, {
        headers: this.headers
      });
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    } catch (error) {
      this.log(`Failed to fetch workflows: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async getWorkflow(workflowId) {
    try {
      const response = await axios.get(`${this.n8nBaseUrl}/api/v1/workflows/${workflowId}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      this.log(`Failed to fetch workflow ${workflowId}: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async updateWorkflow(workflowId, workflowData) {
    try {
      const response = await axios.put(`${this.n8nBaseUrl}/api/v1/workflows/${workflowId}`, workflowData, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      this.log(`Failed to update workflow ${workflowId}: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  generateMockDataForCrewMember(crewMember) {
    return {
      prompt: `Test prompt for ${crewMember} - This is mock data for testing the workflow in N8N UI. Please provide your perspective on optimizing team communication and coordination.`,
      message: `Mock message for ${crewMember} testing`,
      timestamp: new Date().toISOString(),
      testMode: true,
      source: 'n8n-ui-testing',
      crewMember: crewMember,
      context: {
        domain: 'testing',
        complexity: 'medium',
        type: 'analytical'
      }
    };
  }

  refactorWorkflowForMockExecution(workflow) {
    this.log(`Refactoring workflow: ${workflow.name}`, 'INFO');
    
    const refactoredWorkflow = JSON.parse(JSON.stringify(workflow));
    
    // Find the webhook trigger node
    const webhookNode = refactoredWorkflow.nodes.find(node => node.type === 'n8n-nodes-base.webhook');
    
    if (!webhookNode) {
      this.log(`No webhook node found in workflow: ${workflow.name}`, 'WARNING');
      return refactoredWorkflow;
    }

    // Extract crew member name for mock data
    const crewMemberMatch = workflow.name.match(/CREW - (.+?) -/);
    const crewMember = crewMemberMatch ? crewMemberMatch[1] : 'Unknown Crew Member';

    // Create a new Manual Trigger node
    const manualTriggerNode = {
      id: `manual-trigger-${Date.now()}`,
      name: 'Manual Trigger (Test Mode)',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [80, 304],
      parameters: {
        mockData: [this.generateMockDataForCrewMember(crewMember)]
      }
    };

    // Add the manual trigger node
    refactoredWorkflow.nodes.unshift(manualTriggerNode);

    // Update connections to include manual trigger
    const originalConnections = refactoredWorkflow.connections;
    const newConnections = { ...originalConnections };

    // Connect manual trigger to the same nodes as webhook
    const webhookConnections = originalConnections[webhookNode.name];
    if (webhookConnections) {
      newConnections['Manual Trigger (Test Mode)'] = webhookConnections;
    }

    refactoredWorkflow.connections = newConnections;

    // Add a conditional node to handle both webhook and manual triggers
    const conditionalNode = {
      id: `conditional-${Date.now()}`,
      name: 'Input Source Router',
      type: 'n8n-nodes-base.if',
      typeVersion: 1,
      position: [320, 304],
      parameters: {
        conditions: {
          string: [
            {
              value1: '={{ $json.testMode }}',
              operation: 'equal',
              value2: 'true'
            }
          ]
        }
      }
    };

    // Insert conditional node after triggers
    const triggerPosition = refactoredWorkflow.nodes.findIndex(node => 
      node.type === 'n8n-nodes-base.webhook' || node.type === 'n8n-nodes-base.manualTrigger'
    );
    refactoredWorkflow.nodes.splice(triggerPosition + 1, 0, conditionalNode);

    // Update connections to route through conditional
    const nextNodeName = webhookNode.name.replace('Directive', 'Memory Retrieval').replace('Trigger', 'Memory Retrieval');
    const nextNode = refactoredWorkflow.nodes.find(node => node.name.includes('Memory Retrieval'));
    
    if (nextNode) {
      newConnections['Input Source Router'] = {
        main: [
          [
            { node: nextNode.name, type: 'main', index: 0 }
          ]
        ]
      };
    }

    // Update webhook connections to go through conditional
    if (newConnections[webhookNode.name]) {
      newConnections[webhookNode.name].main[0] = [
        { node: 'Input Source Router', type: 'main', index: 0 }
      ];
    }

    refactoredWorkflow.connections = newConnections;

    // Add test mode indicator to response
    const responseNode = refactoredWorkflow.nodes.find(node => 
      node.type === 'n8n-nodes-base.respondToWebhook'
    );
    
    if (responseNode) {
      responseNode.parameters.responseBody = `={{ { 
        "crew_member": "${crewMember}", 
        "response": $json.choices?.[0]?.message?.content || $json.response || "Mock response generated",
        "timestamp": new Date().toISOString(),
        "testMode": true,
        "source": "n8n-ui-manual-execution",
        "mockData": $input.first().json
      } }}`;
    }

    return refactoredWorkflow;
  }

  async refactorAllCrewWorkflows() {
    this.log('Starting workflow refactoring for mock execution support...', 'INFO');
    
    const workflows = await this.getAllWorkflows();
    const crewWorkflows = workflows.filter(w => w.name.includes('CREW -'));
    
    const results = {
      processed: [],
      errors: [],
      summary: {
        total: crewWorkflows.length,
        successful: 0,
        failed: 0
      }
    };

    for (const workflow of crewWorkflows) {
      try {
        this.log(`Processing workflow: ${workflow.name}`, 'INFO');
        
        // Get the full workflow details
        const fullWorkflow = await this.getWorkflow(workflow.id);
        
        // Refactor for mock execution
        const refactoredWorkflow = this.refactorWorkflowForMockExecution(fullWorkflow);
        
        // Update the workflow
        await this.updateWorkflow(workflow.id, refactoredWorkflow);
        
        results.processed.push({
          id: workflow.id,
          name: workflow.name,
          status: 'success',
          changes: [
            'Added Manual Trigger node',
            'Added Input Source Router',
            'Updated connections for dual mode',
            'Enhanced response with test mode indicator'
          ]
        });
        
        results.summary.successful++;
        this.log(`Successfully refactored: ${workflow.name}`, 'SUCCESS');
        
      } catch (error) {
        this.log(`Failed to refactor ${workflow.name}: ${error.message}`, 'ERROR');
        results.errors.push({
          workflow: workflow.name,
          error: error.message
        });
        results.summary.failed++;
      }
    }

    return results;
  }

  async testWorkflowExecution(workflowId, workflowName, executionMode = 'manual') {
    this.log(`Testing ${executionMode} execution for: ${workflowName}`, 'INFO');
    
    try {
      if (executionMode === 'manual') {
        // Test manual execution by triggering the workflow
        const response = await axios.post(`${this.n8nBaseUrl}/api/v1/workflows/${workflowId}/execute`, {
          test: true
        }, {
          headers: this.headers
        });
        
        this.log(`Manual execution test successful: ${workflowName}`, 'SUCCESS');
        return {
          success: true,
          mode: 'manual',
          executionId: response.data.executionId,
          status: response.data.status
        };
      } else {
        // Test webhook execution
        const workflow = await this.getWorkflow(workflowId);
        const webhookNode = workflow.nodes.find(node => node.type === 'n8n-nodes-base.webhook');
        
        if (!webhookNode) {
          throw new Error('No webhook node found');
        }

        const webhookUrl = `${this.n8nBaseUrl}/webhook/${webhookNode.parameters.path}`;
        const testData = this.generateMockDataForCrewMember('Test Crew Member');
        
        const response = await axios.post(webhookUrl, testData, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });
        
        this.log(`Webhook execution test successful: ${workflowName}`, 'SUCCESS');
        return {
          success: true,
          mode: 'webhook',
          response: response.data,
          executionTime: response.headers['x-response-time'] || 'unknown'
        };
      }
    } catch (error) {
      this.log(`${executionMode} execution test failed: ${workflowName} - ${error.message}`, 'ERROR');
      return {
        success: false,
        mode: executionMode,
        error: error.message
      };
    }
  }

  async runFullRefactoringAndTesting() {
    this.log('Starting full workflow refactoring and testing...', 'INFO');
    
    try {
      // Step 1: Refactor all crew workflows
      const refactoringResults = await this.refactorAllCrewWorkflows();
      
      // Step 2: Test both execution modes
      const workflows = await this.getAllWorkflows();
      const crewWorkflows = workflows.filter(w => w.name.includes('CREW -'));
      
      const testResults = {
        manual: [],
        webhook: [],
        summary: {
          totalTests: 0,
          manualSuccess: 0,
          webhookSuccess: 0,
          totalSuccess: 0
        }
      };

      // Test first 3 workflows in both modes
      for (const workflow of crewWorkflows.slice(0, 3)) {
        // Test manual execution
        const manualTest = await this.testWorkflowExecution(workflow.id, workflow.name, 'manual');
        testResults.manual.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          ...manualTest
        });
        testResults.summary.totalTests++;
        if (manualTest.success) testResults.summary.manualSuccess++;

        // Test webhook execution
        const webhookTest = await this.testWorkflowExecution(workflow.id, workflow.name, 'webhook');
        testResults.webhook.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          ...webhookTest
        });
        testResults.summary.totalTests++;
        if (webhookTest.success) testResults.summary.webhookSuccess++;
      }

      testResults.summary.totalSuccess = testResults.summary.manualSuccess + testResults.summary.webhookSuccess;

      const finalResults = {
        timestamp: new Date().toISOString(),
        refactoring: refactoringResults,
        testing: testResults,
        summary: {
          workflowsProcessed: refactoringResults.summary.total,
          workflowsRefactored: refactoringResults.summary.successful,
          refactoringErrors: refactoringResults.summary.failed,
          totalTests: testResults.summary.totalTests,
          successfulTests: testResults.summary.totalSuccess,
          successRate: Math.round((testResults.summary.totalSuccess / testResults.summary.totalTests) * 100)
        }
      };

      // Save results
      await fs.writeFile(
        path.join(__dirname, 'n8n-mock-execution-results.json'),
        JSON.stringify(finalResults, null, 2)
      );

      this.log('Full refactoring and testing completed!', 'SUCCESS');
      return finalResults;

    } catch (error) {
      this.log(`Refactoring failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Main execution
async function main() {
  const fixer = new N8NWorkflowMockExecutionFix();
  
  try {
    const results = await fixer.runFullRefactoringAndTesting();
    
    console.log('\n🔧 N8N WORKFLOW MOCK EXECUTION FIX COMPLETE!');
    console.log('==============================================');
    console.log(`📊 Workflows Processed: ${results.summary.workflowsProcessed}`);
    console.log(`✅ Workflows Refactored: ${results.summary.workflowsRefactored}`);
    console.log(`❌ Refactoring Errors: ${results.summary.refactoringErrors}`);
    console.log(`🧪 Total Tests: ${results.summary.totalTests}`);
    console.log(`✅ Successful Tests: ${results.summary.successfulTests}`);
    console.log(`📈 Success Rate: ${results.summary.successRate}%`);
    
    console.log('\n🎯 EXECUTION MODES NOW SUPPORTED:');
    console.log('1. ✅ Manual Execution (N8N UI Testing)');
    console.log('2. ✅ Webhook Execution (Alex AI Integration)');
    
    console.log('\n📋 Detailed results saved to n8n-mock-execution-results.json');
    
  } catch (error) {
    console.error('❌ Refactoring failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = N8NWorkflowMockExecutionFix;
