import { Entity } from '@shared/types/common.types';
import { ValidationError } from '@shared/types/errors.types';
import { ContentEditedEvent } from '../events/content-edited.event';

/**
 * Content Editor Aggregate Root
 * Manages content editing sessions for projects
 */
export class ContentEditor implements Entity {
  private _domainEvents: any[] = [];

  private constructor(
    private readonly _id: string,
    private _projectId: string,
    private _editorId: string, // user/crew member editing
    private _content: Record<string, any>,
    private _isDirty: boolean,
    private _lastSavedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(data: {
    id: string;
    projectId: string;
    editorId: string;
    initialContent?: Record<string, any>;
  }): ContentEditor {
    if (!data.projectId) {
      throw new ValidationError('Project ID is required');
    }

    if (!data.editorId) {
      throw new ValidationError('Editor ID is required');
    }

    const now = new Date();
    return new ContentEditor(
      data.id,
      data.projectId,
      data.editorId,
      data.initialContent || {},
      false,
      null,
      now,
      now
    );
  }

  static reconstitute(data: {
    id: string;
    projectId: string;
    editorId: string;
    content: Record<string, any>;
    isDirty: boolean;
    lastSavedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): ContentEditor {
    return new ContentEditor(
      data.id,
      data.projectId,
      data.editorId,
      data.content,
      data.isDirty,
      data.lastSavedAt ? new Date(data.lastSavedAt) : null,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get projectId(): string {
    return this._projectId;
  }

  get editorId(): string {
    return this._editorId;
  }

  get content(): Record<string, any> {
    return { ...this._content };
  }

  get isDirty(): boolean {
    return this._isDirty;
  }

  get lastSavedAt(): Date | null {
    return this._lastSavedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get hasUnsavedChanges(): boolean {
    return this._isDirty;
  }

  // Domain methods
  updateContent(field: string, value: any): void {
    this._content[field] = value;
    this._isDirty = true;
    this._updatedAt = new Date();

    this.addDomainEvent(new ContentEditedEvent(
      this._id,
      this._projectId,
      field,
      this._editorId
    ));
  }

  updateMultipleFields(updates: Record<string, any>): void {
    Object.entries(updates).forEach(([field, value]) => {
      this._content[field] = value;
    });
    this._isDirty = true;
    this._updatedAt = new Date();

    Object.keys(updates).forEach(field => {
      this.addDomainEvent(new ContentEditedEvent(
        this._id,
        this._projectId,
        field,
        this._editorId
      ));
    });
  }

  save(): void {
    this._isDirty = false;
    this._lastSavedAt = new Date();
    this._updatedAt = new Date();
  }

  discard(): void {
    // In a real system, would restore from last saved state
    this._isDirty = false;
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
      projectId: this._projectId,
      editorId: this._editorId,
      content: this._content,
      isDirty: this._isDirty,
      lastSavedAt: this._lastSavedAt?.toISOString() || null,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}

