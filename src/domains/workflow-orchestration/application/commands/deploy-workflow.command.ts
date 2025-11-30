/**
 * Command to deploy a workflow to N8N
 */
export class DeployWorkflowCommand {
  constructor(
    public readonly workflowId: string,
    public readonly activateImmediately: boolean = true
  ) {}
}

