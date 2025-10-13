/**
 * Query to list all workflows
 */
export class ListWorkflowsQuery {
  constructor(
    public readonly activeOnly?: boolean
  ) {}
}

/**
 * Result of list workflows query
 */
export interface WorkflowListItemDTO {
  id: string;
  name: string;
  n8nWorkflowId: string | null;
  active: boolean;
  isDeployed: boolean;
  createdAt: string;
  updatedAt: string;
}

