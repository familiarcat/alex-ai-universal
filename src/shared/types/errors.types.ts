/**
 * Common error types for Alex AI
 */

/**
 * Base domain error
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Entity not found error
 */
export class NotFoundError extends DomainError {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id ${id} not found`);
  }
}

/**
 * Validation error
 */
export class ValidationError extends DomainError {
  constructor(message: string, public readonly errors: string[] = []) {
    super(message);
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized') {
    super(message);
  }
}

/**
 * Forbidden error
 */
export class ForbiddenError extends DomainError {
  constructor(message: string = 'Forbidden') {
    super(message);
  }
}

/**
 * Conflict error (e.g., duplicate entity)
 */
export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Infrastructure error (external systems)
 */
export class InfrastructureError extends DomainError {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
  }
}

