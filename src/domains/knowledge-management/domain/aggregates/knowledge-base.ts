import { Entity } from '@shared/types/common.types';
import { NotFoundError, ValidationError } from '@shared/types/errors.types';
import { Document } from './document';
import { Embedding } from '../value-objects/embedding';
import { DocumentIngestedEvent } from '../events/document-ingested.event';
import { KnowledgeQueriedEvent } from '../events/knowledge-queried.event';

/**
 * Knowledge Base Aggregate Root
 * Manages the collection of documents and RAG operations
 */
export class KnowledgeBase implements Entity {
  private _domainEvents: any[] = [];
  private _documents: Map<string, Document>;

  private constructor(
    private readonly _id: string,
    private _name: string,
    documents: Document[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _metadata: Record<string, any>
  ) {
    this._documents = new Map(documents.map(d => [d.id, d]));
  }

  static create(data: {
    id: string;
    name: string;
    documents?: Document[];
    metadata?: Record<string, any>;
  }): KnowledgeBase {
    if (!data.name || data.name.trim() === '') {
      throw new ValidationError('Knowledge base name cannot be empty');
    }

    const now = new Date();
    return new KnowledgeBase(
      data.id,
      data.name.trim(),
      data.documents || [],
      now,
      now,
      data.metadata || {}
    );
  }

  static reconstitute(data: {
    id: string;
    name: string;
    documents: any[];
    createdAt: Date;
    updatedAt: Date;
    metadata: Record<string, any>;
  }): KnowledgeBase {
    const documents = data.documents.map(d => Document.reconstitute(d));
    return new KnowledgeBase(
      data.id,
      data.name,
      documents,
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

  get documents(): Document[] {
    return Array.from(this._documents.values());
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

  get documentCount(): number {
    return this._documents.size;
  }

  get totalChunkCount(): number {
    return this.documents.reduce((sum, doc) => sum + doc.chunkCount, 0);
  }

  // Domain methods
  ingestDocument(document: Document): void {
    if (this._documents.has(document.id)) {
      throw new ValidationError(`Document ${document.id} already exists in knowledge base`);
    }

    this._documents.set(document.id, document);
    this._updatedAt = new Date();

    this.addDomainEvent(new DocumentIngestedEvent(
      document.id,
      document.title,
      document.sessionId,
      document.chunkCount,
      document.antiHallucinationScore.value
    ));
  }

  getDocument(documentId: string): Document {
    const document = this._documents.get(documentId);
    if (!document) {
      throw new NotFoundError('Document', documentId);
    }
    return document;
  }

  removeDocument(documentId: string): void {
    if (!this._documents.has(documentId)) {
      throw new NotFoundError('Document', documentId);
    }

    this._documents.delete(documentId);
    this._updatedAt = new Date();
  }

  searchBySimilarity(
    queryEmbedding: Embedding,
    topK: number = 10,
    minScore: number = 0.7
  ): SearchResult[] {
    const results: SearchResult[] = [];

    for (const document of this.documents) {
      for (const chunk of document.chunks) {
        const similarity = chunk.embedding.cosineSimilarity(queryEmbedding);
        
        if (similarity >= minScore) {
          results.push({
            documentId: document.id,
            documentTitle: document.title,
            chunkId: chunk.chunkId,
            chunkText: chunk.text,
            similarity,
            antiHallucinationScore: document.antiHallucinationScore.value,
            sessionId: document.sessionId,
            tags: document.tags as string[],
          });
        }
      }
    }

    // Sort by similarity descending
    results.sort((a, b) => b.similarity - a.similarity);

    // Take top K
    const topResults = results.slice(0, topK);

    // Emit domain event
    this.addDomainEvent(new KnowledgeQueriedEvent(
      this._id,
      topResults.length,
      topResults.map(r => r.documentId)
    ));

    return topResults;
  }

  searchByTags(tags: string[]): Document[] {
    return this.documents.filter(doc =>
      tags.some(tag => doc.hasTag(tag))
    );
  }

  searchBySession(sessionId: string): Document[] {
    return this.documents.filter(doc => doc.sessionId === sessionId);
  }

  getTrustedDocuments(): Document[] {
    return this.documents.filter(doc => doc.isTrusted);
  }

  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
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
      name: this._name,
      documents: this.documents.map(d => d.toJSON()),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      metadata: this._metadata,
    };
  }
}

/**
 * Search Result interface
 */
export interface SearchResult {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  chunkText: string;
  similarity: number;
  antiHallucinationScore: number;
  sessionId: string;
  tags: string[];
}

