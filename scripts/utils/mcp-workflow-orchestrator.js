/**
 * 🖖 MCP Workflow Orchestrator
 * 
 * Advanced workflow orchestration engine for MCP system.
 * Supports sequential, parallel, and conditional workflow execution.
 */

const { getMCPCache } = require('./mcp-context-cache');
const { getMCPWorkflowService } = require('./mcp-workflow-service');

class MCPWorkflowOrchestrator {
  constructor() {
    this.mcpCache = getMCPCache();
    this.workflowService = null;
    this.executionHistory = [];
  }

  /**
   * Initialize orchestrator
   */
  initialize() {
    this.workflowService = getMCPWorkflowService();
    this.workflowService.initialize();
    return true;
  }

  /**
   * Execute workflow sequence (sequential)
   */
  async executeSequence(workflows, options = {}) {
    const {
      useCache = true,
      stopOnError = true,
      context = {}
    } = options;

    const results = [];
    const executionContext = { ...context };

    console.log(`📋 Executing ${workflows.length} workflows sequentially...\n`);

    for (let i = 0; i < workflows.length; i++) {
      const workflow = workflows[i];
      console.log(`[${i + 1}/${workflows.length}] Executing: ${workflow.name || workflow.workflow}\n`);

      try {
        const result = await this.workflowService.executeWorkflow(
          workflow.workflow,
          { ...workflow.data, ...executionContext },
          { useCache }
        );

        results.push({
          workflow: workflow.name || workflow.workflow,
          success: true,
          result: result,
          index: i
        });

        // Update execution context with result
        if (workflow.outputKey) {
          executionContext[workflow.outputKey] = result;
        }

        console.log(`✅ [${i + 1}/${workflows.length}] Completed: ${workflow.name || workflow.workflow}\n`);
      } catch (error) {
        const errorResult = {
          workflow: workflow.name || workflow.workflow,
          success: false,
          error: error.message,
          index: i
        };

        results.push(errorResult);
        console.error(`❌ [${i + 1}/${workflows.length}] Failed: ${workflow.name || workflow.workflow}`);
        console.error(`   Error: ${error.message}\n`);

        if (stopOnError) {
          throw new Error(`Workflow sequence failed at step ${i + 1}: ${error.message}`);
        }
      }
    }

    // Store execution history
    this.executionHistory.push({
      type: 'sequence',
      workflows: workflows.map(w => w.name || w.workflow),
      results,
      timestamp: new Date().toISOString()
    });

    return {
      success: results.every(r => r.success),
      results,
      context: executionContext
    };
  }

  /**
   * Execute workflows in parallel
   */
  async executeParallel(workflows, options = {}) {
    const {
      useCache = true,
      context = {}
    } = options;

    console.log(`📋 Executing ${workflows.length} workflows in parallel...\n`);

    const promises = workflows.map(async (workflow, index) => {
      console.log(`[${index + 1}/${workflows.length}] Starting: ${workflow.name || workflow.workflow}\n`);

      try {
        const result = await this.workflowService.executeWorkflow(
          workflow.workflow,
          { ...workflow.data, ...context },
          { useCache }
        );

        console.log(`✅ [${index + 1}/${workflows.length}] Completed: ${workflow.name || workflow.workflow}\n`);

        return {
          workflow: workflow.name || workflow.workflow,
          success: true,
          result: result,
          index
        };
      } catch (error) {
        console.error(`❌ [${index + 1}/${workflows.length}] Failed: ${workflow.name || workflow.workflow}`);
        console.error(`   Error: ${error.message}\n`);

        return {
          workflow: workflow.name || workflow.workflow,
          success: false,
          error: error.message,
          index
        };
      }
    });

    const results = await Promise.all(promises);

    // Store execution history
    this.executionHistory.push({
      type: 'parallel',
      workflows: workflows.map(w => w.name || w.workflow),
      results,
      timestamp: new Date().toISOString()
    });

    return {
      success: results.every(r => r.success),
      results
    };
  }

  /**
   * Execute workflow with conditional branching
   */
  async executeConditional(condition, workflows, options = {}) {
    const {
      context = {},
      useCache = true
    } = options;

    console.log(`🔀 Evaluating condition: ${condition.type}\n`);

    let conditionResult = false;

    // Evaluate condition
    switch (condition.type) {
      case 'equals':
        conditionResult = context[condition.field] === condition.value;
        break;
      case 'notEquals':
        conditionResult = context[condition.field] !== condition.value;
        break;
      case 'greaterThan':
        conditionResult = context[condition.field] > condition.value;
        break;
      case 'lessThan':
        conditionResult = context[condition.field] < condition.value;
        break;
      case 'contains':
        conditionResult = (context[condition.field] || '').includes(condition.value);
        break;
      case 'custom':
        // Custom function evaluation
        conditionResult = condition.function(context);
        break;
      default:
        throw new Error(`Unknown condition type: ${condition.type}`);
    }

    console.log(`   Condition result: ${conditionResult ? 'TRUE' : 'FALSE'}\n`);

    // Execute appropriate workflow branch
    const branch = conditionResult ? workflows.ifTrue : workflows.ifFalse;

    if (!branch) {
      return {
        success: true,
        conditionResult,
        executed: null,
        message: 'No branch to execute'
      };
    }

    console.log(`📋 Executing ${conditionResult ? 'TRUE' : 'FALSE'} branch...\n`);

    if (Array.isArray(branch)) {
      // Execute sequence
      const result = await this.executeSequence(branch, { useCache, context });
      return {
        success: result.success,
        conditionResult,
        executed: 'sequence',
        result
      };
    } else {
      // Execute single workflow
      const result = await this.workflowService.executeWorkflow(
        branch.workflow,
        { ...branch.data, ...context },
        { useCache }
      );
      return {
        success: true,
        conditionResult,
        executed: 'single',
        result
      };
    }
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit = 50) {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Get statistics
   */
  getStats() {
    const total = this.executionHistory.length;
    const successful = this.executionHistory.filter(h => 
      h.results && h.results.every(r => r.success !== false)
    ).length;

    return {
      totalExecutions: total,
      successfulExecutions: successful,
      successRate: total > 0 ? (successful / total * 100).toFixed(1) + '%' : '0%',
      recentExecutions: this.executionHistory.slice(-10).map(h => ({
        type: h.type,
        timestamp: h.timestamp,
        workflows: h.workflows
      }))
    };
  }
}

// Singleton instance
let mcpWorkflowOrchestratorInstance = null;

function getMCPWorkflowOrchestrator() {
  if (!mcpWorkflowOrchestratorInstance) {
    mcpWorkflowOrchestratorInstance = new MCPWorkflowOrchestrator();
  }
  return mcpWorkflowOrchestratorInstance;
}

module.exports = { getMCPWorkflowOrchestrator, MCPWorkflowOrchestrator };

