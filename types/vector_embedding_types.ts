// TypeScript interfaces for Vector Embedding System
// These types enable vector-based RAG operations with crew member alignment

export interface MemoryEmbedding {
  id: number;
  memory_id: string;
  embedding: number[]; // 1536-dimensional vector
  embedding_type: 'global' | 'crew_specific' | 'content' | 'context';
  crew_member?: string;
  content_hash: string;
  created_at: string;
  updated_at: string;
}

export interface VectorSearchResult {
  memory_id: string;
  title: string;
  description: string;
  similarity_score: number;
  crew_member?: string;
  embedding_type: string;
}

export interface CrewKnowledgeResult {
  memory_id: string;
  title: string;
  description: string;
  similarity_score: number;
  crew_responsibilities?: string;
}

export interface GlobalKnowledgeResult {
  memory_id: string;
  title: string;
  description: string;
  similarity_score: number;
  universal_applicability: boolean;
}

export interface ComprehensiveKnowledgeResult {
  knowledge_type: 'global' | 'crew_specific';
  memory_id: string;
  title: string;
  description: string;
  similarity_score: number;
  crew_member?: string;
  crew_responsibilities?: string;
}

// Crew Member Types
export type CrewMember = 
  | 'captain_picard'
  | 'commander_data'
  | 'lieutenant_geordi'
  | 'lieutenant_worf'
  | 'dr_crusher'
  | 'commander_riker'
  | 'counselor_troi'
  | 'lieutenant_uhura'
  | 'quark';

export type EmbeddingType = 'global' | 'crew_specific' | 'content' | 'context';

// Vector Embedding Client Interface
export interface VectorEmbeddingClient {
  // Embedding generation
  generateMemoryEmbeddings(memoryId: string): Promise<void>;
  updateMemoryEmbeddings(memoryId: string): Promise<void>;
  
  // Vector search
  searchMemoriesByVector(
    queryEmbedding: number[],
    options?: VectorSearchOptions
  ): Promise<VectorSearchResult[]>;
  
  // Crew-specific knowledge
  getCrewKnowledge(
    crewMember: CrewMember,
    queryEmbedding: number[],
    limit?: number
  ): Promise<CrewKnowledgeResult[]>;
  
  // Global knowledge
  getGlobalKnowledge(
    queryEmbedding: number[],
    limit?: number
  ): Promise<GlobalKnowledgeResult[]>;
  
  // Comprehensive knowledge
  getComprehensiveKnowledge(
    queryText: string,
    queryEmbedding: number[],
    options?: ComprehensiveKnowledgeOptions
  ): Promise<ComprehensiveKnowledgeResult[]>;
}

export interface VectorSearchOptions {
  similarityThreshold?: number;
  limitResults?: number;
  crewMemberFilter?: CrewMember;
  embeddingTypeFilter?: EmbeddingType;
}

export interface ComprehensiveKnowledgeOptions {
  includeCrewKnowledge?: boolean;
  similarityThreshold?: number;
}

