import { DomainEvent } from '@shared/types/common.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Event emitted when a theme's definition is updated
 */
export class ThemeUpdatedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType: string = 'ThemeUpdated';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string, // theme ID
    readonly updatedProperties: string[],
    readonly affectedProjects: string[]
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
      updatedProperties: this.updatedProperties,
      affectedProjects: this.affectedProjects,
    };
  }
}

