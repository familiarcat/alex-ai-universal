/**
 * Deploy Full Stack Project Use Case
 * Orchestrates project deployment with workflow automation
 * 
 * Reviewed by: Captain Picard (Orchestration) & Commander Riker (Execution)
 */

import { ProjectRepository } from '@projects/infrastructure/repositories/project.repository.interface';
import { WorkflowAdapter } from '@workflows/infrastructure/n8n-workflow.adapter';
import { eventBus } from '@infrastructure/messaging/event-bus';

export interface DeployFullStackProjectCommand {
  projectId: string;
  deploymentUrl: string;
  useWorkflowAutomation?: boolean;
}

export interface DeployFullStackProjectResult {
  success: boolean;
  projectId: string;
  projectName: string;
  deploymentUrl: string;
  workflowExecutionId?: string;
  message: string;
}

export class DeployFullStackProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly workflowAdapter?: WorkflowAdapter
  ) {}

  async execute(command: DeployFullStackProjectCommand): Promise<DeployFullStackProjectResult> {
    // 1. Get project
    const project = await this.projectRepository.findById(command.projectId);
    
    if (!project) {
      throw new Error(`Project not found: ${command.projectId}`);
    }

    // 2. Validate project is ready for deployment
    if (!project.hasContent) {
      throw new Error('Cannot deploy project without content');
    }

    if (!project.hasTheme) {
      throw new Error('Cannot deploy project without theme');
    }

    // 3. If workflow automation is enabled, trigger deployment workflow
    let workflowExecutionId: string | undefined;
    
    if (command.useWorkflowAutomation && this.workflowAdapter) {
      try {
        // In a real system, we'd have a deployment workflow
        // const result = await this.workflowAdapter.execute(deploymentWorkflow, {
        //   projectId: project.id,
        //   deploymentUrl: command.deploymentUrl
        // });
        // workflowExecutionId = result.executionId;
        
        workflowExecutionId = 'mock-execution-id';
      } catch (error) {
        console.error('Workflow automation failed:', error);
        // Continue with deployment anyway
      }
    }

    // 4. Deploy project
    project.deploy(command.deploymentUrl);

    // 5. Save project
    await this.projectRepository.save(project);

    // 6. Publish domain events
    await eventBus.publishAll(project.getDomainEvents());
    project.clearDomainEvents();

    return {
      success: true,
      projectId: project.id,
      projectName: project.name,
      deploymentUrl: command.deploymentUrl,
      workflowExecutionId,
      message: `Project "${project.name}" deployed successfully to ${command.deploymentUrl}`,
    };
  }
}

