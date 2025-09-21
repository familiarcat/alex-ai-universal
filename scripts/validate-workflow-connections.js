#!/usr/bin/env node

/**
 * 🔍 Validate Workflow Connections
 * 
 * Validates that workflow connections follow proper order of operations
 * and can be integrated into the bi-directional sync system
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

class WorkflowConnectionsValidator {
  constructor() {
    this.workflowId = 'L6K4bzSKlGC36ABL';
    this.validationRules = this.getValidationRules();
  }

  /**
   * Get validation rules for different workflow types
   */
  getValidationRules() {
    return {
      'quark': {
        name: 'Quark Workflow',
        requiredConnections: [
          {
            from: 'quark-directive-webhook',
            to: ['business-context-analysis', 'quark-memory-retrieval'],
            description: 'Webhook must connect to both Business Context and Memory Retrieval'
          },
          {
            from: 'business-context-analysis',
            to: ['llm-optimization-quark'],
            description: 'Business Context must connect to LLM Optimization'
          },
          {
            from: 'llm-optimization-quark',
            to: ['quark-ai-agent-optimized'],
            description: 'LLM Optimization must connect to AI Agent'
          },
          {
            from: 'quark-memory-retrieval',
            to: ['quark-ai-agent-optimized'],
            description: 'Memory Retrieval must connect to AI Agent'
          },
          {
            from: 'quark-ai-agent-optimized',
            to: ['quark-memory-storage-optimized', 'observation-lounge-quark'],
            description: 'AI Agent must connect to both Memory Storage and Observation Lounge'
          },
          {
            from: 'quark-memory-storage-optimized',
            to: ['quark-response-optimized'],
            description: 'Memory Storage must connect to Response'
          },
          {
            from: 'observation-lounge-quark',
            to: ['quark-response-optimized'],
            description: 'Observation Lounge must connect to Response'
          }
        ],
        parallelBranches: [
          {
            name: 'Business Context Branch',
            path: ['business-context-analysis', 'llm-optimization-quark', 'quark-ai-agent-optimized']
          },
          {
            name: 'Memory Retrieval Branch',
            path: ['quark-memory-retrieval', 'quark-ai-agent-optimized']
          },
          {
            name: 'Memory Storage Branch',
            path: ['quark-ai-agent-optimized', 'quark-memory-storage-optimized', 'quark-response-optimized']
          },
          {
            name: 'Observation Lounge Branch',
            path: ['quark-ai-agent-optimized', 'observation-lounge-quark', 'quark-response-optimized']
          }
        ]
      }
    };
  }

  /**
   * Validate workflow connections
   */
  async validateWorkflowConnections() {
    console.log('🔍 Validating Workflow Connections');
    console.log('=================================');
    
    try {
      // Step 1: Get workflow
      const workflow = await this.getWorkflow();
      
      // Step 2: Identify workflow type
      const workflowType = this.identifyWorkflowType(workflow);
      
      // Step 3: Validate connections
      const validationResults = this.validateConnections(workflow, workflowType);
      
      // Step 4: Generate report
      this.generateValidationReport(validationResults);
      
      // Step 5: Provide recommendations
      this.provideRecommendations(validationResults);
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
    }
  }

  /**
   * Get workflow
   */
  async getWorkflow() {
    console.log('\n📋 Getting Workflow...');
    
    const response = await makeN8NRequest(`/api/v1/workflows/${this.workflowId}`);
    
    if (response.status === 200) {
      const workflow = response.data;
      console.log(`✅ Workflow: ${workflow.name}`);
      console.log(`✅ Nodes: ${workflow.nodes.length}`);
      console.log(`✅ Connections: ${Object.keys(workflow.connections).length}`);
      return workflow;
    } else {
      throw new Error(`Failed to fetch workflow: ${response.status}`);
    }
  }

  /**
   * Identify workflow type
   */
  identifyWorkflowType(workflow) {
    const name = workflow.name.toLowerCase();
    
    if (name.includes('quark')) {
      return 'quark';
    }
    
    // Add more workflow types as needed
    return 'unknown';
  }

  /**
   * Validate connections against rules
   */
  validateConnections(workflow, workflowType) {
    console.log(`\n🔍 Validating ${workflowType} workflow connections...`);
    
    const rules = this.validationRules[workflowType];
    if (!rules) {
      console.log(`⚠️  No validation rules found for ${workflowType} workflow`);
      return { valid: false, errors: ['Unknown workflow type'] };
    }
    
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      passedValidations: []
    };
    
    // Validate required connections
    for (const rule of rules.requiredConnections) {
      const validation = this.validateConnection(workflow, rule);
      
      if (validation.valid) {
        results.passedValidations.push(validation);
        console.log(`✅ ${rule.description}`);
      } else {
        results.valid = false;
        results.errors.push(validation.error);
        console.log(`❌ ${rule.description}: ${validation.error}`);
      }
    }
    
    // Validate parallel branches
    for (const branch of rules.parallelBranches) {
      const validation = this.validateParallelBranch(workflow, branch);
      
      if (validation.valid) {
        console.log(`✅ ${branch.name}: Valid parallel branch`);
      } else {
        results.warnings.push(`${branch.name}: ${validation.error}`);
        console.log(`⚠️  ${branch.name}: ${validation.error}`);
      }
    }
    
    return results;
  }

  /**
   * Validate a specific connection
   */
  validateConnection(workflow, rule) {
    const connections = workflow.connections;
    
    if (!connections[rule.from]) {
      return {
        valid: false,
        error: `Node ${rule.from} has no connections`
      };
    }
    
    const actualTargets = connections[rule.from].main[0].map(conn => conn.node);
    const missingTargets = rule.to.filter(target => !actualTargets.includes(target));
    
    if (missingTargets.length > 0) {
      return {
        valid: false,
        error: `Missing connections to: ${missingTargets.join(', ')}`
      };
    }
    
    return {
      valid: true,
      description: rule.description
    };
  }

  /**
   * Validate parallel branch
   */
  validateParallelBranch(workflow, branch) {
    const connections = workflow.connections;
    
    for (let i = 0; i < branch.path.length - 1; i++) {
      const from = branch.path[i];
      const to = branch.path[i + 1];
      
      if (!connections[from]) {
        return {
          valid: false,
          error: `Node ${from} has no connections`
        };
      }
      
      const actualTargets = connections[from].main[0].map(conn => conn.node);
      if (!actualTargets.includes(to)) {
        return {
          valid: false,
          error: `Missing connection from ${from} to ${to}`
        };
      }
    }
    
    return {
      valid: true
    };
  }

  /**
   * Generate validation report
   */
  generateValidationReport(results) {
    console.log('\n📊 VALIDATION REPORT');
    console.log('===================');
    
    console.log(`\n✅ Passed Validations: ${results.passedValidations.length}`);
    results.passedValidations.forEach(validation => {
      console.log(`  - ${validation.description}`);
    });
    
    if (results.errors.length > 0) {
      console.log(`\n❌ Errors: ${results.errors.length}`);
      results.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
    
    if (results.warnings.length > 0) {
      console.log(`\n⚠️  Warnings: ${results.warnings.length}`);
      results.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }
    
    console.log(`\n🎯 Overall Status: ${results.valid ? '✅ VALID' : '❌ INVALID'}`);
  }

  /**
   * Provide recommendations
   */
  provideRecommendations(results) {
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    
    if (results.valid) {
      console.log('✅ Workflow connections are valid!');
      console.log('✅ No corrections needed');
      console.log('✅ Ready for production use');
    } else {
      console.log('🔧 Corrections needed:');
      console.log('1. Run the connection correction script');
      console.log('2. Verify connections in N8N UI');
      console.log('3. Test workflow execution');
      console.log('4. Update bi-directional sync system');
    }
    
    if (results.warnings.length > 0) {
      console.log('\n⚠️  Consider addressing warnings for optimal performance');
    }
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const validator = new WorkflowConnectionsValidator();
  await validator.validateWorkflowConnections();
  
  console.log('\n🎯 Workflow Connections Validation Complete!');
  console.log('===========================================');
  console.log('Use this validation system in your bi-directional sync');
  console.log('to ensure proper order of operations is maintained.');
}

main().catch(console.error);
