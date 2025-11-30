/**
 * N8N Workflow Adapter
 * Implements the Ports & Adapters pattern for N8N integration
 * Translates between domain models and N8N API
 */

import { N8NClient } from './n8n-client';
import { Workflow } from '../domain/aggregates/workflow';
import { Execution } from '../domain/aggregates/execution';
import { InfrastructureError } from '@shared/types/errors.types';

export interface WorkflowAdapter {
  deploy(workflow: Workflow): Promise<{ n8nWorkflowId: string; webhookUrl: string | null }>;
  activate(n8nWorkflowId: string): Promise<void>;
  deactivate(n8nWorkflowId: string): Promise<void>;
  execute(workflow: Workflow, input: any): Promise<any>;
  getExecutions(n8nWorkflowId: string): Promise<any[]>;
  getStatus(n8nWorkflowId: string): Promise<any>;
}

export class N8NWorkflowAdapter implements WorkflowAdapter {
  constructor(private readonly client: N8NClient) {}

  async deploy(workflow: Workflow): Promise<{ n8nWorkflowId: string; webhookUrl: string | null }> {
    try {
      // Check if workflow already exists in N8N
      const existing = await this.findExistingWorkflow(workflow.name);

      let n8nWorkflow: any;

      if (existing) {
        // Update existing workflow
        n8nWorkflow = await this.client.updateWorkflow(existing.id, {
          name: workflow.name,
          nodes: workflow.nodes,
          connections: workflow.connections,
          active: false, // Deploy inactive by default
        });
      } else {
        // Create new workflow
        n8nWorkflow = await this.client.createWorkflow({
          name: workflow.name,
          nodes: workflow.nodes,
          connections: workflow.connections,
          active: false, // Deploy inactive by default
        });
      }

      // Extract webhook URL if workflow has webhook node
      const webhookPath = this.extractWebhookPath(workflow.nodes);
      const webhookUrl = webhookPath
        ? `${this.client['baseUrl']}/webhook/${webhookPath}`
        : null;

      return {
        n8nWorkflowId: n8nWorkflow.id,
        webhookUrl,
      };
    } catch (error) {
      throw new InfrastructureError(
        `Failed to deploy workflow: ${error.message}`,
        error
      );
    }
  }

  async activate(n8nWorkflowId: string): Promise<void> {
    try {
      await this.client.activateWorkflow(n8nWorkflowId);
    } catch (error) {
      throw new InfrastructureError(
        `Failed to activate workflow: ${error.message}`,
        error
      );
    }
  }

  async deactivate(n8nWorkflowId: string): Promise<void> {
    try {
      await this.client.deactivateWorkflow(n8nWorkflowId);
    } catch (error) {
      throw new InfrastructureError(
        `Failed to deactivate workflow: ${error.message}`,
        error
      );
    }
  }

  async execute(workflow: Workflow, input: any): Promise<any> {
    try {
      if (!workflow.n8nWorkflowId) {
        throw new Error('Workflow is not deployed');
      }

      // If workflow has webhook, use webhook URL
      if (workflow.webhookUrl) {
        return await this.client.callWebhook(workflow.webhookUrl.value, input);
      }

      // Otherwise use execution API
      const result = await this.client.executeWorkflow(workflow.n8nWorkflowId, input);
      return result;
    } catch (error) {
      throw new InfrastructureError(
        `Failed to execute workflow: ${error.message}`,
        error
      );
    }
  }

  async getExecutions(n8nWorkflowId: string): Promise<any[]> {
    try {
      const result = await this.client.getExecutions(n8nWorkflowId);
      return result.data || [];
    } catch (error) {
      throw new InfrastructureError(
        `Failed to get executions: ${error.message}`,
        error
      );
    }
  }

  async getStatus(n8nWorkflowId: string): Promise<any> {
    try {
      return await this.client.getWorkflow(n8nWorkflowId);
    } catch (error) {
      throw new InfrastructureError(
        `Failed to get workflow status: ${error.message}`,
        error
      );
    }
  }

  private async findExistingWorkflow(name: string): Promise<any | null> {
    try {
      const workflows = await this.client.listWorkflows();
      const data = workflows.data || [];
      return data.find((w: any) => w.name === name) || null;
    } catch (error) {
      // If listing fails, assume no existing workflow
      return null;
    }
  }

  private extractWebhookPath(nodes: any[]): string | null {
    const webhookNode = nodes.find((n: any) => n.type === 'n8n-nodes-base.webhook');
    return webhookNode?.parameters?.path || null;
  }
}

/**
 * Factory function to create N8N adapter with credentials
 */
export function createN8NAdapter(): N8NWorkflowAdapter {
  const url = process.env.N8N_URL;
  const apiKey = process.env.N8N_API_KEY;

  if (!url || !apiKey) {
    throw new InfrastructureError(
      'N8N credentials not configured. Set N8N_URL and N8N_API_KEY environment variables.'
    );
  }

  const client = new N8NClient({ url, apiKey });
  return new N8NWorkflowAdapter(client);
}

