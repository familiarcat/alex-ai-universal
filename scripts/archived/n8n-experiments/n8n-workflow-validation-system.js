#!/usr/bin/env node

/**
 * N8N Workflow Validation System
 * Comprehensive validation and testing for all N8N workflows
 */

// Use native fetch (Node >=18)
const fs = require('fs').promises;
const path = require('path');

class N8NWorkflowValidationSystem {
  constructor() {
    this.n8nApiKey = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTA3ZGJlZi0yZDJmLTQ2YjUtYWQ3ZC0yYjIzZTk2ZWE1NjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU2MDk3MjIyfQ.wFPf3jA0X2zdNkaPqoPzTEAE-MsS-XcM6Gk20KYr4Dw';
    this.n8nBaseUrl = process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com';
    this.supabaseUrl = process.env.SUPABASE_URL || 'https://rpkkkbufdwxmjaerbhbn.supabase.co';
    this.openRouterUrl = 'https://api.openrouter.ai/api/v1/chat/completions';
    
    this.headers = {
      'X-N8N-API-KEY': this.n8nApiKey,
      'Content-Type': 'application/json'
    };
    
    // Standard crew workflow validation rules
    this.crewValidationRules = {
      requiredNodes: [
        'Directive',
        'Memory Retrieval',
        'LLM Selection Agent', 
        'AI Agent',
        'Memory Storage',
        'Observation Lounge Communication',
        'Response'
      ],
      requiredConnections: [
        'Directive -> Memory Retrieval',
        'Directive -> LLM Selection Agent',
        'Memory Retrieval -> LLM Selection Agent',
        'LLM Selection Agent -> AI Agent',
        'AI Agent -> Observation Lounge Communication',
        'Observation Lounge Communication -> Memory Storage',
        'Memory Storage -> Response'
      ],
      nodeCount: 7,
      webhookMethod: 'POST',
      requiredApis: ['supabase', 'openrouter']
    };
  }

