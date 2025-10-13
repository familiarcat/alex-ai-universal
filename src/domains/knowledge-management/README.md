# 🧠 Knowledge Management Domain

**Bounded Context:** RAG system for storing, retrieving, and searching crew knowledge

## Purpose

The Knowledge Management domain handles:
- Document ingestion and chunking
- Vector embeddings (1536-dim)
- Semantic search
- Anti-hallucination scoring
- Session knowledge tracking

## Ubiquitous Language

- **Knowledge Base**: The RAG vector database
- **Document**: Unit of knowledge to be stored
- **Chunk**: Subdivided document for embedding
- **Embedding**: Vector representation (1536-dimension)
- **Query**: Search for relevant knowledge
- **Anti-Hallucination Score**: Verification confidence (0-100)

## Aggregates

### KnowledgeBase (Root)
- **Identity**: Unique knowledge base ID
- **Properties**: Documents, index status, metadata
- **Operations**: Ingest document, search, query

### Document
- **Identity**: Unique document ID
- **Properties**: Content, chunks, embeddings, metadata
- **Invariants**:
  - Must have valid content
  - Chunks must not exceed max size
  - Each chunk must have embedding

## Domain Events

- `DocumentIngested`: Document added to knowledge base
- `KnowledgeQueried`: Search performed
- `LearningShared`: Knowledge distributed to crew
- `SessionCompleted`: Session knowledge finalized

## Value Objects

- **Embedding**: 1536-dimension float vector
- **Metadata**: Tags, dates, anti-hallucination scores
- **AntiHallucinationScore**: 0-100 confidence score

## Domain Services

- **EmbeddingService**: Generates embeddings via LLM
- **ChunkingService**: Splits documents intelligently

## Dependencies

- **Outbound**: 
  - Infrastructure (Supabase vector store)
  - Infrastructure (LLM providers)
- **Inbound**: All domains (for queries)

## Migration Status

- [ ] Directory structure created
- [ ] Aggregates defined
- [ ] Value objects implemented
- [ ] Domain events defined
- [ ] Commands/queries created
- [ ] Repository interfaces defined
- [ ] Tests written
- [ ] Legacy code migrated from scripts/prepare-rag-knowledge-base.js

## Crew Assignment

**Owner**: Commander Data  
**Effort**: 4 hours  
**Priority**: CRITICAL

