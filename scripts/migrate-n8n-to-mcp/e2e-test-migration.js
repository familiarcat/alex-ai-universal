#!/usr/bin/env node
/**
 * End-to-End Migration Testing System
 * 
 * Tests migrated MCP tools against original n8n workflows
 * to ensure feature parity and correctness.
 * 
 * Usage:
 *   node scripts/migrate-n8n-to-mcp/e2e-test-migration.js <workflow-name>
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { loadSupabaseCredentials } = require('../utils/secure-credential-loader');

class E2EMigrationTester {
  constructor() {
    this.testResults = [];
    this.supabase = null;
  }

  /**
   * Initialize Supabase client
   */
  initializeSupabase() {
    const creds = loadSupabaseCredentials();
    this.supabase = createClient(creds.url, creds.serviceKey);
  }

  /**
   * Test n8n workflow vs MCP tool
   */
  async testWorkflowMigration(workflowName, n8nWorkflow, mcpTool) {
    console.log(`\n🧪 Testing: ${workflowName}\n`);

    const testResult = {
      workflowName,
      tests: [],
      passed: 0,
      failed: 0,
      status: 'pending'
    };

    // Test 1: Functionality parity
    await this.testFunctionalityParity(workflowName, n8nWorkflow, mcpTool, testResult);

    // Test 2: Input/output format
    await this.testInputOutputFormat(workflowName, n8nWorkflow, mcpTool, testResult);

    // Test 3: Error handling
    await this.testErrorHandling(workflowName, n8nWorkflow, mcpTool, testResult);

    // Test 4: Performance comparison
    await this.testPerformance(workflowName, n8nWorkflow, mcpTool, testResult);

    // Calculate results
    testResult.passed = testResult.tests.filter(t => t.status === 'passed').length;
    testResult.failed = testResult.tests.filter(t => t.status === 'failed').length;
    testResult.status = testResult.failed === 0 ? 'passed' : 'failed';

    this.testResults.push(testResult);
    return testResult;
  }

  /**
   * Test functionality parity
   */
  async testFunctionalityParity(workflowName, n8nWorkflow, mcpTool, testResult) {
    const test = {
      name: 'Functionality Parity',
      status: 'pending',
      details: []
    };

    try {
      // Extract expected functionality from n8n workflow
      const n8nFunctionality = this.extractN8NFunctionality(n8nWorkflow);
      
      // Check if MCP tool provides equivalent functionality
      const mcpFunctionality = this.extractMCPFunctionality(mcpTool);

      // Compare
      const missing = n8nFunctionality.filter(f => 
        !mcpFunctionality.some(mf => this.functionalityMatches(f, mf))
      );

      if (missing.length === 0) {
        test.status = 'passed';
        test.details.push('All n8n functionality is present in MCP tool');
      } else {
        test.status = 'failed';
        test.details.push(`Missing functionality: ${missing.map(m => m.type).join(', ')}`);
      }

      testResult.tests.push(test);
    } catch (error) {
      test.status = 'failed';
      test.details.push(`Error: ${error.message}`);
      testResult.tests.push(test);
    }
  }

  /**
   * Test input/output format
   */
  async testInputOutputFormat(workflowName, n8nWorkflow, mcpTool, testResult) {
    const test = {
      name: 'Input/Output Format',
      status: 'pending',
      details: []
    };

    try {
      // Get sample input from n8n workflow
      const sampleInput = this.getSampleInput(n8nWorkflow);
      
      // Test MCP tool with sample input
      if (mcpTool && typeof mcpTool === 'function') {
        const mcpOutput = await mcpTool(sampleInput);
        const n8nExpectedOutput = this.getExpectedOutput(n8nWorkflow, sampleInput);

        // Compare outputs
        if (this.outputsMatch(mcpOutput, n8nExpectedOutput)) {
          test.status = 'passed';
          test.details.push('Input/output format matches n8n workflow');
        } else {
          test.status = 'failed';
          test.details.push('Input/output format does not match');
          test.details.push(`MCP output: ${JSON.stringify(mcpOutput).substring(0, 200)}`);
          test.details.push(`Expected: ${JSON.stringify(n8nExpectedOutput).substring(0, 200)}`);
        }
      } else {
        test.status = 'skipped';
        test.details.push('MCP tool not yet implemented');
      }

      testResult.tests.push(test);
    } catch (error) {
      test.status = 'failed';
      test.details.push(`Error: ${error.message}`);
      testResult.tests.push(test);
    }
  }

  /**
   * Test error handling
   */
  async testErrorHandling(workflowName, n8nWorkflow, mcpTool, testResult) {
    const test = {
      name: 'Error Handling',
      status: 'pending',
      details: []
    };

    try {
      // Test with invalid input
      const invalidInput = { invalid: 'data' };

      if (mcpTool && typeof mcpTool === 'function') {
        try {
          await mcpTool(invalidInput);
          test.status = 'failed';
          test.details.push('MCP tool did not handle invalid input');
        } catch (error) {
          test.status = 'passed';
          test.details.push('MCP tool properly handles invalid input');
        }
      } else {
        test.status = 'skipped';
        test.details.push('MCP tool not yet implemented');
      }

      testResult.tests.push(test);
    } catch (error) {
      test.status = 'failed';
      test.details.push(`Error: ${error.message}`);
      testResult.tests.push(test);
    }
  }

  /**
   * Test performance
   */
  async testPerformance(workflowName, n8nWorkflow, mcpTool, testResult) {
    const test = {
      name: 'Performance',
      status: 'pending',
      details: []
    };

    try {
      const sampleInput = this.getSampleInput(n8nWorkflow);

      if (mcpTool && typeof mcpTool === 'function') {
        // Measure MCP performance
        const mcpStart = Date.now();
        await mcpTool(sampleInput);
        const mcpTime = Date.now() - mcpStart;

        // Estimate n8n performance (would need actual n8n API call)
        const n8nEstimatedTime = this.estimateN8NPerformance(n8nWorkflow);

        test.status = 'passed';
        test.details.push(`MCP time: ${mcpTime}ms`);
        test.details.push(`Estimated n8n time: ${n8nEstimatedTime}ms`);
        
        if (mcpTime > n8nEstimatedTime * 2) {
          test.status = 'warning';
          test.details.push('MCP is significantly slower than n8n');
        }
      } else {
        test.status = 'skipped';
        test.details.push('MCP tool not yet implemented');
      }

      testResult.tests.push(test);
    } catch (error) {
      test.status = 'failed';
      test.details.push(`Error: ${error.message}`);
      testResult.tests.push(test);
    }
  }

  /**
   * Extract functionality from n8n workflow
   */
  extractN8NFunctionality(workflow) {
    const functionality = [];
    
    if (workflow.nodes) {
      for (const node of workflow.nodes) {
        if (node.type?.includes('supabase')) {
          functionality.push({ type: 'supabase', operation: node.parameters?.operation });
        }
        if (node.type?.includes('openrouter')) {
          functionality.push({ type: 'openrouter', model: node.parameters?.model });
        }
        if (node.type?.includes('function') || node.type?.includes('code')) {
          functionality.push({ type: 'code_execution' });
        }
      }
    }

    return functionality;
  }

  /**
   * Extract functionality from MCP tool
   */
  extractMCPFunctionality(mcpTool) {
    // This would analyze the MCP tool implementation
    // For now, return based on tool name/type
    return [{ type: 'mcp_tool' }];
  }

  /**
   * Check if functionality matches
   */
  functionalityMatches(n8nFunc, mcpFunc) {
    return n8nFunc.type === mcpFunc.type;
  }

  /**
   * Get sample input from workflow
   */
  getSampleInput(workflow) {
    // Extract from webhook parameters or default
    return { test: 'data' };
  }

  /**
   * Get expected output
   */
  getExpectedOutput(workflow, input) {
    // This would simulate n8n workflow execution
    return { success: true, data: input };
  }

  /**
   * Check if outputs match
   */
  outputsMatch(mcpOutput, expectedOutput) {
    return JSON.stringify(mcpOutput) === JSON.stringify(expectedOutput);
  }

  /**
   * Estimate n8n performance
   */
  estimateN8NPerformance(workflow) {
    const nodeCount = workflow.nodes?.length || 0;
    return nodeCount * 100; // Rough estimate: 100ms per node
  }

  /**
   * Generate test report
   */
  generateReport() {
    const totalTests = this.testResults.reduce((sum, r) => sum + r.tests.length, 0);
    const passedTests = this.testResults.reduce((sum, r) => sum + r.passed, 0);
    const failedTests = this.testResults.reduce((sum, r) => sum + r.failed, 0);

    return {
      summary: {
        totalWorkflows: this.testResults.length,
        totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) + '%' : '0%'
      },
      results: this.testResults
    };
  }
}

// CLI usage
if (require.main === module) {
  const tester = new E2EMigrationTester();
  tester.initializeSupabase();

  const workflowName = process.argv[2];
  
  if (!workflowName) {
    console.error('Usage: node e2e-test-migration.js <workflow-name>');
    process.exit(1);
  }

  // This would load the workflow and MCP tool
  // For now, just demonstrate structure
  console.log(`Testing migration for: ${workflowName}`);
  console.log('E2E testing system ready');
}

module.exports = { E2EMigrationTester };

