/**
 * Command to ingest a document into the knowledge base
 */
export class IngestDocumentCommand {
  constructor(
    public readonly title: string,
    public readonly content: string,
    public readonly tags: string[],
    public readonly sessionId: string,
    public readonly antiHallucinationScore: number,
    public readonly sourceFile?: string
  ) {}
}

