import { DomainEvent } from '@shared/types/common.types';
import { v4 as uuidv4 } from 'uuid';

export class ProjectDeployedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType: string = 'ProjectDeployed';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string, // project ID
    readonly projectName: string,
    readonly deploymentUrl: string
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
      projectName: this.projectName,
      deploymentUrl: this.deploymentUrl,
    };
  }
}

