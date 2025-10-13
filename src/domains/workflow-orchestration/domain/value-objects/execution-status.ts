import { ValueObject } from '@shared/types/common.types';
import { ValidationError } from '@shared/types/errors.types';

/**
 * Workflow execution status
 */
export enum ExecutionStatusType {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

/**
 * Execution Status value object
 * Ensures status transitions follow proper workflow lifecycle
 */
export class ExecutionStatus implements ValueObject {
  private constructor(private readonly _value: ExecutionStatusType) {}

  static pending(): ExecutionStatus {
    return new ExecutionStatus(ExecutionStatusType.PENDING);
  }

  static running(): ExecutionStatus {
    return new ExecutionStatus(ExecutionStatusType.RUNNING);
  }

  static completed(): ExecutionStatus {
    return new ExecutionStatus(ExecutionStatusType.COMPLETED);
  }

  static failed(): ExecutionStatus {
    return new ExecutionStatus(ExecutionStatusType.FAILED);
  }

  static canceled(): ExecutionStatus {
    return new ExecutionStatus(ExecutionStatusType.CANCELED);
  }

  static fromString(status: string): ExecutionStatus {
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending':
        return ExecutionStatus.pending();
      case 'running':
        return ExecutionStatus.running();
      case 'completed':
      case 'success':
        return ExecutionStatus.completed();
      case 'failed':
      case 'error':
        return ExecutionStatus.failed();
      case 'canceled':
      case 'cancelled':
        return ExecutionStatus.canceled();
      default:
        throw new ValidationError(`Invalid execution status: ${status}`);
    }
  }

  get value(): ExecutionStatusType {
    return this._value;
  }

  get isPending(): boolean {
    return this._value === ExecutionStatusType.PENDING;
  }

  get isRunning(): boolean {
    return this._value === ExecutionStatusType.RUNNING;
  }

  get isCompleted(): boolean {
    return this._value === ExecutionStatusType.COMPLETED;
  }

  get isFailed(): boolean {
    return this._value === ExecutionStatusType.FAILED;
  }

  get isCanceled(): boolean {
    return this._value === ExecutionStatusType.CANCELED;
  }

  get isTerminal(): boolean {
    return this.isCompleted || this.isFailed || this.isCanceled;
  }

  canTransitionTo(newStatus: ExecutionStatus): boolean {
    // Define valid state transitions
    const validTransitions: Record<ExecutionStatusType, ExecutionStatusType[]> = {
      [ExecutionStatusType.PENDING]: [ExecutionStatusType.RUNNING, ExecutionStatusType.CANCELED],
      [ExecutionStatusType.RUNNING]: [ExecutionStatusType.COMPLETED, ExecutionStatusType.FAILED, ExecutionStatusType.CANCELED],
      [ExecutionStatusType.COMPLETED]: [], // Terminal state
      [ExecutionStatusType.FAILED]: [], // Terminal state
      [ExecutionStatusType.CANCELED]: [], // Terminal state
    };

    return validTransitions[this._value].includes(newStatus._value);
  }

  equals(other: ExecutionStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }
}

