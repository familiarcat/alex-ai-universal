import { ValueObject } from '@shared/types/common.types';
import { ValidationError } from '@shared/types/errors.types';

/**
 * Anti-Hallucination Score value object
 * Represents confidence in knowledge accuracy (0-100)
 */
export class AntiHallucinationScore implements ValueObject {
  private static readonly MIN_SCORE = 0;
  private static readonly MAX_SCORE = 100;

  private constructor(private readonly _value: number) {}

  static create(value: number): AntiHallucinationScore {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError('Anti-hallucination score must be a number');
    }

    if (value < AntiHallucinationScore.MIN_SCORE || value > AntiHallucinationScore.MAX_SCORE) {
      throw new ValidationError(
        `Anti-hallucination score must be between ${AntiHallucinationScore.MIN_SCORE} and ${AntiHallucinationScore.MAX_SCORE}`
      );
    }

    return new AntiHallucinationScore(value);
  }

  static perfect(): AntiHallucinationScore {
    return new AntiHallucinationScore(100);
  }

  static high(): AntiHallucinationScore {
    return new AntiHallucinationScore(90);
  }

  static medium(): AntiHallucinationScore {
    return new AntiHallucinationScore(70);
  }

  static low(): AntiHallucinationScore {
    return new AntiHallucinationScore(50);
  }

  get value(): number {
    return this._value;
  }

  get isPerfect(): boolean {
    return this._value === 100;
  }

  get isHigh(): boolean {
    return this._value >= 80;
  }

  get isMedium(): boolean {
    return this._value >= 60 && this._value < 80;
  }

  get isLow(): boolean {
    return this._value < 60;
  }

  get isTrusted(): boolean {
    return this._value >= 70; // Threshold for trusted knowledge
  }

  get confidence(): 'perfect' | 'high' | 'medium' | 'low' {
    if (this.isPerfect) return 'perfect';
    if (this.isHigh) return 'high';
    if (this.isMedium) return 'medium';
    return 'low';
  }

  equals(other: AntiHallucinationScore): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return `${this._value}%`;
  }

  toJSON(): number {
    return this._value;
  }
}

