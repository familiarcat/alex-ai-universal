/**
 * Knowledge Base Repository Interface
 */

import { KnowledgeBase } from '../../domain/aggregates/knowledge-base';
import { Document } from '../../domain/aggregates/document';

export interface KnowledgeBaseRepository {
  /**
   * Get the knowledge base
   */
  get(): Promise<KnowledgeBase>;

  /**
   * Save knowledge base
   */
  save(knowledgeBase: KnowledgeBase): Promise<void>;

  /**
   * Find document by ID
   */
  findDocumentById(documentId: string): Promise<Document | null>;

  /**
   * Find documents by session
   */
  findDocumentsBySession(sessionId: string): Promise<Document[]>;

  /**
   * Find documents by tags
   */
  findDocumentsByTags(tags: string[]): Promise<Document[]>;

  /**
   * Find trusted documents (high anti-hallucination score)
   */
  findTrustedDocuments(): Promise<Document[]>;

  /**
   * Save document
   */
  saveDocument(document: Document): Promise<void>;

  /**
   * Delete document
   */
  deleteDocument(documentId: string): Promise<void>;
}

