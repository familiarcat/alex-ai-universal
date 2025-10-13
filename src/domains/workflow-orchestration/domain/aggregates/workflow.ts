import { Entity } from '@shared/types/common.types';
import { ValidationError } from '@shared/types/errors.types';
import { WebhookURL } from '../value-objects/webhook-url';
import { WorkflowDeployedEvent } from '../events/workflow-deployed.event';
import { WorkflowActivatedEvent } from '../events/workflow-activated.event';
import { WorkflowDeactivatedEvent } from '../events/workflow-deactivated.event';

/**
 * Workflow Aggregate Root
 * Represents an N8N workflow with its configuration and state
 */
export class Workflow implements Entity {
  private _domainEvents: any[] = [];

  private constructor(
    private readonly _id: string,
    private _name: string,
    private _n8nWorkflowId: string | null,
    private _nodes: any[], // N8N node structure
    private _connections: any, // N8N connection structure
    private _webhookUrl: WebhookURL | null,
    private _active: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _metadata: Record<string, any>
  ) {}

  static create(data: {
    id: string;
    name: string;
    nodes: any[];
    connections: any;
    n8nWorkflowId?: string;
    webhookUrl?: string;
    active?: boolean;
    metadata?: Record<string, any>;
  }): Workflow {
    if (!data.name || data.name.trim() === '') {
      throw new ValidationError('Workflow name cannot be empty');
    }

    if (!data.nodes || data.nodes.length === 0) {
      throw new ValidationError('Workflow must have at least one node');
    }

    const now = new Date();
    const workflow = new Workflow(
      data.id,
      data.name.trim(),
      data.n8nWorkflowId || null,
      data.nodes,
      data.connections,
      data.webhookUrl ? WebhookURL.create(data.webhookUrl) : null,
      data.active || false,
      now,
      now,
      data.metadata || {}
    );

    return workflow;
  }

  static reconstitute(data: {
    id: string;
    name: string;
    n8nWorkflowId: string | null;
    nodes: any[];
    connections: any;
    webhookUrl: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    metadata: Record<string, any>;
  }): Workflow {
    return new Workflow(
      data.id,
      data.name,
      data.n8nWorkflowId,
      data.nodes,
      data.connections,
      data.webhookUrl ? WebhookURL.create(data.webhookUrl) : null,
      data.active,
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

  get n8nWorkflowId(): string | null {
    return this._n8nWorkflowId;
  }

  get nodes(): any[] {
    return [...this._nodes]; // Return copy to prevent mutation
  }

  get connections(): any {
    return { ...this._connections }; // Return copy
  }

  get webhookUrl(): WebhookURL | null {
    return this._webhookUrl;
  }

  get active(): boolean {
    return this._active;
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

  get isDeployed(): boolean {
    return this._n8nWorkflowId !== null;
  }

  get hasWebhook(): boolean {
    return this._webhookUrl !== null;
  }

  // Domain methods
  deploy(n8nWorkflowId: string, webhookUrl?: string): void {
    if (this.isDeployed) {
      throw new ValidationError('Workflow is already deployed');
    }

    if (!n8nWorkflowId || n8nWorkflowId.trim() === '') {
      throw new ValidationError('N8N workflow ID is required');
    }

    this._n8nWorkflowId = n8nWorkflowId;
    
    if (webhookUrl) {
      this._webhookUrl = WebhookURL.create(webhookUrl);
    }

    this._updatedAt = new Date();

    this.addDomainEvent(new WorkflowDeployedEvent(
      this._id,
      n8nWorkflowId,
      this._name,
      webhookUrl || null
    ));
  }

  activate(): void {
    if (!this.isDeployed) {
      throw new ValidationError('Cannot activate workflow that is not deployed');
    }

    if (this._active) {
      return; // Already active
    }

    this._active = true;
    this._updatedAt = new Date();

    this.addDomainEvent(new WorkflowActivatedEvent(this._id, this._n8nWorkflowId!));
  }

  deactivate(): void {
    if (!this._active) {
      return; // Already inactive
    }

    this._active = false;
    this._updatedAt = new Date();

    this.addDomainEvent(new WorkflowDeactivatedEvent(this._id, this._n8nWorkflowId!));
  }

  updateWebhookUrl(webhookUrl: string): void {
    this._webhookUrl = WebhookURL.create(webhookUrl);
    this._updatedAt = new Date();
  }

  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
    this._updatedAt = new Date();
  }

  // Extract webhook path from nodes
  extractWebhookPath(): string | null {
    const webhookNode = this._nodes.find((n: any) => n.type === 'n8n-nodes-base.webhook');
    return webhookNode?.parameters?.path || null;
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
      n8nWorkflowId: this._n8nWorkflowId,
      nodes: this._nodes,
      connections: this._connections,
      webhookUrl: this._webhookUrl?.value || null,
      active: this._active,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      metadata: this._metadata,
    };
  }
}

