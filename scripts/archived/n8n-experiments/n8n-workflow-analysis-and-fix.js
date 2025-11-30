#!/usr/bin/env node

/**
 * N8N Workflow Analysis and Fix System
 * Based on actual workflow data analysis
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class N8NWorkflowAnalysisAndFix {
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

  async getAllWorkflows() {
    try {
      const response = await axios.get(`${this.n8nBaseUrl}/api/v1/workflows`, {
        headers: this.headers
      });
      // Handle different response formats
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else if (data.workflows && Array.isArray(data.workflows)) {
        return data.workflows;
      } else {
        this.log('Unexpected workflow data format', 'WARNING');
        return [];
      }
    } catch (error) {
      this.log(`Failed to fetch workflows: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  analyzeWorkflowIssues(workflows) {
    this.log('Analyzing workflow issues...', 'INFO');
    
    const analysis = {
      timestamp: new Date().toISOString(),
      totalWorkflows: workflows.length,
      crewWorkflows: [],
      systemWorkflows: [],
      projectWorkflows: [],
      issues: {
        structural: [],
        connection: [],
        integration: [],
        standardization: []
      },
      recommendations: []
    };

    // Analyze each workflow
    workflows.forEach(workflow => {
      if (workflow.name.includes('CREW -')) {
        analysis.crewWorkflows.push(this.analyzeCrewWorkflow(workflow));
      } else if (workflow.name.includes('SYSTEM -')) {
        analysis.systemWorkflows.push(this.analyzeSystemWorkflow(workflow));
      } else if (workflow.name.includes('PROJECT -')) {
        analysis.projectWorkflows.push(this.analyzeProjectWorkflow(workflow));
      }
    });

    // Generate recommendations based on analysis
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  analyzeCrewWorkflow(workflow) {
    const analysis = {
      id: workflow.id,
      name: workflow.name,
      active: workflow.active,
      updatedAt: workflow.updatedAt,
      nodeCount: workflow.nodes.length,
      issues: [],
      score: 100,
      standardCompliance: false
    };

    // Extract crew member name
    const crewMemberMatch = workflow.name.match(/CREW - (.+?) -/);
    const crewMember = crewMemberMatch ? crewMemberMatch[1] : 'Unknown';

    // Check standard structure (should have 7 nodes)
    if (workflow.nodes.length !== 7) {
      analysis.issues.push(`Incorrect node count: ${workflow.nodes.length} (expected 7)`);
      analysis.score -= 20;
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
      analysis.score -= missingNodes.length * 10;
    }

    // Check for Quark's extra node (non-standard)
    if (crewMember === 'Quark' && workflow.nodes.length === 8) {
      analysis.issues.push('Non-standard structure: Extra "Observation Lounge Summary" node');
      analysis.score -= 15;
    }

    // Check connections
    if (!workflow.connections || Object.keys(workflow.connections).length === 0) {
      analysis.issues.push('No connections defined');
      analysis.score -= 20;
    }

    // Check for proper API integrations
    const hasSupabase = workflow.nodes.some(node => 
      node.parameters?.url?.includes('supabase')
    );
    const hasOpenRouter = workflow.nodes.some(node => 
      node.parameters?.url?.includes('openrouter')
    );

    if (!hasSupabase) {
      analysis.issues.push('Missing Supabase integration');
      analysis.score -= 15;
    }

    if (!hasOpenRouter) {
      analysis.issues.push('Missing OpenRouter integration');
      analysis.score -= 15;
    }

    analysis.standardCompliance = analysis.issues.length === 0;
    analysis.score = Math.max(0, analysis.score);

    return analysis;
  }

  analyzeSystemWorkflow(workflow) {
    return {
      id: workflow.id,
      name: workflow.name,
      active: workflow.active,
      updatedAt: workflow.updatedAt,
      nodeCount: workflow.nodes.length,
      type: 'system',
      needsIntegration: true
    };
  }

  analyzeProjectWorkflow(workflow) {
    return {
      id: workflow.id,
      name: workflow.name,
      active: workflow.active,
      updatedAt: workflow.updatedAt,
      nodeCount: workflow.nodes.length,
      type: 'project',
      needsIntegration: true
    };
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // Crew workflow standardization
    const nonStandardCrew = analysis.crewWorkflows.filter(w => !w.standardCompliance);
    if (nonStandardCrew.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'STANDARDIZATION',
        issue: `${nonStandardCrew.length} crew workflows need standardization`,
        action: 'Standardize crew workflow structures to 7-node format',
        workflows: nonStandardCrew.map(w => w.name)
      });
    }

    // Missing crew member
    const expectedCrew = [
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

    const existingCrew = analysis.crewWorkflows.map(w => {
      const match = w.name.match(/CREW - (.+?) -/);
      return match ? match[1] : null;
    }).filter(Boolean);

    const missingCrew = expectedCrew.filter(crew => !existingCrew.includes(crew));
    if (missingCrew.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'COMPLETENESS',
        issue: `Missing crew workflows: ${missingCrew.join(', ')}`,
        action: 'Create missing crew member workflows',
        workflows: missingCrew
      });
    }

    // System workflow integration
    if (analysis.systemWorkflows.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'INTEGRATION',
        issue: `${analysis.systemWorkflows.length} system workflows need crew integration`,
        action: 'Integrate system workflows with crew coordination',
        workflows: analysis.systemWorkflows.map(w => w.name)
      });
    }

    // Project workflow integration
    if (analysis.projectWorkflows.length > 0) {
      recommendations.push({
        priority: 'LOW',
        category: 'INTEGRATION',
        issue: `${analysis.projectWorkflows.length} project workflows need crew integration`,
        action: 'Connect project workflows to crew system',
        workflows: analysis.projectWorkflows.map(w => w.name)
      });
    }

    return recommendations;
  }

  async createMissingCrewWorkflow(crewMember) {
    this.log(`Creating missing crew workflow for: ${crewMember}`, 'INFO');
    
    const crewMemberLower = crewMember.toLowerCase().replace(/\s+/g, '-');
    
    const workflow = {
      name: `CREW - ${crewMember} - Standardized - OpenRouter - Production`,
      active: true,
      nodes: [
        {
          id: `directive-${Date.now()}`,
          name: `${crewMember} Directive`,
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 304],
          parameters: {
            httpMethod: 'POST',
            path: `crew-${crewMemberLower}`,
            responseMode: 'responseNode',
            options: {}
          }
        },
        {
          id: `memory-retrieval-${Date.now()}`,
          name: `${crewMember} Memory Retrieval`,
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [464, 112],
          parameters: {
            authentication: 'genericCredentialType',
            url: `${this.supabaseUrl}/rest/v1/crew_memories?crew_member=eq.${crewMember}`,
            requestMethod: 'GET',
            options: {}
          }
        },
        {
          id: `llm-selection-${Date.now()}`,
          name: 'LLM Selection Agent',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [464, 320],
          parameters: {
            authentication: 'genericCredentialType',
            url: this.openRouterUrl,
            requestMethod: 'POST',
            options: {}
          }
        },
        {
          id: `ai-agent-${Date.now()}`,
          name: `${crewMember} AI Agent`,
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [688, 304],
          parameters: {
            authentication: 'genericCredentialType',
            url: this.openRouterUrl,
            requestMethod: 'POST',
            options: {}
          }
        },
        {
          id: `memory-storage-${Date.now()}`,
          name: `${crewMember} Memory Storage`,
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [912, 112],
          parameters: {
            authentication: 'genericCredentialType',
            url: `${this.supabaseUrl}/rest/v1/crew_memories`,
            requestMethod: 'POST',
            options: {}
          }
        },
        {
          id: `observation-communication-${Date.now()}`,
          name: 'Observation Lounge Communication',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [912, 304],
          parameters: {
            authentication: 'genericCredentialType',
            url: this.openRouterUrl,
            requestMethod: 'POST',
            options: {}
          }
        },
        {
          id: `response-${Date.now()}`,
          name: `${crewMember} Response`,
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [1120, 304],
          parameters: {
            respondWith: 'json',
            responseBody: `={{ { "crew_member": "${crewMember}", "response": $json.choices[0].message.content, "timestamp": new Date().toISOString() } }}`,
            options: {}
          }
        }
      ],
      connections: {
        [`${crewMember} Directive`]: {
          main: [
            [
              { node: `${crewMember} Memory Retrieval`, type: 'main', index: 0 },
              { node: 'LLM Selection Agent', type: 'main', index: 0 }
            ]
          ]
        },
        [`${crewMember} Memory Retrieval`]: {
          main: [[{ node: 'LLM Selection Agent', type: 'main', index: 0 }]]
        },
        'LLM Selection Agent': {
          main: [[{ node: `${crewMember} AI Agent`, type: 'main', index: 0 }]]
        },
        [`${crewMember} AI Agent`]: {
          main: [[{ node: 'Observation Lounge Communication', type: 'main', index: 0 }]]
        },
        [`${crewMember} Memory Storage`]: {
          main: [[{ node: `${crewMember} Response`, type: 'main', index: 0 }]]
        },
        'Observation Lounge Communication': {
          main: [[{ node: `${crewMember} Memory Storage`, type: 'main', index: 0 }]]
        }
      },
      settings: { executionOrder: 'v1' }
    };

    try {
      const response = await axios.post(`${this.n8nBaseUrl}/api/v1/workflows`, workflow, {
        headers: this.headers
      });
      this.log(`Created workflow for ${crewMember}: ${response.data.id}`, 'SUCCESS');
      return response.data;
    } catch (error) {
      this.log(`Failed to create workflow for ${crewMember}: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async testWorkflowExecution(workflowId, workflowName) {
    this.log(`Testing workflow execution: ${workflowName}`, 'INFO');
    
    try {
      // Get workflow details to find webhook URL
      const workflow = await axios.get(`${this.n8nBaseUrl}/api/v1/workflows/${workflowId}`, {
        headers: this.headers
      });

      const webhookNode = workflow.data.nodes.find(node => node.type === 'n8n-nodes-base.webhook');
      if (!webhookNode) {
        throw new Error('No webhook node found');
      }

      const webhookUrl = `${this.n8nBaseUrl}/webhook/${webhookNode.parameters.path}`;
      
      // Test the workflow
      const testData = {
        prompt: `Test prompt for ${workflowName} - validation testing`,
        message: "This is a test message to validate workflow execution",
        timestamp: new Date().toISOString()
      };

      const response = await axios.post(webhookUrl, testData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      this.log(`Workflow test successful: ${workflowName}`, 'SUCCESS');
      return {
        success: true,
        response: response.data,
        executionTime: response.headers['x-response-time'] || 'unknown'
      };

    } catch (error) {
      this.log(`Workflow test failed: ${workflowName} - ${error.message}`, 'ERROR');
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateComprehensiveReport() {
    this.log('Generating comprehensive N8N workflow analysis report...', 'INFO');
    
    try {
      const workflows = await this.getAllWorkflows();
      const analysis = this.analyzeWorkflowIssues(workflows);
      
      // Test a few critical workflows
      const criticalWorkflows = workflows.filter(w => w.name.includes('CREW -')).slice(0, 3);
      const testResults = [];
      
      for (const workflow of criticalWorkflows) {
        const testResult = await this.testWorkflowExecution(workflow.id, workflow.name);
        testResults.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          ...testResult
        });
      }

      const report = {
        timestamp: new Date().toISOString(),
        analysis,
        testResults,
        summary: {
          totalWorkflows: analysis.totalWorkflows,
          crewWorkflows: analysis.crewWorkflows.length,
          systemWorkflows: analysis.systemWorkflows.length,
          projectWorkflows: analysis.projectWorkflows.length,
          nonStandardCrew: analysis.crewWorkflows.filter(w => !w.standardCompliance).length,
          testsPerformed: testResults.length,
          testsPassed: testResults.filter(t => t.success).length
        }
      };

      // Save report
      await fs.writeFile(
        path.join(__dirname, 'n8n-comprehensive-analysis-report.json'),
        JSON.stringify(report, null, 2)
      );

      this.log('Comprehensive analysis report generated', 'SUCCESS');
      return report;

    } catch (error) {
      this.log(`Report generation failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async runAnalysisAndFixes() {
    this.log('Starting N8N workflow analysis and fixes...', 'INFO');
    
    try {
      const report = await this.generateComprehensiveReport();
      
      this.log('Analysis complete! Generating summary...', 'INFO');
      
      console.log('\n🔍 N8N WORKFLOW ANALYSIS COMPLETE!');
      console.log('===================================');
      console.log(`📊 Total Workflows: ${report.summary.totalWorkflows}`);
      console.log(`👥 Crew Workflows: ${report.summary.crewWorkflows}`);
      console.log(`🔧 System Workflows: ${report.summary.systemWorkflows}`);
      console.log(`📁 Project Workflows: ${report.summary.projectWorkflows}`);
      console.log(`❌ Non-Standard Crew: ${report.summary.nonStandardCrew}`);
      console.log(`🧪 Tests Performed: ${report.summary.testsPerformed}`);
      console.log(`✅ Tests Passed: ${report.summary.testsPassed}`);
      
      if (report.analysis.recommendations.length > 0) {
        console.log('\n💡 CRITICAL RECOMMENDATIONS:');
        report.analysis.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. [${rec.priority}] ${rec.issue}`);
          console.log(`   → ${rec.action}`);
        });
      }
      
      console.log('\n📋 Detailed report saved to n8n-comprehensive-analysis-report.json');
      
      return report;
      
    } catch (error) {
      this.log(`Analysis failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Main execution
async function main() {
  const analyzer = new N8NWorkflowAnalysisAndFix();
  
  try {
    await analyzer.runAnalysisAndFixes();
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = N8NWorkflowAnalysisAndFix;
