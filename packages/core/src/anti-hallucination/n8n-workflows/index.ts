/**
 * N8N Workflows for Anti-Hallucination System
 * Exports workflow configurations and deployment utilities
 */

export { N8NWorkflowDeployer, deployAntiHallucinationWorkflows } from './deploy-workflows';
export type { N8NWorkflowDeployment, N8NDeploymentConfig } from './deploy-workflows';

// Workflow configurations
export const ANTI_HALLUCINATION_WORKFLOW = require('./anti-hallucination-workflow.json');
export const HALLUCINATION_MONITORING_WORKFLOW = require('./hallucination-monitoring-workflow.json');

// Available workflows
export const AVAILABLE_WORKFLOWS = [
  {
    name: 'Anti-Hallucination Crew Workflow',
    description: 'Main workflow for crew-based hallucination prevention and correction',
    file: 'anti-hallucination-workflow.json',
    config: ANTI_HALLUCINATION_WORKFLOW
  },
  {
    name: 'Hallucination Monitoring Dashboard',
    description: 'Monitoring workflow for real-time hallucination tracking and alerts',
    file: 'hallucination-monitoring-workflow.json',
    config: HALLUCINATION_MONITORING_WORKFLOW
  }
];

// Workflow utilities
export class AntiHallucinationWorkflowManager {
  /**
   * Get workflow configuration by name
   */
  static getWorkflow(name: string): any {
    const workflow = AVAILABLE_WORKFLOWS.find(w => w.name === name);
    if (!workflow) {
      throw new Error(`Workflow not found: ${name}`);
    }
    return workflow.config;
  }

  /**
   * List all available workflows
   */
  static listWorkflows(): Array<{ name: string; description: string; file: string }> {
    return AVAILABLE_WORKFLOWS.map(w => ({
      name: w.name,
      description: w.description,
      file: w.file
    }));
  }

  /**
   * Validate workflow configuration
   */
  static validateWorkflow(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.name) {
      errors.push('Missing workflow name');
    }
    
    if (!config.nodes || !Array.isArray(config.nodes)) {
      errors.push('Missing or invalid nodes array');
    }
    
    if (!config.connections || typeof config.connections !== 'object') {
      errors.push('Missing or invalid connections object');
    }
    
    // Validate required nodes for anti-hallucination workflows
    if (config.name?.includes('Anti-Hallucination')) {
      const nodeNames = config.nodes.map((n: any) => n.name);
      const requiredNodes = ['Prompt Interception', 'Hallucination Analysis'];
      
      for (const required of requiredNodes) {
        if (!nodeNames.includes(required)) {
          errors.push(`Missing required node: ${required}`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get workflow statistics
   */
  static getWorkflowStats(config: any): {
    nodeCount: number;
    connectionCount: number;
    triggerCount: number;
    estimatedProcessingTime: number;
  } {
    const nodeCount = config.nodes?.length || 0;
    const connectionCount = Object.keys(config.connections || {}).length;
    const triggerCount = config.nodes?.filter((n: any) => 
      n.type?.includes('trigger') || n.type?.includes('webhook')
    ).length || 0;
    
    // Estimate processing time based on node count and complexity
    const estimatedProcessingTime = nodeCount * 500 + (connectionCount * 100);
    
    return {
      nodeCount,
      connectionCount,
      triggerCount,
      estimatedProcessingTime
    };
  }

  /**
   * Generate workflow documentation
   */
  static generateWorkflowDocs(config: any): string {
    const stats = this.getWorkflowStats(config);
    
    return `
# ${config.name}

## Description
${config.description || 'No description provided'}

## Workflow Statistics
- **Nodes**: ${stats.nodeCount}
- **Connections**: ${stats.connectionCount}
- **Triggers**: ${stats.triggerCount}
- **Estimated Processing Time**: ${stats.estimatedProcessingTime}ms

## Node Overview
${config.nodes?.map((node: any) => `- **${node.name}**: ${node.type}`).join('\n') || 'No nodes found'}

## Connection Flow
${Object.entries(config.connections || {}).map(([source, targets]: [string, any]) => 
  `- **${source}** → ${Array.isArray(targets) ? targets.map((t: any) => t.node).join(', ') : 'No connections'}`
).join('\n')}

## Usage
This workflow is designed for the Alex AI Universal anti-hallucination system.
Deploy using the N8NWorkflowDeployer class or the deployAntiHallucinationWorkflows function.

## Configuration
- **Timeout**: 30000ms
- **Retry Attempts**: 3
- **Environment**: Production
- **Tags**: anti-hallucination, monitoring
`;
  }
}
