import { DomainEvent } from '@shared/types/common.types';
import { v4 as uuidv4 } from 'uuid';

export class ContentEditedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType: string = 'ContentEdited';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string, // editor session ID
    readonly projectId: string,
    readonly field: string,
    readonly editorId: string
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
      projectId: this.projectId,
      field: this.field,
      editorId: this.editorId,
    };
  }
}

