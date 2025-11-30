import { Entity } from '@shared/types/common.types';
import { ValidationError } from '@shared/types/errors.types';
import { ExecutionStatus, ExecutionStatusType } from '../value-objects/execution-status';
import { WorkflowExecutedEvent } from '../events/workflow-executed.event';
import { ExecutionFailedEvent } from '../events/execution-failed.event';

/**
 * Workflow Execution Aggregate
 * Represents a single execution of a workflow
 */
export class Execution implements Entity {
  private _domainEvents: any[] = [];

  private constructor(
    private readonly _id: string,
    private readonly _workflowId: string,
    private readonly _n8nExecutionId: string | null,
    private _status: ExecutionStatus,
    private readonly _input: any,
    private _output: any | null,
    private _error: string | null,
    private readonly _triggeredBy: string,
    private readonly _startedAt: Date,
    private _completedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(data: {
    id: string;
    workflowId: string;
    input: any;
    triggeredBy: string;
    n8nExecutionId?: string;
  }): Execution {
    if (!data.workflowId) {
      throw new ValidationError('Workflow ID is required');
    }

    if (!data.triggeredBy) {
      throw new ValidationError('Triggered by is required');
    }

    const now = new Date();
    return new Execution(
      data.id,
      data.workflowId,
      data.n8nExecutionId || null,
      ExecutionStatus.pending(),
      data.input,
      null,
      null,
      data.triggeredBy,
      now,
      null,
      now,
      now
    );
  }

  static reconstitute(data: {
    id: string;
    workflowId: string;
    n8nExecutionId: string | null;
    status: string;
    input: any;
    output: any | null;
    error: string | null;
    triggeredBy: string;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Execution {
    return new Execution(
      data.id,
      data.workflowId,
      data.n8nExecutionId,
      ExecutionStatus.fromString(data.status),
      data.input,
      data.output,
      data.error,
      data.triggeredBy,
      new Date(data.startedAt),
      data.completedAt ? new Date(data.completedAt) : null,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get workflowId(): string {
    return this._workflowId;
  }

  get n8nExecutionId(): string | null {
    return this._n8nExecutionId;
  }

  get status(): ExecutionStatus {
    return this._status;
  }

  get input(): any {
    return this._input;
  }

  get output(): any | null {
    return this._output;
  }

  get error(): string | null {
    return this._error;
  }

  get triggeredBy(): string {
    return this._triggeredBy;
  }

  get startedAt(): Date {
    return this._startedAt;
  }

  get completedAt(): Date | null {
    return this._completedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get duration(): number | null {
    if (!this._completedAt) return null;
    return this._completedAt.getTime() - this._startedAt.getTime();
  }

  // Domain methods
  start(n8nExecutionId: string): void {
    if (!this._status.canTransitionTo(ExecutionStatus.running())) {
      throw new ValidationError(`Cannot start execution from status: ${this._status.value}`);
    }

    this._status = ExecutionStatus.running();
    this._updatedAt = new Date();
  }

  complete(output: any): void {
    if (!this._status.canTransitionTo(ExecutionStatus.completed())) {
      throw new ValidationError(`Cannot complete execution from status: ${this._status.value}`);
    }

    this._status = ExecutionStatus.completed();
    this._output = output;
    this._completedAt = new Date();
    this._updatedAt = new Date();

    this.addDomainEvent(new WorkflowExecutedEvent(
      this._id,
      this._workflowId,
      this._status.value,
      this._output,
      this._completedAt
    ));
  }

  fail(error: string): void {
    if (!this._status.canTransitionTo(ExecutionStatus.failed())) {
      throw new ValidationError(`Cannot fail execution from status: ${this._status.value}`);
    }

    this._status = ExecutionStatus.failed();
    this._error = error;
    this._completedAt = new Date();
    this._updatedAt = new Date();

    this.addDomainEvent(new ExecutionFailedEvent(
      this._id,
      this._workflowId,
      error,
      this._completedAt
    ));
  }

  cancel(): void {
    if (!this._status.canTransitionTo(ExecutionStatus.canceled())) {
      throw new ValidationError(`Cannot cancel execution from status: ${this._status.value}`);
    }

    this._status = ExecutionStatus.canceled();
    this._completedAt = new Date();
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
      workflowId: this._workflowId,
      n8nExecutionId: this._n8nExecutionId,
      status: this._status.value,
      input: this._input,
      output: this._output,
      error: this._error,
      triggeredBy: this._triggeredBy,
      startedAt: this._startedAt.toISOString(),
      completedAt: this._completedAt?.toISOString() || null,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      duration: this.duration,
    };
  }
}

