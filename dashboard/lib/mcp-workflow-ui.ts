/**
 * MCP Workflow UI Utilities
 * 
 * Utilities for converting between React Flow format and MCP workflow format
 */

import { Node, Edge } from 'reactflow';
import { MCPNodeType } from '@/components/workflows/MCPNodes';

export interface WorkflowDefinition {
  id?: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MCPWorkflowStep {
  id: string;
  type: MCPNodeType;
  config?: Record<string, any>;
  next?: string[];
}

export interface MCPWorkflow {
  name: string;
  steps: MCPWorkflowStep[];
}

/**
 * Convert React Flow workflow to MCP workflow format
 */
export function convertToMCPFormat(workflow: WorkflowDefinition): MCPWorkflow {
  const steps: MCPWorkflowStep[] = workflow.nodes.map(node => {
    const nodeData = node.data as { type: MCPNodeType; config?: Record<string, any> };
    
    // Find all edges that start from this node
    const nextNodes = workflow.edges
      .filter(edge => edge.source === node.id)
      .map(edge => edge.target);
    
    return {
      id: node.id,
      type: nodeData.type,
      config: nodeData.config || {},
      next: nextNodes.length > 0 ? nextNodes : undefined,
    };
  });
  
  return {
    name: workflow.name,
    steps,
  };
}

/**
 * Convert MCP workflow to React Flow format
 */
export function convertFromMCPFormat(mcpWorkflow: MCPWorkflow): WorkflowDefinition {
  const nodes: Node[] = mcpWorkflow.steps.map((step, index) => ({
    id: step.id,
    type: 'mcpNode',
    data: {
      label: step.type,
      type: step.type,
      config: step.config,
    },
    position: {
      x: (index % 4) * 200 + 100,
      y: Math.floor(index / 4) * 150 + 100,
    },
  }));
  
  const edges: Edge[] = [];
  mcpWorkflow.steps.forEach(step => {
    if (step.next) {
      step.next.forEach(targetId => {
        edges.push({
          id: `${step.id}-${targetId}`,
          source: step.id,
          target: targetId,
        });
      });
    }
  });
  
  return {
    name: mcpWorkflow.name,
    nodes,
    edges,
  };
}

/**
 * Execute workflow via MCP service
 */
export async function executeWorkflow(workflow: WorkflowDefinition) {
  const mcpWorkflow = convertToMCPFormat(workflow);
  
  const response = await fetch('/api/mcp/workflows/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mcpWorkflow),
  });
  
  if (!response.ok) {
    throw new Error(`Workflow execution failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Save workflow
 */
export async function saveWorkflow(workflow: WorkflowDefinition) {
  const response = await fetch('/api/mcp/workflows/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  });
  
  if (!response.ok) {
    throw new Error(`Workflow save failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Load workflow
 */
export async function loadWorkflow(workflowId: string): Promise<WorkflowDefinition> {
  const response = await fetch(`/api/mcp/workflows/${workflowId}`);
  
  if (!response.ok) {
    throw new Error(`Workflow load failed: ${response.statusText}`);
  }
  
  const mcpWorkflow = await response.json();
  return convertFromMCPFormat(mcpWorkflow);
}

