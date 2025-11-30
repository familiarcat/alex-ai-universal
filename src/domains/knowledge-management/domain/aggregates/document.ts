import { Entity } from '@shared/types/common.types';
import { ValidationError } from '@shared/types/errors.types';
import { Embedding } from '../value-objects/embedding';
import { AntiHallucinationScore } from '../value-objects/anti-hallucination-score';

/**
 * Document Entity
 * Represents a knowledge document with chunks and embeddings
 */
export class Document implements Entity {
  private constructor(
    private readonly _id: string,
    private _title: string,
    private _content: string,
    private _chunks: DocumentChunk[],
    private _tags: string[],
    private _sessionId: string,
    private _antiHallucinationScore: AntiHallucinationScore,
    private _sourceFile: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _metadata: Record<string, any>
  ) {}

  static create(data: {
    id: string;
    title: string;
    content: string;
    tags: string[];
    sessionId: string;
    antiHallucinationScore: number;
    sourceFile?: string;
    metadata?: Record<string, any>;
  }): Document {
    if (!data.title || data.title.trim() === '') {
      throw new ValidationError('Document title cannot be empty');
    }

    if (!data.content || data.content.trim() === '') {
      throw new ValidationError('Document content cannot be empty');
    }

    const now = new Date();
    return new Document(
      data.id,
      data.title.trim(),
      data.content,
      [], // Chunks added later
      data.tags,
      data.sessionId,
      AntiHallucinationScore.create(data.antiHallucinationScore),
      data.sourceFile || null,
      now,
      now,
      data.metadata || {}
    );
  }

  static reconstitute(data: {
    id: string;
    title: string;
    content: string;
    chunks: any[];
    tags: string[];
    sessionId: string;
    antiHallucinationScore: number;
    sourceFile: string | null;
    createdAt: Date;
    updatedAt: Date;
    metadata: Record<string, any>;
  }): Document {
    const chunks = data.chunks.map(c => ({
      chunkId: c.chunkId,
      text: c.text,
      embedding: Embedding.create(c.embedding),
      startIndex: c.startIndex,
      endIndex: c.endIndex,
    }));

    return new Document(
      data.id,
      data.title,
      data.content,
      chunks,
      data.tags,
      data.sessionId,
      AntiHallucinationScore.create(data.antiHallucinationScore),
      data.sourceFile,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.metadata
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get content(): string {
    return this._content;
  }

  get chunks(): ReadonlyArray<DocumentChunk> {
    return [...this._chunks];
  }

  get tags(): ReadonlyArray<string> {
    return [...this._tags];
  }

  get sessionId(): string {
    return this._sessionId;
  }

  get antiHallucinationScore(): AntiHallucinationScore {
    return this._antiHallucinationScore;
  }

  get sourceFile(): string | null {
    return this._sourceFile;
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

  get chunkCount(): number {
    return this._chunks.length;
  }

  get wordCount(): number {
    return this._content.split(/\s+/).length;
  }

  get charCount(): number {
    return this._content.length;
  }

  get isTrusted(): boolean {
    return this._antiHallucinationScore.isTrusted;
  }

  // Domain methods
  addChunk(chunk: DocumentChunk): void {
    this._chunks.push(chunk);
    this._updatedAt = new Date();
  }

  addChunks(chunks: DocumentChunk[]): void {
    this._chunks.push(...chunks);
    this._updatedAt = new Date();
  }

  hasTag(tag: string): boolean {
    return this._tags.some(t => t.toLowerCase() === tag.toLowerCase());
  }

  addTag(tag: string): void {
    if (!this.hasTag(tag)) {
      this._tags.push(tag);
      this._updatedAt = new Date();
    }
  }

  findSimilarChunks(queryEmbedding: Embedding, topK: number = 5): DocumentChunk[] {
    return this._chunks
      .map(chunk => ({
        chunk,
        similarity: chunk.embedding.cosineSimilarity(queryEmbedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(item => item.chunk);
  }

  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
    this._updatedAt = new Date();
  }

  // Serialization
  toJSON() {
    return {
      id: this._id,
      title: this._title,
      content: this._content,
      chunks: this._chunks.map(c => ({
        chunkId: c.chunkId,
        text: c.text,
        embedding: c.embedding.toJSON(),
        startIndex: c.startIndex,
        endIndex: c.endIndex,
      })),
      tags: this._tags,
      sessionId: this._sessionId,
      antiHallucinationScore: this._antiHallucinationScore.value,
      sourceFile: this._sourceFile,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      metadata: this._metadata,
    };
  }
}

/**
 * Document Chunk interface
 */
export interface DocumentChunk {
  chunkId: string;
  text: string;
  embedding: Embedding;
  startIndex: number;
  endIndex: number;
}