// Crew Member Capabilities Mapping
export interface CrewCapabilities {
  captain_picard: {
    primary_role: 'Strategic Leadership';
    capabilities: [
      'Strategic decision making',
      'Crew coordination',
      'Mission oversight',
      'Governance enforcement'
    ];
    knowledge_domains: [
      'Prime Directive',
      'Strategic planning',
      'Team coordination',
      'Governance'
    ];
  };
  commander_data: {
    primary_role: 'Analytics & Pattern Recognition';
    capabilities: [
      'Data analysis',
      'Pattern recognition',
      'Performance metrics',
      'System optimization'
    ];
    knowledge_domains: [
      'Analytics',
      'Pattern recognition',
      'Performance optimization',
      'Data processing'
    ];
  };
  lieutenant_geordi: {
    primary_role: 'Technical Integration';
    capabilities: [
      'Technical implementation',
      'System integration',
      'Engineering solutions',
      'Technical optimization'
    ];
    knowledge_domains: [
      'Technical implementation',
      'System integration',
      'Engineering',
      'Technical optimization'
    ];
  };
  lieutenant_worf: {
    primary_role: 'Security & Validation';
    capabilities: [
      'Security validation',
      'Threat assessment',
      'Access control',
      'Security monitoring'
    ];
    knowledge_domains: [
      'Security',
      'Validation',
      'Threat assessment',
      'Access control'
    ];
  };
  dr_crusher: {
    primary_role: 'Health & Diagnostics';
    capabilities: [
      'System health monitoring',
      'Performance diagnostics',
      'Health analysis',
      'System recovery'
    ];
    knowledge_domains: [
      'System health',
      'Performance diagnostics',
      'Health monitoring',
      'Recovery'
    ];
  };
  commander_riker: {
    primary_role: 'Tactical Execution';
    capabilities: [
      'Tactical execution',
      'Workflow management',
      'Process coordination',
      'Execution oversight'
    ];
    knowledge_domains: [
      'Tactical execution',
      'Workflow management',
      'Process coordination',
      'Execution'
    ];
  };
  counselor_troi: {
    primary_role: 'User Experience';
    capabilities: [
      'User experience optimization',
      'Emotional intelligence',
      'User feedback analysis',
      'Experience enhancement'
    ];
    knowledge_domains: [
      'User experience',
      'Emotional intelligence',
      'User feedback',
      'Experience design'
    ];
  };
  lieutenant_uhura: {
    primary_role: 'Communication';
    capabilities: [
      'Communication standards',
      'Data transmission',
      'Information flow',
      'Communication optimization'
    ];
    knowledge_domains: [
      'Communication',
      'Data transmission',
      'Information flow',
      'Communication standards'
    ];
  };
  quark: {
    primary_role: 'Business Optimization';
    capabilities: [
      'Business optimization',
      'Efficiency analysis',
      'ROI calculation',
      'Business intelligence'
    ];
    knowledge_domains: [
      'Business optimization',
      'Efficiency',
      'ROI analysis',
      'Business intelligence'
    ];
  };
}

// Vector Embedding Service Interface
export interface EmbeddingService {
  generateEmbedding(text: string): Promise<number[]>;
  generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
  calculateSimilarity(embedding1: number[], embedding2: number[]): number;
}

// RAG Vector Query Interface
export interface RAGVectorQuery {
  queryText: string;
  queryEmbedding: number[];
  searchOptions: VectorSearchOptions;
  crewMemberFilter?: CrewMember;
  includeGlobalKnowledge: boolean;
  includeCrewKnowledge: boolean;
}

// Vector Embedding Configuration
export interface VectorEmbeddingConfig {
  embeddingDimension: number; // 1536 for OpenAI ada-002
  similarityThreshold: number;
  maxResults: number;
  enableCrewSpecificEmbeddings: boolean;
  enableGlobalEmbeddings: boolean;
  enableContentEmbeddings: boolean;
  enableContextEmbeddings: boolean;
}

// Usage Examples
export const VectorEmbeddingExamples = {
  // Search for PR creation knowledge
  searchPRCreation: async (
    client: VectorEmbeddingClient,
    queryText: string,
    queryEmbedding: number[]
  ) => {
    return await client.searchMemoriesByVector(queryEmbedding, {
      similarityThreshold: 0.7,
      limitResults: 10,
      embeddingTypeFilter: 'global'
    });
  },
  
  // Get crew-specific knowledge
  getCrewKnowledge: async (
    client: VectorEmbeddingClient,
    crewMember: CrewMember,
    queryEmbedding: number[]
  ) => {
    return await client.getCrewKnowledge(crewMember, queryEmbedding, 5);
  },
  
  // Get comprehensive knowledge
  getComprehensiveKnowledge: async (
    client: VectorEmbeddingClient,
    queryText: string,
    queryEmbedding: number[]
  ) => {
    return await client.getComprehensiveKnowledge(queryText, queryEmbedding, {
      includeCrewKnowledge: true,
      similarityThreshold: 0.7
    });
  }
};

// Type guards
export function isCrewMember(value: string): value is CrewMember {
  const crewMembers: CrewMember[] = [
    'captain_picard', 'commander_data', 'lieutenant_geordi',
    'lieutenant_worf', 'dr_crusher', 'commander_riker',
    'counselor_troi', 'lieutenant_uhura', 'quark'
  ];
  return crewMembers.includes(value as CrewMember);
}

export function isEmbeddingType(value: string): value is EmbeddingType {
  const embeddingTypes: EmbeddingType[] = [
    'global', 'crew_specific', 'content', 'context'
  ];
  return embeddingTypes.includes(value as EmbeddingType);
}

export function isValidEmbedding(embedding: number[]): boolean {
  return embedding.length === 1536 && embedding.every(val => typeof val === 'number');
}
