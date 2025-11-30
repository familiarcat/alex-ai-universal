#!/usr/bin/env node
/**
 * N8N Workflow Analyzer
 * 
 * Analyzes n8n workflow JSON files to extract functionality
 * and map to MCP tool equivalents.
 * 
 * Usage:
 *   node scripts/migrate-n8n-to-mcp/analyze-n8n-workflow.js <workflow-file.json>
 */

const fs = require('fs');
const path = require('path');

class N8NWorkflowAnalyzer {
  constructor(workflowPath) {
    this.workflowPath = workflowPath;
    this.workflow = null;
    this.analysis = {
      name: null,
      webhook: null,
      nodes: [],
      functionality: [],
      mcpMapping: [],
      dependencies: [],
      complexity: 'low'
    };
  }

  /**
   * Load and parse workflow JSON
   */
  load() {
    try {
      const content = fs.readFileSync(this.workflowPath, 'utf8');
      this.workflow = JSON.parse(content);
      this.analysis.name = this.workflow.name || path.basename(this.workflowPath, '.json');
      return true;
    } catch (error) {
      throw new Error(`Failed to load workflow: ${error.message}`);
    }
  }

  /**
   * Analyze workflow structure
   */
  analyze() {
    if (!this.workflow) {
      throw new Error('Workflow not loaded. Call load() first.');
    }

    // Find webhook trigger
    this.findWebhook();

    // Analyze nodes
    this.analyzeNodes();

    // Extract functionality
    this.extractFunctionality();

    // Map to MCP tools
    this.mapToMCP();

    // Assess complexity
    this.assessComplexity();

    return this.analysis;
  }

  /**
   * Find webhook trigger node
   */
  findWebhook() {
    if (!this.workflow.nodes) return;

    const webhookNode = this.workflow.nodes.find(
      node => node.type === 'n8n-nodes-base.webhook'
    );

    if (webhookNode) {
      this.analysis.webhook = {
        path: webhookNode.parameters?.path || webhookNode.parameters?.path?.toString() || 'unknown',
        method: webhookNode.parameters?.httpMethod || 'POST',
        nodeId: webhookNode.id
      };
    }
  }

  /**
   * Analyze all nodes in workflow
   */
  analyzeNodes() {
    if (!this.workflow.nodes) return;

    for (const node of this.workflow.nodes) {
      const nodeAnalysis = {
        id: node.id,
        name: node.name,
        type: node.type,
        functionality: this.analyzeNode(node),
        parameters: node.parameters || {}
      };

      this.analysis.nodes.push(nodeAnalysis);
    }
  }

  /**
   * Analyze individual node
   */
  analyzeNode(node) {
    const nodeType = node.type || '';
    const functionality = [];

    // HTTP Request nodes
    if (nodeType.includes('httpRequest')) {
      const url = node.parameters?.url || node.parameters?.url?.toString() || '';
      if (url.includes('supabase')) {
        functionality.push({
          type: 'supabase_operation',
          operation: this.inferSupabaseOperation(node),
          table: this.extractTableName(node)
        });
      } else if (url.includes('openrouter')) {
        functionality.push({
          type: 'openrouter_llm',
          model: node.parameters?.model || 'auto',
          prompt: this.extractPrompt(node)
        });
      }
    }

    // Code/Function nodes
    if (nodeType.includes('code') || nodeType.includes('function')) {
      functionality.push({
        type: 'code_execution',
        language: node.parameters?.language || 'javascript',
        code: node.parameters?.jsCode || node.parameters?.functionCode || ''
      });
    }

    // Supabase nodes
    if (nodeType.includes('supabase')) {
      functionality.push({
        type: 'supabase_operation',
        operation: node.parameters?.operation || 'unknown',
        table: node.parameters?.table || node.parameters?.resource || 'unknown'
      });
    }

    // OpenRouter nodes
    if (nodeType.includes('openrouter')) {
      functionality.push({
        type: 'openrouter_llm',
        model: node.parameters?.model || 'auto',
        prompt: this.extractPrompt(node)
      });
    }

    // Set nodes (data transformation)
    if (nodeType.includes('set')) {
      functionality.push({
        type: 'data_transformation',
        operations: this.extractSetOperations(node)
      });
    }

    // IF nodes (conditionals)
    if (nodeType.includes('if')) {
      functionality.push({
        type: 'conditional_logic',
        conditions: this.extractConditions(node)
      });
    }

    return functionality;
  }

