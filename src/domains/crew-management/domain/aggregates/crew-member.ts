import { Entity } from '@shared/types/common.types';
import { ValidationError } from '@shared/types/errors.types';
import { CrewRole } from '../value-objects/crew-role';
import { Expertise } from '../value-objects/expertise';
import { CrewMemberAssignedEvent } from '../events/crew-member-assigned.event';
import { TaskCompletedEvent } from '../events/task-completed.event';

/**
 * Crew Member Aggregate Root
 * Represents a Star Trek AI crew member
 */
export class CrewMember implements Entity {
  private _domainEvents: any[] = [];

  private constructor(
    private readonly _id: string,
    private _name: string,
    private _role: CrewRole,
    private _expertise: Expertise,
    private _personality: string,
    private _responseStyle: string,
    private _status: 'active' | 'inactive',
    private _currentAssignments: string[], // project IDs
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _metadata: Record<string, any>
  ) {}

  static create(data: {
    id: string;
    name: string;
    role: string;
    expertise: string[];
    personality: string;
    responseStyle: string;
    metadata?: Record<string, any>;
  }): CrewMember {
    if (!data.name || data.name.trim() === '') {
      throw new ValidationError('Crew member name cannot be empty');
    }

    if (!data.personality || data.personality.trim() === '') {
      throw new ValidationError('Crew member personality cannot be empty');
    }

    const now = new Date();
    return new CrewMember(
      data.id,
      data.name.trim(),
      CrewRole.fromString(data.role),
      Expertise.create(data.expertise),
      data.personality.trim(),
      data.responseStyle || '',
      'active',
      [],
      now,
      now,
      data.metadata || {}
    );
  }

  static reconstitute(data: {
    id: string;
    name: string;
    role: string;
    expertise: string[];
    personality: string;
    responseStyle: string;
    status: 'active' | 'inactive';
    currentAssignments: string[];
    createdAt: Date;
    updatedAt: Date;
    metadata: Record<string, any>;
  }): CrewMember {
    return new CrewMember(
      data.id,
      data.name,
      CrewRole.fromString(data.role),
      Expertise.create(data.expertise),
      data.personality,
      data.responseStyle,
      data.status,
      data.currentAssignments,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.metadata
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get role(): CrewRole {
    return this._role;
  }

  get expertise(): Expertise {
    return this._expertise;
  }

  get personality(): string {
    return this._personality;
  }

  get responseStyle(): string {
    return this._responseStyle;
  }

  get status(): 'active' | 'inactive' {
    return this._status;
  }

  get currentAssignments(): ReadonlyArray<string> {
    return [...this._currentAssignments];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  get isActive(): boolean {
    return this._status === 'active';
  }

  get isAvailable(): boolean {
    return this.isActive && this._currentAssignments.length === 0;
  }

  get assignmentCount(): number {
    return this._currentAssignments.length;
  }

  // Domain methods
  assignToProject(projectId: string, taskDescription?: string): void {
    if (!this.isActive) {
      throw new ValidationError('Cannot assign inactive crew member');
    }

    if (this._currentAssignments.includes(projectId)) {
      throw new ValidationError(`Crew member already assigned to project ${projectId}`);
    }

    this._currentAssignments.push(projectId);
    this._updatedAt = new Date();

    this.addDomainEvent(new CrewMemberAssignedEvent(
      this._id,
      this._name,
      projectId,
      this._role.value,
      taskDescription || ''
    ));
  }

  unassignFromProject(projectId: string): void {
    const index = this._currentAssignments.indexOf(projectId);
    if (index === -1) {
      throw new ValidationError(`Crew member not assigned to project ${projectId}`);
    }

    this._currentAssignments.splice(index, 1);
    this._updatedAt = new Date();
  }

  completeTask(projectId: string, taskDescription: string): void {
    if (!this._currentAssignments.includes(projectId)) {
      throw new ValidationError(`Crew member not assigned to project ${projectId}`);
    }

    this._updatedAt = new Date();

    this.addDomainEvent(new TaskCompletedEvent(
      this._id,
      this._name,
      projectId,
      taskDescription
    ));
  }

  activate(): void {
    if (this._status === 'active') return;
    this._status = 'active';
    this._updatedAt = new Date();
  }

  deactivate(): void {
    if (this._status === 'inactive') return;
    
    if (this._currentAssignments.length > 0) {
      throw new ValidationError('Cannot deactivate crew member with active assignments');
    }

    this._status = 'inactive';
    this._updatedAt = new Date();
  }

  hasExpertiseIn(area: string): boolean {
    return this._expertise.hasArea(area) || this._expertise.includes(area);
  }

  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
    this._updatedAt = new Date();
  }

  // Domain events management
  private addDomainEvent(event: any): void {
    this._domainEvents.push(event);
  }

  getDomainEvents(): any[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  // Serialization
  toJSON() {
    return {
      id: this._id,
      name: this._name,
      role: this._role.value,
      expertise: this._expertise.toJSON(),
      personality: this._personality,
      responseStyle: this._responseStyle,
      status: this._status,
      currentAssignments: this._currentAssignments,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      metadata: this._metadata,
    };
  }
}

