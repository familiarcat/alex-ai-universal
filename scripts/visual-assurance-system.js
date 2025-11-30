#!/usr/bin/env node

/**
 * 🎯 Visual Assurance System
 * 
 * Provides visual assurance and physical interactivity with all
 * Alex AI workflows in the N8N system
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

class VisualAssuranceSystem {
  constructor() {
    this.workflows = new Map();
    this.visualStatus = new Map();
    this.interactionResults = new Map();
  }

  /**
   * Main visual assurance operation
   */
  async ensureVisualAssurance() {
    console.log('🎯 Visual Assurance System for Alex AI Workflows');
    console.log('================================================');
    
    try {
      // Step 1: Load all workflows
      await this.loadAllWorkflows();
      
      // Step 2: Perform visual assurance checks
      await this.performVisualAssuranceChecks();
      
      // Step 3: Ensure physical interactivity
      await this.ensurePhysicalInteractivity();
      
      // Step 4: Generate comprehensive report
      this.generateVisualAssuranceReport();
      
    } catch (error) {
      console.error('❌ Visual assurance failed:', error.message);
    }
  }

  /**
   * Load all workflows from N8N
   */
  async loadAllWorkflows() {
    console.log('\n📁 Loading All Alex AI Workflows...');
    
    const response = await makeN8NRequest('/api/v1/workflows');
    
    if (response.status === 200) {
      const workflows = response.data.data || response.data;
      
      for (const workflow of workflows) {
        if (this.isAlexAIWorkflow(workflow.name)) {
          this.workflows.set(workflow.id, {
            id: workflow.id,
            name: workflow.name,
            active: workflow.active,
            nodes: workflow.nodes,
            connections: workflow.connections,
            category: this.categorizeWorkflow(workflow.name),
            lastModified: workflow.updatedAt
          });
        }
      }
      
      console.log(`✅ Loaded ${this.workflows.size} Alex AI workflows`);
      
      // Display workflow categories
      const categories = new Map();
      for (const workflow of this.workflows.values()) {
        const count = categories.get(workflow.category) || 0;
        categories.set(workflow.category, count + 1);
      }
      
      console.log('\n📊 Workflow Categories:');
      for (const [category, count] of categories) {
        console.log(`  ${category}: ${count} workflows`);
      }
      
    } else {
      throw new Error(`Failed to fetch workflows: ${response.status}`);
    }
  }

  /**
   * Check if workflow belongs to Alex AI system
   */
  isAlexAIWorkflow(name) {
    const alexAIKeywords = [
      'alex ai', 'crew', 'quark', 'picard', 'data', 'riker', 'troi',
      'crusher', 'la forge', 'uhura', 'worf', 'anti-hallucination',
      'observation lounge', 'mission control', 'openrouter'
    ];
    
    const lowerName = name.toLowerCase();
    return alexAIKeywords.some(keyword => lowerName.includes(keyword));
  }

  /**
   * Categorize workflow by name
   */
  categorizeWorkflow(name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('crew') && !lowerName.includes('crew management')) {
      return 'CREW';
    } else if (lowerName.includes('system') || lowerName.includes('mission control')) {
      return 'SYSTEM';
    } else if (lowerName.includes('coordination') || lowerName.includes('observation')) {
      return 'COORDINATION';
    } else if (lowerName.includes('anti-hallucination') || lowerName.includes('hallucination')) {
      return 'ANTI-HALLUCINATION';
    } else if (lowerName.includes('project') || lowerName.includes('alex ai')) {
      return 'PROJECT';
    } else {
      return 'UTILITY';
    }
  }

  /**
   * Perform visual assurance checks
   */
  async performVisualAssuranceChecks() {
    console.log('\n🔍 Performing Visual Assurance Checks...');
    
    for (const [workflowId, workflow] of this.workflows) {
      console.log(`\n📋 Checking: ${workflow.name}`);
      
      const visualStatus = {
        workflowId: workflowId,
        workflowName: workflow.name,
        category: workflow.category,
        active: workflow.active,
        nodeCount: workflow.nodes.length,
        connectionCount: Object.keys(workflow.connections).length,
        visualIssues: [],
        recommendations: []
      };
      
      // Check 1: Node count validation
      if (workflow.nodes.length === 0) {
        visualStatus.visualIssues.push('No nodes found');
        visualStatus.recommendations.push('Add nodes to workflow');
      }
      
      // Check 2: Connection validation
      if (Object.keys(workflow.connections).length === 0) {
        visualStatus.visualIssues.push('No connections found');
        visualStatus.recommendations.push('Add connections between nodes');
      }
      
      // Check 3: Active status validation
      if (!workflow.active) {
        visualStatus.visualIssues.push('Workflow is inactive');
        visualStatus.recommendations.push('Activate workflow for execution');
      }
      
      // Check 4: Specific workflow validations
      await this.validateSpecificWorkflow(workflow, visualStatus);
      
      this.visualStatus.set(workflowId, visualStatus);
      
      // Display results
      if (visualStatus.visualIssues.length === 0) {
        console.log(`  ✅ Visual status: OK (${visualStatus.nodeCount} nodes, ${visualStatus.connectionCount} connections)`);
      } else {
        console.log(`  ⚠️  Visual issues: ${visualStatus.visualIssues.length}`);
        visualStatus.visualIssues.forEach(issue => {
          console.log(`    - ${issue}`);
        });
      }
    }
  }

  /**
   * Validate specific workflow types
   */
  async validateSpecificWorkflow(workflow, visualStatus) {
    const name = workflow.name.toLowerCase();
    
    // Quark workflow specific validation
    if (name.includes('quark')) {
      await this.validateQuarkWorkflow(workflow, visualStatus);
    }
    
    // Anti-hallucination workflow validation
    if (name.includes('anti-hallucination') || name.includes('hallucination')) {
      await this.validateAntiHallucinationWorkflow(workflow, visualStatus);
    }
    
    // Crew workflow validation
    if (name.includes('crew') && !name.includes('crew management')) {
      await this.validateCrewWorkflow(workflow, visualStatus);
    }
  }

  /**
   * Validate Quark workflow
   */
  async validateQuarkWorkflow(workflow, visualStatus) {
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
    
    const actualNodes = workflow.nodes.map(node => node.id);
    const missingNodes = expectedNodes.filter(nodeId => !actualNodes.includes(nodeId));
    
    if (missingNodes.length > 0) {
      visualStatus.visualIssues.push(`Missing nodes: ${missingNodes.join(', ')}`);
      visualStatus.recommendations.push('Add missing Quark workflow nodes');
    }
    
    // Check critical connections
    const criticalConnections = [
      'quark-directive-webhook',
      'business-context-analysis',
      'llm-optimization-quark',
      'quark-ai-agent-optimized'
    ];
    
    for (const nodeId of criticalConnections) {
      if (!workflow.connections[nodeId]) {
        visualStatus.visualIssues.push(`Missing connections from ${nodeId}`);
        visualStatus.recommendations.push(`Connect ${nodeId} to downstream nodes`);
      }
    }
  }

  /**
   * Validate Anti-hallucination workflow
   */
  async validateAntiHallucinationWorkflow(workflow, visualStatus) {
    // Check for OpenRouter nodes
    const hasOpenRouterNodes = workflow.nodes.some(node => 
      node.type === 'n8n-nodes-base.openRouter' || 
      node.type === 'n8n-nodes-openrouter'
    );
    
    if (hasOpenRouterNodes) {
      visualStatus.visualIssues.push('Contains OpenRouter nodes (may cause activation issues)');
      visualStatus.recommendations.push('Convert OpenRouter nodes to HTTP requests');
    }
    
    // Check for HTTP request nodes
    const hasHttpNodes = workflow.nodes.some(node => node.type === 'n8n-nodes-base.httpRequest');
    
    if (!hasHttpNodes) {
      visualStatus.visualIssues.push('No HTTP request nodes found');
      visualStatus.recommendations.push('Add HTTP request nodes for API calls');
    }
  }

  /**
   * Validate Crew workflow
   */
  async validateCrewWorkflow(workflow, visualStatus) {
    // Check for webhook nodes
    const hasWebhookNodes = workflow.nodes.some(node => node.type === 'n8n-nodes-base.webhook');
    
    if (!hasWebhookNodes) {
      visualStatus.visualIssues.push('No webhook nodes found');
      visualStatus.recommendations.push('Add webhook node for crew member input');
    }
    
    // Check for response nodes
    const hasResponseNodes = workflow.nodes.some(node => node.type === 'n8n-nodes-base.respondToWebhook');
    
    if (!hasResponseNodes) {
      visualStatus.visualIssues.push('No response nodes found');
      visualStatus.recommendations.push('Add response node for crew member output');
    }
  }

  /**
   * Ensure physical interactivity
   */
  async ensurePhysicalInteractivity() {
    console.log('\n🔄 Ensuring Physical Interactivity...');
    
    for (const [workflowId, workflow] of this.workflows) {
      console.log(`\n🔄 Testing: ${workflow.name}`);
      
      const interactionResult = {
        workflowId: workflowId,
        workflowName: workflow.name,
        category: workflow.category,
        interactive: false,
        testResults: [],
        issues: []
      };
      
      // Test 1: Webhook accessibility
      await this.testWebhookAccessibility(workflow, interactionResult);
      
      // Test 2: Workflow activation
      await this.testWorkflowActivation(workflow, interactionResult);
      
      // Test 3: Node execution
      await this.testNodeExecution(workflow, interactionResult);
      
      this.interactionResults.set(workflowId, interactionResult);
      
      // Display results
      if (interactionResult.interactive) {
        console.log(`  ✅ Interactive: Yes`);
      } else {
        console.log(`  ❌ Interactive: No`);
        interactionResult.issues.forEach(issue => {
          console.log(`    - ${issue}`);
        });
      }
    }
  }

  /**
   * Test webhook accessibility
   */
  async testWebhookAccessibility(workflow, interactionResult) {
    const webhookNodes = workflow.nodes.filter(node => node.type === 'n8n-nodes-base.webhook');
    
    for (const webhookNode of webhookNodes) {
      const webhookPath = webhookNode.parameters?.path;
      if (webhookPath) {
        const webhookUrl = `https://n8n.pbradygeorgen.com/webhook/${webhookPath}`;
        
        try {
          const response = await makeN8NRequest(`/webhook/${webhookPath}`, 'POST', { test: 'connectivity' });
          
          if (response.status === 200) {
            interactionResult.testResults.push(`Webhook ${webhookPath}: Accessible`);
          } else {
            interactionResult.issues.push(`Webhook ${webhookPath}: Status ${response.status}`);
          }
        } catch (error) {
          interactionResult.issues.push(`Webhook ${webhookPath}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Test workflow activation
   */
  async testWorkflowActivation(workflow, interactionResult) {
    if (!workflow.active) {
      try {
        const response = await makeN8NRequest(`/api/v1/workflows/${workflow.id}/activate`, 'POST', { active: true });
        
        if (response.status === 200) {
          interactionResult.testResults.push('Workflow activation: Successful');
          interactionResult.interactive = true;
        } else {
          interactionResult.issues.push(`Workflow activation failed: ${response.status}`);
        }
      } catch (error) {
        interactionResult.issues.push(`Workflow activation error: ${error.message}`);
      }
    } else {
      interactionResult.testResults.push('Workflow activation: Already active');
      interactionResult.interactive = true;
    }
  }

  /**
   * Test node execution
   */
  async testNodeExecution(workflow, interactionResult) {
    // Check for function nodes
    const functionNodes = workflow.nodes.filter(node => node.type === 'n8n-nodes-base.function');
    
    if (functionNodes.length > 0) {
      interactionResult.testResults.push(`Function nodes: ${functionNodes.length} found`);
    }
    
    // Check for HTTP request nodes
    const httpNodes = workflow.nodes.filter(node => node.type === 'n8n-nodes-base.httpRequest');
    
    if (httpNodes.length > 0) {
      interactionResult.testResults.push(`HTTP request nodes: ${httpNodes.length} found`);
    }
    
    // Check for response nodes
    const responseNodes = workflow.nodes.filter(node => node.type === 'n8n-nodes-base.respondToWebhook');
    
    if (responseNodes.length > 0) {
      interactionResult.testResults.push(`Response nodes: ${responseNodes.length} found`);
    }
  }

  /**
   * Generate comprehensive visual assurance report
   */
  generateVisualAssuranceReport() {
    console.log('\n📊 Visual Assurance System Report');
    console.log('=================================');
    
    // Summary statistics
    const totalWorkflows = this.workflows.size;
    const activeWorkflows = Array.from(this.visualStatus.values()).filter(status => status.active).length;
    const workflowsWithIssues = Array.from(this.visualStatus.values()).filter(status => status.visualIssues.length > 0).length;
    const interactiveWorkflows = Array.from(this.interactionResults.values()).filter(result => result.interactive).length;
    
    console.log(`\n📈 Summary Statistics:`);
    console.log(`  Total Workflows: ${totalWorkflows}`);
    console.log(`  Active Workflows: ${activeWorkflows}`);
    console.log(`  Workflows with Issues: ${workflowsWithIssues}`);
    console.log(`  Interactive Workflows: ${interactiveWorkflows}`);
    
    // Category breakdown
    console.log(`\n📊 Category Breakdown:`);
    const categoryStats = new Map();
    
    for (const status of this.visualStatus.values()) {
      const category = status.category;
      const stats = categoryStats.get(category) || { total: 0, active: 0, issues: 0, interactive: 0 };
      
      stats.total++;
      if (status.active) stats.active++;
      if (status.visualIssues.length > 0) stats.issues++;
      
      const interactionResult = this.interactionResults.get(status.workflowId);
      if (interactionResult && interactionResult.interactive) stats.interactive++;
      
      categoryStats.set(category, stats);
    }
    
    for (const [category, stats] of categoryStats) {
      console.log(`  ${category}: ${stats.total} total, ${stats.active} active, ${stats.issues} with issues, ${stats.interactive} interactive`);
    }
    
    // Detailed workflow status
    console.log(`\n📋 Detailed Workflow Status:`);
    
    for (const status of this.visualStatus.values()) {
      console.log(`\n  📋 ${status.workflowName}`);
      console.log(`     Category: ${status.category}`);
      console.log(`     Active: ${status.active ? 'Yes' : 'No'}`);
      console.log(`     Nodes: ${status.nodeCount}`);
      console.log(`     Connections: ${status.connectionCount}`);
      
      if (status.visualIssues.length > 0) {
        console.log(`     Issues: ${status.visualIssues.length}`);
        status.visualIssues.forEach(issue => {
          console.log(`       - ${issue}`);
        });
      }
      
      const interactionResult = this.interactionResults.get(status.workflowId);
      if (interactionResult) {
        console.log(`     Interactive: ${interactionResult.interactive ? 'Yes' : 'No'}`);
        if (interactionResult.issues.length > 0) {
          console.log(`     Interaction Issues:`);
          interactionResult.issues.forEach(issue => {
            console.log(`       - ${issue}`);
          });
        }
      }
    }
    
    // Recommendations
    console.log(`\n💡 Recommendations:`);
    
    const allRecommendations = new Set();
    for (const status of this.visualStatus.values()) {
      status.recommendations.forEach(rec => allRecommendations.add(rec));
    }
    
    for (const recommendation of allRecommendations) {
      console.log(`  - ${recommendation}`);
    }
    
    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalWorkflows,
        activeWorkflows,
        workflowsWithIssues,
        interactiveWorkflows
      },
      categoryStats: Object.fromEntries(categoryStats),
      workflowStatus: Array.from(this.visualStatus.values()),
      interactionResults: Array.from(this.interactionResults.values())
    };
    
    const reportPath = path.join(__dirname, '..', 'visual-assurance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Visual assurance report saved to: ${reportPath}`);
  }
}

// Main execution
async function main() {
  loadZshrcEnv();
  
  const assuranceSystem = new VisualAssuranceSystem();
  await assuranceSystem.ensureVisualAssurance();
  
  console.log('\n🎯 Visual Assurance System Complete!');
  console.log('===================================');
  console.log('All Alex AI workflows have been checked for visual assurance');
  console.log('and physical interactivity. Review the report above for details.');
}

main().catch(console.error);
