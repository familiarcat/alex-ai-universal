/**
 * Command to deploy a project
 */
export class DeployProjectCommand {
  constructor(
    public readonly projectId: string,
    public readonly deploymentUrl: string
  ) {}
}

