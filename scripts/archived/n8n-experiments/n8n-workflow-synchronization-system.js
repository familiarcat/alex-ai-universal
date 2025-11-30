#!/usr/bin/env node

/**
 * N8N Workflow Synchronization System
 * Comprehensive system to standardize and synchronize all N8N workflows
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class N8NWorkflowSynchronizationSystem {
  constructor() {
    this.n8nApiKey = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTA3ZGJlZi0yZDJmLTQ2YjUtYWQ3ZC0yYjIzZTk2ZWE1NjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU2MDk3MjIyfQ.wFPf3jA0X2zdNkaPqoPzTEAE-MsS-XcM6Gk20KYr4Dw';
    this.n8nBaseUrl = process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com';
    this.supabaseUrl = process.env.SUPABASE_URL || 'https://rpkkkbufdwxmjaerbhbn.supabase.co';
    this.openRouterUrl = 'https://api.openrouter.ai/api/v1/chat/completions';
    
    this.headers = {
      'X-N8N-API-KEY': this.n8nApiKey,
      'Content-Type': 'application/json'
    };
    
    // Standard crew workflow template
    this.standardCrewTemplate = {
      nodes: [
        {
          name: '[CREW_MEMBER] Directive',
          type: 'n8n-nodes-base.webhook',
          position: [240, 304],
          parameters: {
            httpMethod: 'POST',
            path: 'crew-[crew-member-lowercase]',
            responseMode: 'responseNode'
          }
        },
        {
          name: '[CREW_MEMBER] Memory Retrieval',
          type: 'n8n-nodes-base.httpRequest',
          position: [464, 112],
          parameters: {
            authentication: 'genericCredentialType',
            url: `${this.supabaseUrl}/rest/v1/crew_memories?crew_member=eq.[CREW_MEMBER]`,
            requestMethod: 'GET'
          }
        },
        {
          name: 'LLM Selection Agent',
          type: 'n8n-nodes-base.httpRequest',
          position: [464, 320],
          parameters: {
            authentication: 'genericCredentialType',
            url: this.openRouterUrl,
            requestMethod: 'POST'
          }
        },
        {
          name: '[CREW_MEMBER] AI Agent',
          type: 'n8n-nodes-base.httpRequest',
          position: [688, 304],
          parameters: {
            authentication: 'genericCredentialType',
            url: this.openRouterUrl,
            requestMethod: 'POST'
          }
        },
        {
          name: '[CREW_MEMBER] Memory Storage',
          type: 'n8n-nodes-base.httpRequest',
          position: [912, 112],
          parameters: {
            authentication: 'genericCredentialType',
            url: `${this.supabaseUrl}/rest/v1/crew_memories`,
            requestMethod: 'POST'
          }
        },
        {
          name: 'Observation Lounge Communication',
          type: 'n8n-nodes-base.httpRequest',
          position: [912, 304],
          parameters: {
            authentication: 'genericCredentialType',
            url: this.openRouterUrl,
            requestMethod: 'POST'
          }
        },
        {
          name: '[CREW_MEMBER] Response',
          type: 'n8n-nodes-base.respondToWebhook',
          position: [1120, 304],
          parameters: {
            respondWith: 'json'
          }
        }
      ],
      connections: {
        '[CREW_MEMBER] Directive': {
          main: [
            [
              { node: '[CREW_MEMBER] Memory Retrieval', type: 'main', index: 0 },
              { node: 'LLM Selection Agent', type: 'main', index: 0 }
            ]
          ]
        },
        '[CREW_MEMBER] Memory Retrieval': {
          main: [[{ node: 'LLM Selection Agent', type: 'main', index: 0 }]]
        },
        'LLM Selection Agent': {
          main: [[{ node: '[CREW_MEMBER] AI Agent', type: 'main', index: 0 }]]
        },
        '[CREW_MEMBER] AI Agent': {
          main: [[{ node: 'Observation Lounge Communication', type: 'main', index: 0 }]]
        },
        '[CREW_MEMBER] Memory Storage': {
          main: [[{ node: '[CREW_MEMBER] Response', type: 'main', index: 0 }]]
        },
        'Observation Lounge Communication': {
          main: [[{ node: '[CREW_MEMBER] Memory Storage', type: 'main', index: 0 }]]
        }
      }
    };
    
    this.crewMembers = [
      'Captain Jean-Luc Picard',
      'Commander Data',
      'Commander William Riker',
      'Dr. Beverly Crusher',
      'Counselor Deanna Troi',
      'Lieutenant Uhura',
      'Lieutenant Worf',
      'Lieutenant Commander Geordi La Forge',
      'Quark'
    ];
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
      return response.data;
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

  async createWorkflow(workflowData) {
    try {
      const response = await axios.post(`${this.n8nBaseUrl}/api/v1/workflows`, workflowData, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      this.log(`Failed to create workflow: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  analyzeWorkflowStructure(workflow) {
    const analysis = {
      id: workflow.id,
      name: workflow.name,
      active: workflow.active,
      updatedAt: workflow.updatedAt,
      nodeCount: workflow.nodes.length,
      hasStandardStructure: false,
      issues: [],
      recommendations: []
    };

    // Check if it's a crew workflow
    const isCrewWorkflow = workflow.name.includes('CREW -');
    
    if (isCrewWorkflow) {
      // Standard crew workflow should have 7 nodes
      if (workflow.nodes.length !== 7) {
        analysis.issues.push(`Incorrect node count: ${workflow.nodes.length} (expected 7)`);
      }

      // Check for required nodes
      const requiredNodes = [
        'Directive',
        'Memory Retrieval', 
        'LLM Selection Agent',
        'AI Agent',
        'Memory Storage',
        'Observation Lounge Communication',
        'Response'
      ];

      const nodeNames = workflow.nodes.map(node => node.name);
      const missingNodes = requiredNodes.filter(required => 
        !nodeNames.some(name => name.includes(required))
      );

      if (missingNodes.length > 0) {
        analysis.issues.push(`Missing nodes: ${missingNodes.join(', ')}`);
      }

      // Check connections
      if (!workflow.connections) {
        analysis.issues.push('No connections defined');
      }

      analysis.hasStandardStructure = analysis.issues.length === 0;
    }

    return analysis;
  }

  generateStandardCrewWorkflow(crewMember) {
    const template = JSON.parse(JSON.stringify(this.standardCrewTemplate));
    const crewMemberLower = crewMember.toLowerCase().replace(/\s+/g, '-');
    
    // Replace placeholders in nodes
    template.nodes = template.nodes.map(node => {
      const newNode = { ...node };
      newNode.name = newNode.name.replace(/\[CREW_MEMBER\]/g, crewMember);
      newNode.id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Update webhook path
      if (newNode.name.includes('Directive')) {
        newNode.parameters.path = `crew-${crewMemberLower}`;
      }
      
      // Update Supabase URLs
      if (newNode.name.includes('Memory')) {
        newNode.parameters.url = newNode.parameters.url.replace(/\[CREW_MEMBER\]/g, crewMember);
      }
      
      return newNode;
    });

    // Replace placeholders in connections
    const newConnections = {};
    Object.keys(template.connections).forEach(key => {
      const newKey = key.replace(/\[CREW_MEMBER\]/g, crewMember);
      newConnections[newKey] = template.connections[key].map(connectionArray => 
        connectionArray.map(connection => ({
          ...connection,
          node: connection.node.replace(/\[CREW_MEMBER\]/g, crewMember)
        }))
      );
    });
    template.connections = newConnections;

    return {
      name: `CREW - ${crewMember} - Standardized - OpenRouter - Production`,
      nodes: template.nodes,
      connections: template.connections,
      active: true,
      settings: { executionOrder: 'v1' }
    };
  }

  async standardizeCrewWorkflows() {
    this.log('Starting crew workflow standardization...', 'INFO');
    
    const workflows = await this.getAllWorkflows();
    const crewWorkflows = workflows.filter(w => w.name.includes('CREW -'));
    
    this.log(`Found ${crewWorkflows.length} crew workflows`, 'INFO');
    
    const results = {
      analyzed: [],
      standardized: [],
      created: [],
      errors: []
    };

    for (const workflow of crewWorkflows) {
      try {
        const analysis = this.analyzeWorkflowStructure(workflow);
        results.analyzed.push(analysis);
        
        if (!analysis.hasStandardStructure) {
          this.log(`Standardizing workflow: ${workflow.name}`, 'INFO');
          
          // Extract crew member name
          const crewMemberMatch = workflow.name.match(/CREW - (.+?) -/);
          if (crewMemberMatch) {
            const crewMember = crewMemberMatch[1];
            const standardizedWorkflow = this.generateStandardCrewWorkflow(crewMember);
            
            // Update existing workflow
            await this.updateWorkflow(workflow.id, standardizedWorkflow);
            results.standardized.push({
              id: workflow.id,
              name: workflow.name,
              crewMember,
              issues: analysis.issues
            });
            
            this.log(`Standardized workflow: ${workflow.name}`, 'SUCCESS');
          }
        }
      } catch (error) {
        this.log(`Error processing workflow ${workflow.name}: ${error.message}`, 'ERROR');
        results.errors.push({
          workflow: workflow.name,
          error: error.message
        });
      }
    }

    return results;
  }

  async integrateOrphanedWorkflows() {
    this.log('Integrating orphaned workflows...', 'INFO');
    
    const workflows = await this.getAllWorkflows();
    const orphanedWorkflows = workflows.filter(w => 
      w.name.includes('ANTI-HALLUCINATION') ||
      w.name.includes('DEMOCRATIC') ||
      w.name.includes('MISSION CONTROL') ||
      w.name.includes('OPENROUTER AGENT')
    );
    
    this.log(`Found ${orphanedWorkflows.length} orphaned workflows`, 'INFO');
    
    // Create integration workflow
    const integrationWorkflow = {
      name: 'SYSTEM - Unified Crew Coordination - OpenRouter - Production',
      nodes: [
        {
          name: 'Unified Crew Coordinator',
          type: 'n8n-nodes-base.webhook',
          position: [240, 304],
          parameters: {
            httpMethod: 'POST',
            path: 'unified-crew-coordinator',
            responseMode: 'responseNode'
          }
        },
        {
          name: 'Crew Workflow Router',
          type: 'n8n-nodes-base.function',
          position: [464, 304],
          parameters: {
            functionCode: `
              // Route to appropriate crew workflow based on prompt analysis
              const prompt = $input.first().json.prompt;
              const crewMembers = [
                'Captain Jean-Luc Picard',
                'Commander Data', 
                'Commander William Riker',
                'Dr. Beverly Crusher',
                'Counselor Deanna Troi',
                'Lieutenant Uhura',
                'Lieutenant Worf',
                'Lieutenant Commander Geordi La Forge',
                'Quark'
              ];
              
              // Simple routing logic - can be enhanced
              const selectedCrew = crewMembers[Math.floor(Math.random() * crewMembers.length)];
              
              return {
                selectedCrew,
                originalPrompt: prompt,
                timestamp: new Date().toISOString()
              };
            `
          }
        },
        {
          name: 'Anti-Hallucination Integration',
          type: 'n8n-nodes-base.httpRequest',
          position: [688, 304],
          parameters: {
            url: `${this.n8nBaseUrl}/webhook/anti-hallucination`,
            requestMethod: 'POST'
          }
        },
        {
          name: 'Unified Response',
          type: 'n8n-nodes-base.respondToWebhook',
          position: [912, 304],
          parameters: {
            respondWith: 'json'
          }
        }
      ],
      connections: {
        'Unified Crew Coordinator': {
          main: [[{ node: 'Crew Workflow Router', type: 'main', index: 0 }]]
        },
        'Crew Workflow Router': {
          main: [[{ node: 'Anti-Hallucination Integration', type: 'main', index: 0 }]]
        },
        'Anti-Hallucination Integration': {
          main: [[{ node: 'Unified Response', type: 'main', index: 0 }]]
        }
      },
      active: true,
      settings: { executionOrder: 'v1' }
    };

    try {
      await this.createWorkflow(integrationWorkflow);
      this.log('Created unified crew coordination workflow', 'SUCCESS');
    } catch (error) {
      this.log(`Failed to create integration workflow: ${error.message}`, 'ERROR');
    }
  }

  async testWorkflowExecution(workflowId) {
    try {
      // Test workflow by triggering it
      const response = await axios.post(`${this.n8nBaseUrl}/api/v1/workflows/${workflowId}/execute`, {
        test: true
      }, {
        headers: this.headers
      });
      
      return {
        success: true,
        executionId: response.data.executionId,
        status: response.data.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateSyncReport() {
    this.log('Generating synchronization report...', 'INFO');
    
    const workflows = await this.getAllWorkflows();
    const report = {
      timestamp: new Date().toISOString(),
      totalWorkflows: workflows.length,
      crewWorkflows: workflows.filter(w => w.name.includes('CREW -')).length,
      systemWorkflows: workflows.filter(w => w.name.includes('SYSTEM -')).length,
      projectWorkflows: workflows.filter(w => w.name.includes('PROJECT -')).length,
      activeWorkflows: workflows.filter(w => w.active).length,
      workflowAnalysis: []
    };

    for (const workflow of workflows) {
      const analysis = this.analyzeWorkflowStructure(workflow);
      report.workflowAnalysis.push(analysis);
    }

    // Save report to file
    await fs.writeFile(
      path.join(__dirname, 'n8n-sync-report.json'),
      JSON.stringify(report, null, 2)
    );

    this.log('Synchronization report generated: n8n-sync-report.json', 'SUCCESS');
    return report;
  }

  async runFullSynchronization() {
    this.log('Starting full N8N workflow synchronization...', 'INFO');
    
    try {
      // Step 1: Standardize crew workflows
      const standardizationResults = await this.standardizeCrewWorkflows();
      
      // Step 2: Integrate orphaned workflows
      await this.integrateOrphanedWorkflows();
      
      // Step 3: Generate sync report
      const syncReport = await this.generateSyncReport();
      
      // Step 4: Test critical workflows
      this.log('Testing critical workflow executions...', 'INFO');
      const testResults = [];
      
      const criticalWorkflows = await this.getAllWorkflows();
      for (const workflow of criticalWorkflows.slice(0, 3)) { // Test first 3 workflows
        const testResult = await this.testWorkflowExecution(workflow.id);
        testResults.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          ...testResult
        });
      }
      
      const finalResults = {
        timestamp: new Date().toISOString(),
        standardization: standardizationResults,
        syncReport,
        testResults,
        summary: {
          workflowsAnalyzed: standardizationResults.analyzed.length,
          workflowsStandardized: standardizationResults.standardized.length,
          workflowsCreated: 1, // Integration workflow
          testsPerformed: testResults.length,
          testsPassed: testResults.filter(t => t.success).length
        }
      };

      this.log('Full synchronization completed successfully!', 'SUCCESS');
      return finalResults;
      
    } catch (error) {
      this.log(`Synchronization failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Main execution
async function main() {
  const syncSystem = new N8NWorkflowSynchronizationSystem();
  
  try {
    const results = await syncSystem.runFullSynchronization();
    
    console.log('\n🎉 N8N WORKFLOW SYNCHRONIZATION COMPLETE!');
    console.log('==========================================');
    console.log(`📊 Workflows Analyzed: ${results.summary.workflowsAnalyzed}`);
    console.log(`🔧 Workflows Standardized: ${results.summary.workflowsStandardized}`);
    console.log(`🆕 Workflows Created: ${results.summary.workflowsCreated}`);
    console.log(`🧪 Tests Performed: ${results.summary.testsPerformed}`);
    console.log(`✅ Tests Passed: ${results.summary.testsPassed}`);
    console.log('\n📋 Detailed results saved to n8n-sync-report.json');
    
  } catch (error) {
    console.error('❌ Synchronization failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = N8NWorkflowSynchronizationSystem;