  /**
   * Infer Supabase operation from node
   */
  inferSupabaseOperation(node) {
    const url = (node.parameters?.url || node.parameters?.url?.toString() || '').toLowerCase();
    const method = (node.parameters?.method || node.parameters?.httpMethod || 'GET').toUpperCase();

    if (url.includes('select') || method === 'GET') return 'select';
    if (url.includes('insert') || method === 'POST') return 'insert';
    if (url.includes('update') || method === 'PUT' || method === 'PATCH') return 'update';
    if (url.includes('delete') || method === 'DELETE') return 'delete';
    if (url.includes('upsert')) return 'upsert';

    return 'unknown';
  }

  /**
   * Extract table name from node
   */
  extractTableName(node) {
    const url = node.parameters?.url || node.parameters?.url?.toString() || '';
    const tableMatch = url.match(/\/([^\/\?]+)(\?|$)/);
    return tableMatch ? tableMatch[1] : 'unknown';
  }

  /**
   * Extract prompt from node
   */
  extractPrompt(node) {
    // Try various parameter locations
    return node.parameters?.prompt ||
           node.parameters?.messages?.[0]?.content ||
           node.parameters?.body ||
           '';
  }

  /**
   * Extract set operations
   */
  extractSetOperations(node) {
    const operations = [];
    let values = node.parameters?.values || node.parameters?.assignments || [];
    
    // Ensure values is an array
    if (!Array.isArray(values)) {
      if (values.values && Array.isArray(values.values)) {
        values = values.values;
      } else {
        values = [];
      }
    }

    for (const value of values) {
      if (value) {
        operations.push({
          field: value.name || value.key || value.field,
          value: value.value,
          type: value.type || 'string'
        });
      }
    }

    return operations;
  }

  /**
   * Extract conditions
   */
  extractConditions(node) {
    const conditions = [];
    let conditionsParam = node.parameters?.conditions;
    
    // Handle different condition formats
    if (Array.isArray(conditionsParam)) {
      // Already an array
    } else if (conditionsParam?.conditions && Array.isArray(conditionsParam.conditions)) {
      conditionsParam = conditionsParam.conditions;
    } else if (conditionsParam?.singleCondition) {
      conditionsParam = [conditionsParam.singleCondition];
    } else {
      conditionsParam = [];
    }

    for (const condition of conditionsParam) {
      if (condition) {
        conditions.push({
          field: condition.leftValue || condition.field || condition.value1,
          operator: condition.operator || condition.operation || condition.operationType,
          value: condition.rightValue || condition.value || condition.value2
        });
      }
    }

    return conditions;
  }

  /**
   * Extract high-level functionality
   */
  extractFunctionality() {
    const functionality = [];

    // Group by functionality type
    const byType = {};
    for (const node of this.analysis.nodes) {
      for (const func of node.functionality) {
        if (!byType[func.type]) {
          byType[func.type] = [];
        }
        byType[func.type].push({ node: node.name, ...func });
      }
    }

    // Create functionality summary
    for (const [type, items] of Object.entries(byType)) {
      functionality.push({
        type,
        count: items.length,
        items,
        description: this.describeFunctionality(type, items)
      });
    }

    this.analysis.functionality = functionality;
  }

  /**
   * Describe functionality
   */
  describeFunctionality(type, items) {
    switch (type) {
      case 'supabase_operation':
        const operations = [...new Set(items.map(i => i.operation))];
        const tables = [...new Set(items.map(i => i.table).filter(Boolean))];
        return `Performs ${operations.join(', ')} operations${tables.length ? ` on ${tables.join(', ')} tables` : ''}`;
      
      case 'openrouter_llm':
        return `Makes LLM calls via OpenRouter`;
      
      case 'code_execution':
        return `Executes custom code logic`;
      
      case 'data_transformation':
        return `Transforms and manipulates data`;
      
      case 'conditional_logic':
        return `Applies conditional logic and branching`;
      
      default:
        return `Performs ${type} operations`;
    }
  }

