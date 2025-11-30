import { DomainEvent } from '@shared/types/common.types';
import { v4 as uuidv4 } from 'uuid';

export class CrewMemberAssignedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType: string = 'CrewMemberAssigned';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string, // crew member ID
    readonly crewMemberName: string,
    readonly projectId: string,
    readonly role: string,
    readonly taskDescription: string
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
      crewMemberName: this.crewMemberName,
      projectId: this.projectId,
      role: this.role,
      taskDescription: this.taskDescription,
    };
  }
}

