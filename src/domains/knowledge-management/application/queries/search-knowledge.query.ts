/**
 * Query to search knowledge base by semantic similarity
 */
export class SearchKnowledgeQuery {
  constructor(
    public readonly query: string,
    public readonly topK?: number,
    public readonly minScore?: number,
    public readonly sessionId?: string,
    public readonly tags?: string[]
  ) {}
}

export interface KnowledgeSearchResultDTO {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  chunkText: string;
  similarity: number;
  antiHallucinationScore: number;
  sessionId: string;
  tags: string[];
  sourceFile: string | null;
}

