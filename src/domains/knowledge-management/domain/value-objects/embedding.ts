import { ValueObject } from '@shared/types/common.types';
import { ValidationError } from '@shared/types/errors.types';

/**
 * Embedding value object
 * Represents a 1536-dimension vector embedding from OpenAI
 */
export class Embedding implements ValueObject {
  private static readonly EXPECTED_DIMENSION = 1536;

  private constructor(private readonly _vector: ReadonlyArray<number>) {}

  static create(vector: number[]): Embedding {
    if (!vector || vector.length === 0) {
      throw new ValidationError('Embedding vector cannot be empty');
    }

    if (vector.length !== Embedding.EXPECTED_DIMENSION) {
      throw new ValidationError(
        `Embedding must be ${Embedding.EXPECTED_DIMENSION} dimensions, got ${vector.length}`
      );
    }

    // Validate all values are numbers
    if (!vector.every(v => typeof v === 'number' && !isNaN(v))) {
      throw new ValidationError('Embedding vector must contain only valid numbers');
    }

    return new Embedding(vector);
  }

  get vector(): ReadonlyArray<number> {
    return this._vector;
  }

  get dimension(): number {
    return this._vector.length;
  }

  /**
   * Calculate cosine similarity with another embedding
   */
  cosineSimilarity(other: Embedding): number {
    if (this.dimension !== other.dimension) {
      throw new ValidationError('Embeddings must have same dimensions for similarity');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < this.dimension; i++) {
      dotProduct += this._vector[i] * other._vector[i];
      magnitudeA += this._vector[i] ** 2;
      magnitudeB += other._vector[i] ** 2;
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Euclidean distance to another embedding
   */
  euclideanDistance(other: Embedding): number {
    if (this.dimension !== other.dimension) {
      throw new ValidationError('Embeddings must have same dimensions for distance');
    }

    let sum = 0;
    for (let i = 0; i < this.dimension; i++) {
      const diff = this._vector[i] - other._vector[i];
      sum += diff * diff;
    }

    return Math.sqrt(sum);
  }

  equals(other: Embedding): boolean {
    if (this.dimension !== other.dimension) {
      return false;
    }

    return this._vector.every((v, i) => v === other._vector[i]);
  }

  toJSON(): number[] {
    return [...this._vector];
  }

  toString(): string {
    return `Embedding(dim=${this.dimension})`;
  }
}