  /**
   * Map to MCP tools
   */
  mapToMCP() {
    const mappings = [];

    for (const func of this.analysis.functionality) {
      const mapping = this.mapFunctionalityToMCP(func);
      if (mapping) {
        mappings.push(mapping);
      }
    }

    this.analysis.mcpMapping = mappings;
  }

  /**
   * Map functionality to MCP tool
   */
  mapFunctionalityToMCP(func) {
    switch (func.type) {
      case 'supabase_operation':
        // Map to MCP tools based on operation
        const operations = func.items.map(i => i.operation);
        if (operations.includes('select')) {
          return {
            mcpTool: 'get_crew_memories',
            operation: 'read',
            description: 'Read data from Supabase',
            implementation: 'Use Supabase client in MCP tool'
          };
        }
        if (operations.includes('insert') || operations.includes('upsert')) {
          return {
            mcpTool: 'store_crew_memory', // Needs to be implemented
            operation: 'write',
            description: 'Write data to Supabase',
            implementation: 'Use Supabase client in MCP tool'
          };
        }
        break;

      case 'openrouter_llm':
        return {
          mcpTool: 'call_openrouter_llm',
          operation: 'llm_call',
          description: 'Make LLM call via OpenRouter',
          implementation: 'Use existing MCP tool'
        };

      case 'code_execution':
        return {
          mcpTool: 'custom_code_execution', // Needs to be implemented
          operation: 'code',
          description: 'Execute custom code logic',
          implementation: 'Port code to MCP tool or inline logic'
        };

      default:
        return {
          mcpTool: 'custom_implementation',
          operation: func.type,
          description: func.description,
          implementation: 'Needs custom MCP tool implementation'
        };
    }

    return null;
  }

  /**
   * Assess workflow complexity
   */
  assessComplexity() {
    const nodeCount = this.analysis.nodes.length;
    const functionalityCount = this.analysis.functionality.length;
    const hasCode = this.analysis.nodes.some(n => 
      n.functionality.some(f => f.type === 'code_execution')
    );
    const hasConditionals = this.analysis.nodes.some(n =>
      n.functionality.some(f => f.type === 'conditional_logic')
    );

    let complexity = 'low';
    if (nodeCount > 10 || functionalityCount > 5 || hasCode || hasConditionals) {
      complexity = 'medium';
    }
    if (nodeCount > 20 || functionalityCount > 10 || (hasCode && hasConditionals)) {
      complexity = 'high';
    }

    this.analysis.complexity = complexity;
  }

  /**
   * Generate migration report
   */
  generateReport() {
    return {
      workflow: {
        name: this.analysis.name,
        path: this.workflowPath,
        webhook: this.analysis.webhook
      },
      analysis: {
        nodeCount: this.analysis.nodes.length,
        functionality: this.analysis.functionality,
        complexity: this.analysis.complexity
      },
      migration: {
        mcpMapping: this.analysis.mcpMapping,
        status: this.analysis.mcpMapping.length > 0 ? 'mappable' : 'needs_analysis',
        estimatedEffort: this.estimateEffort()
      }
    };
  }

  /**
   * Estimate migration effort
   */
  estimateEffort() {
    const existingTools = this.analysis.mcpMapping.filter(m => 
      !m.mcpTool.includes('custom') && !m.mcpTool.includes('needs')
    ).length;
    const newTools = this.analysis.mcpMapping.length - existingTools;

    return {
      existingTools,
      newTools,
      estimatedHours: (existingTools * 0.5) + (newTools * 2),
      priority: this.analysis.complexity === 'high' ? 'high' : 
                this.analysis.complexity === 'medium' ? 'medium' : 'low'
    };
  }
}

// CLI usage
if (require.main === module) {
  const workflowPath = process.argv[2];
  
  if (!workflowPath) {
    console.error('Usage: node analyze-n8n-workflow.js <workflow-file.json>');
    process.exit(1);
  }

  const analyzer = new N8NWorkflowAnalyzer(workflowPath);
  
  try {
    analyzer.load();
    analyzer.analyze();
    const report = analyzer.generateReport();
    
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = { N8NWorkflowAnalyzer };

