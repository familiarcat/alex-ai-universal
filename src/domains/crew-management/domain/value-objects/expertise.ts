import { ValueObject } from '@shared/types/common.types';
import { ValidationError } from '@shared/types/errors.types';

/**
 * Expertise value object
 * Represents a crew member's specialized knowledge area
 */
export class Expertise implements ValueObject {
  private constructor(private readonly _areas: ReadonlyArray<string>) {
    if (_areas.length === 0) {
      throw new ValidationError('Expertise must have at least one area');
    }
  }

  static create(areas: string[]): Expertise {
    const normalized = areas
      .filter(a => a && a.trim() !== '')
      .map(a => a.trim());
    
    if (normalized.length === 0) {
      throw new ValidationError('Expertise areas cannot be empty');
    }

    return new Expertise(normalized);
  }

  get areas(): ReadonlyArray<string> {
    return this._areas;
  }

  hasArea(area: string): boolean {
    return this._areas.some(a => 
      a.toLowerCase() === area.toLowerCase()
    );
  }

  includes(searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    return this._areas.some(a => 
      a.toLowerCase().includes(term)
    );
  }

  equals(other: Expertise): boolean {
    if (this._areas.length !== other._areas.length) {
      return false;
    }
    
    return this._areas.every((area, index) => 
      area === other._areas[index]
    );
  }

  toString(): string {
    return this._areas.join(', ');
  }

  toJSON(): string[] {
    return [...this._areas];
  }
}

