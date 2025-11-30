import { DomainEvent } from '@shared/types/common.types';
import { v4 as uuidv4 } from 'uuid';

export class WorkflowExecutedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType: string = 'WorkflowExecuted';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string, // execution ID
    readonly workflowId: string,
    readonly status: string,
    readonly output: any,
    readonly completedAt: Date
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
      workflowId: this.workflowId,
      status: this.status,
      output: this.output,
      completedAt: this.completedAt.toISOString(),
    };
  }
}

