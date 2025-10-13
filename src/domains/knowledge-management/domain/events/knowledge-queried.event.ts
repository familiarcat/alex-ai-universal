import { DomainEvent } from '@shared/types/common.types';
import { v4 as uuidv4 } from 'uuid';

export class KnowledgeQueriedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType: string = 'KnowledgeQueried';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string, // knowledge base ID
    readonly resultCount: number,
    readonly documentIds: string[]
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
      resultCount: this.resultCount,
      documentIds: this.documentIds,
    };
  }
}

