import { DomainEvent } from '@shared/types/common.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Event emitted when a workflow is deployed to N8N
 */
export class WorkflowDeployedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType: string = 'WorkflowDeployed';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string,
    readonly n8nWorkflowId: string,
    readonly workflowName: string,
    readonly webhookUrl: string | null
  ) {
    this.eventId = uuidv4();
    this.occurredAt = new Date();
  }

  toJSON() {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      occurredAt: this.occurredAt.toISOString(),
      aggregateId: this.aggregateId,
      n8nWorkflowId: this.n8nWorkflowId,
      workflowName: this.workflowName,
      webhookUrl: this.webhookUrl,
    };
  }
}

