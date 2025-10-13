import { DomainEvent } from '@shared/types/common.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Event emitted when a theme is selected for a project
 */
export class ThemeSelectedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType: string = 'ThemeSelected';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string, // project ID
    readonly themeId: string,
    readonly themeName: string
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
      themeId: this.themeId,
      themeName: this.themeName,
    };
  }
}

