import { ValueObject } from '@shared/types/common.types';
import { ValidationError } from '@shared/types/errors.types';

/**
 * Project Status enumeration
 */
export enum ProjectStatusType {
  PLANNING = 'planning',
  ACTIVE = 'active',
  DEPLOYED = 'deployed',
  ARCHIVED = 'archived',
  CANCELLED = 'cancelled',
}

/**
 * Project Status value object
 * Ensures status transitions follow proper lifecycle
 */
export class ProjectStatus implements ValueObject {
  private constructor(private readonly _value: ProjectStatusType) {}

  static planning(): ProjectStatus {
    return new ProjectStatus(ProjectStatusType.PLANNING);
  }

  static active(): ProjectStatus {
    return new ProjectStatus(ProjectStatusType.ACTIVE);
  }

  static deployed(): ProjectStatus {
    return new ProjectStatus(ProjectStatusType.DEPLOYED);
  }

  static archived(): ProjectStatus {
    return new ProjectStatus(ProjectStatusType.ARCHIVED);
  }

  static cancelled(): ProjectStatus {
    return new ProjectStatus(ProjectStatusType.CANCELLED);
  }

  static fromString(status: string): ProjectStatus {
    const normalized = status.toLowerCase();
    
    switch (normalized) {
      case 'planning':
        return ProjectStatus.planning();
      case 'active':
      case 'in_progress':
        return ProjectStatus.active();
      case 'deployed':
      case 'production':
        return ProjectStatus.deployed();
      case 'archived':
        return ProjectStatus.archived();
      case 'cancelled':
      case 'canceled':
        return ProjectStatus.cancelled();
      default:
        throw new ValidationError(`Invalid project status: ${status}`);
    }
  }

  get value(): ProjectStatusType {
    return this._value;
  }

  get isPlanning(): boolean {
    return this._value === ProjectStatusType.PLANNING;
  }

  get isActive(): boolean {
    return this._value === ProjectStatusType.ACTIVE;
  }

  get isDeployed(): boolean {
    return this._value === ProjectStatusType.DEPLOYED;
  }

  get isArchived(): boolean {
    return this._value === ProjectStatusType.ARCHIVED;
  }

  get isCancelled(): boolean {
    return this._value === ProjectStatusType.CANCELLED;
  }

  get isTerminal(): boolean {
    return this.isArchived || this.isCancelled;
  }

  canTransitionTo(newStatus: ProjectStatus): boolean {
    // Define valid state transitions
    const validTransitions: Record<ProjectStatusType, ProjectStatusType[]> = {
      [ProjectStatusType.PLANNING]: [
        ProjectStatusType.ACTIVE, 
        ProjectStatusType.CANCELLED
      ],
      [ProjectStatusType.ACTIVE]: [
        ProjectStatusType.DEPLOYED,
        ProjectStatusType.CANCELLED,
        ProjectStatusType.PLANNING, // Can go back to planning
      ],
      [ProjectStatusType.DEPLOYED]: [
        ProjectStatusType.ACTIVE, // Can redeploy
        ProjectStatusType.ARCHIVED,
      ],
      [ProjectStatusType.ARCHIVED]: [], // Terminal state
      [ProjectStatusType.CANCELLED]: [], // Terminal state
    };

    return validTransitions[this._value].includes(newStatus._value);
  }

  equals(other: ProjectStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }
}

