import { DomainEvent } from '@shared/types/common.types';
import { v4 as uuidv4 } from 'uuid';

export class ExecutionFailedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType: string = 'ExecutionFailed';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string, // execution ID
    readonly workflowId: string,
    readonly error: string,
    readonly failedAt: Date
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
      error: this.error,
      failedAt: this.failedAt.toISOString(),
    };
  }
}

