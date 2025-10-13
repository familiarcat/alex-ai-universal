/**
 * Query to get workflow status
 */
export class GetWorkflowStatusQuery {
  constructor(
    public readonly workflowId: string
  ) {}
}

/**
 * Result of workflow status query
 */
export interface WorkflowStatusDTO {
  id: string;
  name: string;
  n8nWorkflowId: string | null;
  active: boolean;
  isDeployed: boolean;
  hasWebhook: boolean;
  webhookUrl: string | null;
  createdAt: string;
  updatedAt: string;
  recentExecutions?: ExecutionSummaryDTO[];
}

export interface ExecutionSummaryDTO {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  error: string | null;
}

