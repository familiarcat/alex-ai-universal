/**
 * Command to execute a workflow
 */
export class ExecuteWorkflowCommand {
  constructor(
    public readonly workflowId: string,
    public readonly input: any,
    public readonly triggeredBy: string
  ) {}
}

