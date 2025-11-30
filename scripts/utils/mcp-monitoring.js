/**
 * 🖖 MCP Monitoring & Logging
 * 
 * Execution history, performance metrics, and error tracking for MCP workflows.
 */

const { getMCPMemoryStorage } = require('./mcp-memory-storage');
const fs = require('fs');
const path = require('path');

class MCPMonitoring {
  constructor() {
    this.executionHistory = [];
    this.performanceMetrics = [];
    this.errors = [];
    this.memoryStorage = null;
    this.maxHistorySize = 1000;
  }

  /**
   * Initialize monitoring
   */
  initialize() {
    try {
      this.memoryStorage = getMCPMemoryStorage();
      this.memoryStorage.initialize();
    } catch (e) {
      // Memory storage optional
    }
    return true;
  }

  /**
   * Log workflow execution
   */
  logExecution(execution) {
    const logEntry = {
      id: `exec-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      workflow: execution.workflow,
      status: execution.success ? 'success' : 'failed',
      duration: execution.duration || 0,
      result: execution.result,
      error: execution.error,
      metadata: execution.metadata || {}
    };

    this.executionHistory.push(logEntry);

    // Limit history size
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift();
    }

    // Store in memory storage if available
    if (this.memoryStorage && execution.persist) {
      this.memoryStorage.storeMemory({
        title: `Workflow Execution: ${execution.workflow}`,
        content: JSON.stringify(logEntry, null, 2),
        category: 'workflow-execution',
        tags: ['monitoring', 'execution', execution.workflow],
        sessionId: logEntry.id,
        metadata: {
          source: 'mcp-monitoring',
          ...logEntry.metadata
        }
      }).catch(e => {
        // Silent fail for monitoring
      });
    }

    return logEntry;
  }

  /**
   * Log performance metric
   */
  logPerformance(metric) {
    const perfEntry = {
      id: `perf-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      workflow: metric.workflow,
      metric: metric.metric,
      value: metric.value,
      unit: metric.unit || 'ms',
      metadata: metric.metadata || {}
    };

    this.performanceMetrics.push(perfEntry);

    // Limit metrics size
    if (this.performanceMetrics.length > this.maxHistorySize) {
      this.performanceMetrics.shift();
    }

    return perfEntry;
  }

  /**
   * Log error
   */
  logError(error) {
    const errorEntry = {
      id: `error-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      workflow: error.workflow || 'unknown',
      error: error.message || error.error,
      stack: error.stack,
      context: error.context || {},
      metadata: error.metadata || {}
    };

    this.errors.push(errorEntry);

    // Limit errors size
    if (this.errors.length > 500) {
      this.errors.shift();
    }

    // Store critical errors in memory storage
    if (this.memoryStorage && error.critical) {
      this.memoryStorage.storeMemory({
        title: `Error: ${error.workflow || 'Unknown'}`,
        content: JSON.stringify(errorEntry, null, 2),
        category: 'error',
        tags: ['monitoring', 'error', error.workflow || 'unknown'],
        sessionId: errorEntry.id,
        metadata: {
          source: 'mcp-monitoring',
          critical: true,
          ...errorEntry.metadata
        }
      }).catch(e => {
        // Silent fail for monitoring
      });
    }

    return errorEntry;
  }

  /**
   * Get execution history
   */
  getExecutionHistory(filters = {}) {
    let history = [...this.executionHistory];

    if (filters.workflow) {
      history = history.filter(h => h.workflow === filters.workflow);
    }

    if (filters.status) {
      history = history.filter(h => h.status === filters.status);
    }

    if (filters.startDate) {
      history = history.filter(h => h.timestamp >= filters.startDate);
    }

    if (filters.endDate) {
      history = history.filter(h => h.timestamp <= filters.endDate);
    }

    if (filters.limit) {
      history = history.slice(-filters.limit);
    }

    return history;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(filters = {}) {
    let metrics = [...this.performanceMetrics];

    if (filters.workflow) {
      metrics = metrics.filter(m => m.workflow === filters.workflow);
    }

    if (filters.metric) {
      metrics = metrics.filter(m => m.metric === filters.metric);
    }

    if (filters.limit) {
      metrics = metrics.slice(-filters.limit);
    }

    return metrics;
  }

  /**
   * Get errors
   */
  getErrors(filters = {}) {
    let errors = [...this.errors];

    if (filters.workflow) {
      errors = errors.filter(e => e.workflow === filters.workflow);
    }

    if (filters.critical) {
      errors = errors.filter(e => e.critical);
    }

    if (filters.startDate) {
      errors = errors.filter(e => e.timestamp >= filters.startDate);
    }

    if (filters.limit) {
      errors = errors.slice(-filters.limit);
    }

    return errors;
  }

  /**
   * Get statistics
   */
  getStats() {
    const totalExecutions = this.executionHistory.length;
    const successfulExecutions = this.executionHistory.filter(h => h.status === 'success').length;
    const failedExecutions = this.executionHistory.filter(h => h.status === 'failed').length;

    const avgDuration = this.executionHistory.length > 0
      ? this.executionHistory.reduce((sum, h) => sum + (h.duration || 0), 0) / this.executionHistory.length
      : 0;

    const totalErrors = this.errors.length;
    const criticalErrors = this.errors.filter(e => e.critical).length;

    return {
      executions: {
        total: totalExecutions,
        successful: successfulExecutions,
        failed: failedExecutions,
        successRate: totalExecutions > 0 ? ((successfulExecutions / totalExecutions) * 100).toFixed(1) + '%' : '0%',
        averageDuration: avgDuration.toFixed(2) + 'ms'
      },
      errors: {
        total: totalErrors,
        critical: criticalErrors
      },
      performance: {
        metricsCount: this.performanceMetrics.length
      }
    };
  }

  /**
   * Export execution history
   */
  exportHistory(filePath) {
    const data = {
      timestamp: new Date().toISOString(),
      executions: this.executionHistory,
      performance: this.performanceMetrics,
      errors: this.errors
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return filePath;
  }
}

// Singleton instance
let mcpMonitoringInstance = null;

function getMCPMonitoring() {
  if (!mcpMonitoringInstance) {
    mcpMonitoringInstance = new MCPMonitoring();
  }
  return mcpMonitoringInstance;
}

module.exports = { getMCPMonitoring, MCPMonitoring };

