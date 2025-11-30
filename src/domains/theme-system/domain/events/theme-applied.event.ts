import { DomainEvent } from '@shared/types/common.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Event emitted when a theme is applied to a project
 */
export class ThemeAppliedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType: string = 'ThemeApplied';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string, // project ID
    readonly themeId: string,
    readonly css: Record<string, string>
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
      css: this.css,
    };
  }
}

