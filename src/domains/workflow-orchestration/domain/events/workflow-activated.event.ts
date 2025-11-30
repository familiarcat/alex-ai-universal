import { DomainEvent } from '@shared/types/common.types';
import { v4 as uuidv4 } from 'uuid';

export class WorkflowActivatedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType: string = 'WorkflowActivated';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string,
    readonly n8nWorkflowId: string
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
    };
  }
}

