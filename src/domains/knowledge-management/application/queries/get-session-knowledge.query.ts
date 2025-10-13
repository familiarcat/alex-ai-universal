/**
 * Query to get all knowledge from a specific session
 */
export class GetSessionKnowledgeQuery {
  constructor(
    public readonly sessionId: string
  ) {}
}

export interface SessionKnowledgeDTO {
  sessionId: string;
  documentCount: number;
  totalChunks: number;
  documents: Array<{
    id: string;
    title: string;
    tags: string[];
    antiHallucinationScore: number;
    chunkCount: number;
    createdAt: string;
  }>;
}

