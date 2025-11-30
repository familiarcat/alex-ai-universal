/**
 * Common types shared across all domains
 * Keep this minimal - domains should own their own models
 */

/**
 * Base interface for all domain entities with identity
 */
export interface Entity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Base interface for all value objects (no identity)
 */
export interface ValueObject {
  equals(other: this): boolean;
}

/**
 * Base interface for all domain events
 */
export interface DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
}

/**
 * Common ID type
 */
export type ID = string;

/**
 * Common timestamp type
 */
export type Timestamp = Date;

/**
 * Common status enumeration
 */
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ARCHIVED = 'archived',
}

/**
 * Common result type for operations that can fail
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Helper to create successful result
 */
export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Helper to create failed result
 */
export function failure<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Common metadata type
 */
export interface Metadata {
  [key: string]: string | number | boolean | Date | null;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

