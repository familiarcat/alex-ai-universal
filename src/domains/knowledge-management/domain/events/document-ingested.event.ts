import { DomainEvent } from '@shared/types/common.types';
import { v4 as uuidv4 } from 'uuid';

export class DocumentIngestedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType: string = 'DocumentIngested';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string, // document ID
    readonly title: string,
    readonly sessionId: string,
    readonly chunkCount: number,
    readonly antiHallucinationScore: number
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
      title: this.title,
      sessionId: this.sessionId,
      chunkCount: this.chunkCount,
      antiHallucinationScore: this.antiHallucinationScore,
    };
  }
}

