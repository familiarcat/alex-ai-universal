import { Entity } from '@shared/types/common.types';
<parameter name="ValidationError } from '@shared/types/errors.types';
import { ProjectStatus } from '../value-objects/project-status';
import { ProjectCreatedEvent } from '../events/project-created.event';
import { ProjectDeployedEvent } from '../events/project-deployed.event';
import { ContentEditedEvent } from '../events/content-edited.event';

/**
 * Project Aggregate Root
 * Represents a client application being built
 */
export class Project implements Entity {
  private _domainEvents: any[] = [];

  private constructor(
    private readonly _id: string,
    private _name: string,
    private _description: string,
    private _status: ProjectStatus,
    private _themeId: string | null,
    private _assignedCrewIds: string[],
    private _content: Record<string, any>,
    private _port: number | null,
    private _budget: number | null,
    private _timeline: string | null,
    private _features: string[],
    private _technologies: string[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _metadata: Record<string, any>
  ) {}

  static create(data: {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    themeId?: string;
    assignedCrewIds?: string[];
    port?: number;
    budget?: number;
    timeline?: string;
    features?: string[];
    technologies?: string[];
    metadata?: Record<string, any>;
  }): Project {
    if (!data.name || data.name.trim() === '') {
      throw new ValidationError('Project name cannot be empty');
    }

    const now = new Date();
    const project = new Project(
      data.id,
      data.name.trim(),
      data.description || '',
      ProjectStatus.planning(),
      data.themeId || null,
      data.assignedCrewIds || [],
      {},
      data.port || null,
      data.budget || null,
      data.timeline || null,
      data.features || [],
      data.technologies || [],
      now,
      now,
      data.metadata || {}
    );

    project.addDomainEvent(new ProjectCreatedEvent(
      data.id,
      data.name,
      data.createdBy
    ));

    return project;
  }

  static reconstitute(data: {
    id: string;
    name: string;
    description: string;
    status: string;
    themeId: string | null;
    assignedCrewIds: string[];
    content: Record<string, any>;
    port: number | null;
    budget: number | null;
    timeline: string | null;
    features: string[];
    technologies: string[];
    createdAt: Date;
    updatedAt: Date;
    metadata: Record<string, any>;
  }): Project {
    return new Project(
      data.id,
      data.name,
      data.description,
      ProjectStatus.fromString(data.status),
      data.themeId,
      data.assignedCrewIds,
      data.content,
      data.port,
      data.budget,
      data.timeline,
      data.features,
      data.technologies,
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

  get description(): string {
    return this._description;
  }

  get status(): ProjectStatus {
    return this._status;
  }

  get themeId(): string | null {
    return this._themeId;
  }

  get assignedCrewIds(): ReadonlyArray<string> {
    return [...this._assignedCrewIds];
  }

  get content(): Record<string, any> {
    return { ...this._content };
  }

  get port(): number | null {
    return this._port;
  }

  get budget(): number | null {
    return this._budget;
  }

  get timeline(): string | null {
    return this._timeline;
  }

  get features(): ReadonlyArray<string> {
    return [...this._features];
  }

  get technologies(): ReadonlyArray<string> {
    return [...this._technologies];
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

  get hasTheme(): boolean {
    return this._themeId !== null;
  }

  get hasContent(): boolean {
    return Object.keys(this._content).length > 0;
  }

  get crewCount(): number {
    return this._assignedCrewIds.length;
  }

  // Domain methods
  assignTheme(themeId: string): void {
    if (!themeId || themeId.trim() === '') {
      throw new ValidationError('Theme ID cannot be empty');
    }

    this._themeId = themeId;
    this._updatedAt = new Date();
  }

  assignCrew(crewMemberId: string): void {
    if (this._assignedCrewIds.includes(crewMemberId)) {
      throw new ValidationError(`Crew member ${crewMemberId} already assigned`);
    }

    this._assignedCrewIds.push(crewMemberId);
    this._updatedAt = new Date();
  }

  unassignCrew(crewMemberId: string): void {
    const index = this._assignedCrewIds.indexOf(crewMemberId);
    if (index === -1) {
      throw new ValidationError(`Crew member ${crewMemberId} not assigned`);
    }

    this._assignedCrewIds.splice(index, 1);
    this._updatedAt = new Date();
  }

  updateContent(content: Record<string, any>, editedBy: string): void {
    this._content = { ...this._content, ...content };
    this._updatedAt = new Date();

    this.addDomainEvent(new ContentEditedEvent(
      this._id,
      this._name,
      Object.keys(content),
      editedBy
    ));
  }

  activate(): void {
    if (!this._status.canTransitionTo(ProjectStatus.active())) {
      throw new ValidationError(`Cannot activate project from status: ${this._status.value}`);
    }

    this._status = ProjectStatus.active();
    this._updatedAt = new Date();
  }

  deploy(deploymentUrl: string): void {
    if (!this.hasContent) {
      throw new ValidationError('Cannot deploy project without content');
    }

    if (!this.hasTheme) {
      throw new ValidationError('Cannot deploy project without theme');
    }

    if (!this._status.canTransitionTo(ProjectStatus.deployed())) {
      throw new ValidationError(`Cannot deploy project from status: ${this._status.value}`);
    }

    this._status = ProjectStatus.deployed();
    this._metadata.deploymentUrl = deploymentUrl;
    this._metadata.lastDeployedAt = new Date().toISOString();
    this._updatedAt = new Date();

    this.addDomainEvent(new ProjectDeployedEvent(
      this._id,
      this._name,
      deploymentUrl
    ));
  }

  archive(): void {
    if (!this._status.canTransitionTo(ProjectStatus.archived())) {
      throw new ValidationError(`Cannot archive project from status: ${this._status.value}`);
    }

    this._status = ProjectStatus.archived();
    this._updatedAt = new Date();
  }

  cancel(): void {
    if (!this._status.canTransitionTo(ProjectStatus.cancelled())) {
      throw new ValidationError(`Cannot cancel project from status: ${this._status.value}`);
    }

    this._status = ProjectStatus.cancelled();
    this._updatedAt = new Date();
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
      description: this._description,
      status: this._status.value,
      themeId: this._themeId,
      assignedCrewIds: this._assignedCrewIds,
      content: this._content,
      port: this._port,
      budget: this._budget,
      timeline: this._timeline,
      features: this._features,
      technologies: this._technologies,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      metadata: this._metadata,
    };
  }
}