  async log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
  }

  async getAllWorkflows() {
    try {
      const res = await fetch(`${this.n8nBaseUrl}/api/v1/workflows`, { headers: this.headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      this.log(`Failed to fetch workflows: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async getWorkflow(workflowId) {
    try {
      const res = await fetch(`${this.n8nBaseUrl}/api/v1/workflows/${workflowId}`, { headers: this.headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      this.log(`Failed to fetch workflow ${workflowId}: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async getWorkflowExecutions(workflowId, limit = 10) {
    try {
      const url = new URL(`${this.n8nBaseUrl}/api/v1/executions`);
      url.searchParams.set('workflowId', workflowId);
      url.searchParams.set('limit', String(limit));
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      this.log(`Failed to fetch executions for workflow ${workflowId}: ${error.message}`, 'ERROR');
      return { data: [] };
    }
  }

  validateCrewWorkflow(workflow) {
    const validation = {
      workflowId: workflow.id,
      workflowName: workflow.name,
      isValid: true,
      issues: [],
      warnings: [],
      score: 100
    };

    // Check node count
    if (workflow.nodes.length !== this.crewValidationRules.nodeCount) {
      validation.issues.push(`Incorrect node count: ${workflow.nodes.length} (expected ${this.crewValidationRules.nodeCount})`);
      validation.score -= 20;
    }

    // Check required nodes
    const nodeNames = workflow.nodes.map(node => node.name);
    const missingNodes = this.crewValidationRules.requiredNodes.filter(required => 
      !nodeNames.some(name => name.includes(required))
    );

    if (missingNodes.length > 0) {
      validation.issues.push(`Missing required nodes: ${missingNodes.join(', ')}`);
      validation.score -= missingNodes.length * 10;
    }

    // Check webhook configuration
    const webhookNode = workflow.nodes.find(node => node.type === 'n8n-nodes-base.webhook');
    if (webhookNode) {
      if (webhookNode.parameters.httpMethod !== this.crewValidationRules.webhookMethod) {
        validation.issues.push(`Incorrect webhook method: ${webhookNode.parameters.httpMethod} (expected POST)`);
        validation.score -= 10;
      }
    } else {
      validation.issues.push('No webhook node found');
      validation.score -= 30;
    }

    // Check API endpoints
    const httpNodes = workflow.nodes.filter(node => node.type === 'n8n-nodes-base.httpRequest');
    const hasSupabase = httpNodes.some(node => node.parameters.url?.includes('supabase'));
    const hasOpenRouter = httpNodes.some(node => node.parameters.url?.includes('openrouter'));

    if (!hasSupabase) {
      validation.issues.push('Missing Supabase API integration');
      validation.score -= 15;
    }

    if (!hasOpenRouter) {
      validation.issues.push('Missing OpenRouter API integration');
      validation.score -= 15;
    }

    // Check connections
    if (!workflow.connections || Object.keys(workflow.connections).length === 0) {
      validation.issues.push('No connections defined');
      validation.score -= 20;
    }

    // Check for proper error handling
    const hasErrorHandling = workflow.nodes.some(node => 
      node.parameters?.continueOnFail || 
      node.parameters?.retryOnFail
    );
    
    if (!hasErrorHandling) {
      validation.warnings.push('No error handling configured');
      validation.score -= 5;
    }

    validation.isValid = validation.issues.length === 0;
    validation.score = Math.max(0, validation.score);

    return validation;
  }

  async testWorkflowExecution(workflowId, testData = {}) {
    const testResult = {
      workflowId,
      success: false,
      executionTime: 0,
      error: null,
      response: null,
      timestamp: new Date().toISOString()
    };

    const startTime = Date.now();

    try {
      // Get workflow details
      const workflow = await this.getWorkflow(workflowId);
      
      // Find webhook URL
      const webhookNode = workflow.nodes.find(node => node.type === 'n8n-nodes-base.webhook');
      if (!webhookNode) {
        throw new Error('No webhook node found in workflow');
      }

      const webhookUrl = `${this.n8nBaseUrl}/webhook/${webhookNode.parameters.path}`;
      
      // Prepare test data
      const defaultTestData = {
        prompt: "Test prompt for workflow validation",
        message: "This is a test message to validate workflow execution",
        timestamp: new Date().toISOString()
      };

      const payload = { ...defaultTestData, ...testData };

      // Execute workflow
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => ({}));
      testResult.success = true;
      testResult.response = data;
      testResult.executionTime = Date.now() - startTime;

      this.log(`Workflow ${workflowId} executed successfully in ${testResult.executionTime}ms`, 'SUCCESS');

    } catch (error) {
      testResult.error = error.message;
      testResult.executionTime = Date.now() - startTime;
      this.log(`Workflow ${workflowId} execution failed: ${error.message}`, 'ERROR');
    }

    return testResult;
  }

  async validateAllWorkflows() {
    this.log('Starting comprehensive workflow validation...', 'INFO');
    
    const workflowsResp = await this.getAllWorkflows();
    const workflows = Array.isArray(workflowsResp) ? workflowsResp : (workflowsResp.data || []);
    const validationResults = {
      timestamp: new Date().toISOString(),
      totalWorkflows: workflows.length,
      crewWorkflows: [],
      systemWorkflows: [],
      projectWorkflows: [],
      validationSummary: {
        totalValidated: 0,
        validWorkflows: 0,
        invalidWorkflows: 0,
        averageScore: 0
      }
    };

    let totalScore = 0;

    for (const workflow of workflows) {
      if (workflow.name.includes('CREW -')) {
        const validation = this.validateCrewWorkflow(workflow);
        validationResults.crewWorkflows.push(validation);
        validationResults.validationSummary.totalValidated++;
        totalScore += validation.score;

        if (validation.isValid) {
          validationResults.validationSummary.validWorkflows++;
        } else {
          validationResults.validationSummary.invalidWorkflows++;
        }

        this.log(`Validated crew workflow: ${workflow.name} (Score: ${validation.score})`, 
          validation.isValid ? 'SUCCESS' : 'WARNING');
      }
    }

    validationResults.validationSummary.averageScore = 
      validationResults.validationSummary.totalValidated > 0 
        ? Math.round(totalScore / validationResults.validationSummary.totalValidated)
        : 0;

    return validationResults;
  }

  async performEndToEndTesting() {
    this.log('Performing end-to-end workflow testing...', 'INFO');
    
    const workflowsResp = await this.getAllWorkflows();
    const workflows = Array.isArray(workflowsResp) ? workflowsResp : (workflowsResp.data || []);
    const crewWorkflows = workflows.filter((w) => (w.name || '').includes('CREW -'));
    
    const testResults = {
      timestamp: new Date().toISOString(),
      workflowsTested: [],
      summary: {
        totalTested: 0,
        successful: 0,
        failed: 0,
        averageExecutionTime: 0
      }
    };

    let totalExecutionTime = 0;

    // Test each crew workflow
    for (const workflow of crewWorkflows.slice(0, 3)) { // Test first 3 for now
      this.log(`Testing workflow: ${workflow.name}`, 'INFO');
      
      const testResult = await this.testWorkflowExecution(workflow.id, {
        prompt: `Test prompt for ${workflow.name} - validation testing`,
        testMode: true
      });

      testResults.workflowsTested.push({
        workflowId: workflow.id,
        workflowName: workflow.name,
        ...testResult
      });

      testResults.summary.totalTested++;
      totalExecutionTime += testResult.executionTime;

      if (testResult.success) {
        testResults.summary.successful++;
      } else {
        testResults.summary.failed++;
      }
    }

    testResults.summary.averageExecutionTime = 
      testResults.summary.totalTested > 0 
        ? Math.round(totalExecutionTime / testResults.summary.totalTested)
        : 0;

    return testResults;
  }

  async checkWorkflowHealth() {
    this.log('Checking workflow health and performance...', 'INFO');
    
    const workflowsResp = await this.getAllWorkflows();
    const workflows = Array.isArray(workflowsResp) ? workflowsResp : (workflowsResp.data || []);
    const healthReport = {
      timestamp: new Date().toISOString(),
      workflowHealth: [],
      performanceMetrics: {
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter(w => w.active).length,
        inactiveWorkflows: workflows.filter(w => !w.active).length,
        recentlyUpdated: workflows.filter(w => {
          const updateTime = new Date(w.updatedAt);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return updateTime > dayAgo;
        }).length
      }
    };

    for (const workflow of workflows) {
      const executions = await this.getWorkflowExecutions(workflow.id, 5);
      const recentExecutions = executions.data || [];
      
      const health = {
        workflowId: workflow.id,
        workflowName: workflow.name,
        active: workflow.active,
        lastExecution: recentExecutions[0]?.startedAt || 'Never',
        executionCount: recentExecutions.length,
        successRate: recentExecutions.length > 0 
          ? (recentExecutions.filter(e => e.finished && !e.stoppedAt).length / recentExecutions.length) * 100
          : 0,
        averageExecutionTime: recentExecutions.length > 0
          ? recentExecutions.reduce((sum, e) => sum + (e.stoppedAt ? new Date(e.stoppedAt) - new Date(e.startedAt) : 0), 0) / recentExecutions.length
          : 0
      };

      healthReport.workflowHealth.push(health);
    }

    return healthReport;
  }

  async generateComprehensiveReport() {
    this.log('Generating comprehensive validation report...', 'INFO');
    
    const validationResults = await this.validateAllWorkflows();
    const testResults = await this.performEndToEndTesting();
    const healthReport = await this.checkWorkflowHealth();

    const comprehensiveReport = {
      timestamp: new Date().toISOString(),
      validation: validationResults,
      testing: testResults,
      health: healthReport,
      recommendations: this.generateRecommendations(validationResults, testResults, healthReport)
    };

    // Save report to file
    await fs.writeFile(
      path.join(__dirname, 'n8n-validation-report.json'),
      JSON.stringify(comprehensiveReport, null, 2)
    );

    this.log('Comprehensive validation report generated: n8n-validation-report.json', 'SUCCESS');
    return comprehensiveReport;
  }

  generateRecommendations(validation, testing, health) {
    const recommendations = [];

    // Validation recommendations
    if (validation.validationSummary.invalidWorkflows > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'VALIDATION',
        issue: `${validation.validationSummary.invalidWorkflows} workflows failed validation`,
        recommendation: 'Fix workflow structure issues and missing components'
      });
    }

    if (validation.validationSummary.averageScore < 80) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'QUALITY',
        issue: 'Low average validation score',
        recommendation: 'Improve workflow configuration and error handling'
      });
    }

    // Testing recommendations
    if (testing.summary.failed > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'EXECUTION',
        issue: `${testing.summary.failed} workflow tests failed`,
        recommendation: 'Debug and fix workflow execution issues'
      });
    }

    if (testing.summary.averageExecutionTime > 10000) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'PERFORMANCE',
        issue: 'Slow workflow execution times',
        recommendation: 'Optimize workflow performance and API calls'
      });
    }

    // Health recommendations
    if (health.performanceMetrics.inactiveWorkflows > 0) {
      recommendations.push({
        priority: 'LOW',
        category: 'MAINTENANCE',
        issue: `${health.performanceMetrics.inactiveWorkflows} inactive workflows`,
        recommendation: 'Review and activate necessary workflows or archive unused ones'
      });
    }

    return recommendations;
  }

  async runFullValidation() {
    this.log('Starting full N8N workflow validation...', 'INFO');
    
    try {
      const report = await this.generateComprehensiveReport();
      
      this.log('Full validation completed successfully!', 'SUCCESS');
      return report;
      
    } catch (error) {
      this.log(`Validation failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Main execution
async function main() {
  const validationSystem = new N8NWorkflowValidationSystem();
  
  try {
    const report = await validationSystem.runFullValidation();
    
    console.log('\n🔍 N8N WORKFLOW VALIDATION COMPLETE!');
    console.log('====================================');
    console.log(`📊 Total Workflows: ${report.validation.totalWorkflows}`);
    console.log(`✅ Valid Workflows: ${report.validation.validationSummary.validWorkflows}`);
    console.log(`❌ Invalid Workflows: ${report.validation.validationSummary.invalidWorkflows}`);
    console.log(`📈 Average Score: ${report.validation.validationSummary.averageScore}%`);
    console.log(`🧪 Tests Performed: ${report.testing.summary.totalTested}`);
    console.log(`✅ Successful Tests: ${report.testing.summary.successful}`);
    console.log(`❌ Failed Tests: ${report.testing.summary.failed}`);
    console.log(`⏱️  Average Execution Time: ${report.testing.summary.averageExecutionTime}ms`);
    console.log('\n📋 Detailed report saved to n8n-validation-report.json');
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority}] ${rec.issue}`);
        console.log(`   → ${rec.recommendation}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = N8NWorkflowValidationSystem;
