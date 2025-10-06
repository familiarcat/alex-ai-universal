/**
 * Crew RAG Query Interface
 * Enables crew members to query documentation stored in Supabase vector RAG system
 */

import { createClient } from '@supabase/supabase-js';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  keywords: string[];
}

interface DocumentationChunk {
  id: string;
  document_id: string;
  content: string;
  metadata: {
    crew_relevance: Record<string, number>;
    keywords: string[];
    section?: string;
    chunk_index: number;
    total_chunks: number;
    crew_relevant: boolean;
  };
  similarity: number;
}

interface QueryResult {
  chunks: DocumentationChunk[];
  totalResults: number;
  crewMember: string;
  query: string;
  timestamp: string;
}

export class CrewRAGQuery {
  private supabase: any;
  private crewMembers: CrewMember[];

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    this.crewMembers = [
      {
        id: 'captain_picard',
        name: 'Captain Jean-Luc Picard',
        role: 'Strategic Commander',
        expertise: ['Strategic Leadership', 'System Integration', 'Decision Making'],
        keywords: ['strategic', 'leadership', 'command', 'decision', 'mission', 'planning', 'coordination']
      },
      {
        id: 'commander_data',
        name: 'Commander Data',
        role: 'Operations Officer',
        expertise: ['Analytics', 'Logic', 'Data Processing', 'AI/ML'],
        keywords: ['data', 'analysis', 'logic', 'processing', 'analytics', 'metrics', 'performance']
      },
      {
        id: 'commander_riker',
        name: 'Commander William Riker',
        role: 'First Officer',
        expertise: ['Tactical Operations', 'Workflow Management', 'Execution'],
        keywords: ['operations', 'tactical', 'execution', 'workflow', 'management', 'coordination']
      },
      {
        id: 'lieutenant_geordi',
        name: 'Lieutenant Commander Geordi La Forge',
        role: 'Chief Engineer',
        expertise: ['Infrastructure', 'System Integration', 'Technical Solutions'],
        keywords: ['engineering', 'technical', 'infrastructure', 'system', 'architecture', 'implementation']
      },
      {
        id: 'lieutenant_worf',
        name: 'Lieutenant Worf',
        role: 'Security Officer',
        expertise: ['Security Protocols', 'Threat Assessment', 'Compliance'],
        keywords: ['security', 'threat', 'compliance', 'vulnerability', 'protection', 'audit']
      },
      {
        id: 'counselor_troi',
        name: 'Counselor Deanna Troi',
        role: 'Ship\'s Counselor',
        expertise: ['User Experience', 'Communication', 'Team Dynamics'],
        keywords: ['user experience', 'communication', 'team dynamics', 'interface', 'usability']
      },
      {
        id: 'dr_crusher',
        name: 'Dr. Beverly Crusher',
        role: 'Chief Medical Officer',
        expertise: ['System Health', 'Diagnostics', 'Wellness'],
        keywords: ['performance', 'health', 'diagnostics', 'optimization', 'monitoring', 'wellness']
      },
      {
        id: 'lieutenant_uhura',
        name: 'Lieutenant Uhura',
        role: 'Communications Officer',
        expertise: ['Communication Protocols', 'Synchronization', 'Integration'],
        keywords: ['communication', 'integration', 'synchronization', 'protocols', 'connectivity']
      },
      {
        id: 'quark',
        name: 'Quark',
        role: 'Business Operations',
        expertise: ['Cost Optimization', 'Efficiency Analysis', 'Business Metrics'],
        keywords: ['business', 'cost', 'efficiency', 'metrics', 'optimization', 'value', 'roi']
      }
    ];
  }

  /**
   * Query documentation for a specific crew member
   */
  async queryForCrewMember(crewMemberId: string, query: string, limit: number = 5): Promise<QueryResult> {
    const crewMember = this.crewMembers.find(member => member.id === crewMemberId);
    if (!crewMember) {
      throw new Error(`Crew member ${crewMemberId} not found`);
    }

    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Query the vector database
      const { data, error } = await this.supabase.rpc('match_document_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: limit * 2 // Get more results to filter by crew relevance
      });

      if (error) {
        throw new Error(`Vector query failed: ${error.message}`);
      }

      // Filter results by crew relevance and sort by relevance score
      const relevantChunks = data
        .filter((chunk: DocumentationChunk) => {
          const crewRelevance = chunk.metadata.crew_relevance?.[crewMemberId];
          return crewRelevance && crewRelevance > 0;
        })
        .sort((a: DocumentationChunk, b: DocumentationChunk) => {
          const aRelevance = a.metadata.crew_relevance?.[crewMemberId] || 0;
          const bRelevance = b.metadata.crew_relevance?.[crewMemberId] || 0;
          return bRelevance - aRelevance;
        })
        .slice(0, limit);

      return {
        chunks: relevantChunks,
        totalResults: relevantChunks.length,
        crewMember: crewMember.name,
        query,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error querying for crew member:', error);
      throw error;
    }
  }

  /**
   * Get milestone information
   */
  async getMilestoneInformation(milestoneId: string) {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .select('*')
        .eq('metadata->>milestone_id', milestoneId)
        .single();

      if (error) {
        throw new Error(`Failed to get milestone: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting milestone information:', error);
      throw error;
    }
  }

  /**
   * Get all crew-relevant documents
   */
  async getCrewRelevantDocuments(crewMemberId: string, limit: number = 10) {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .select('*')
        .eq('metadata->>crew_relevant', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to get crew documents: ${error.message}`);
      }

      // Filter by crew member relevance
      return data.filter(doc => {
        const crewRelevance = doc.metadata?.crew_relevance?.[crewMemberId];
        return crewRelevance && crewRelevance > 0;
      });
    } catch (error) {
      console.error('Error getting crew relevant documents:', error);
      throw error;
    }
  }

  /**
   * Get crew member expertise and capabilities
   */
  getCrewMemberInfo(crewMemberId: string): CrewMember | null {
    return this.crewMembers.find(member => member.id === crewMemberId) || null;
  }

  /**
   * Get all crew members
   */
  getAllCrewMembers(): CrewMember[] {
    return this.crewMembers;
  }

  /**
   * Search documentation by keywords
   */
  async searchByKeywords(keywords: string[], limit: number = 10) {
    try {
      const keywordQuery = keywords.join(' ');
      const queryEmbedding = await this.generateEmbedding(keywordQuery);
      
      const { data, error } = await this.supabase.rpc('match_document_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.6,
        match_count: limit
      });

      if (error) {
        throw new Error(`Keyword search failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error searching by keywords:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for text (placeholder - would use OpenAI API in production)
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // In production, this would call OpenAI's embedding API
    // For now, we'll create a simple hash-based embedding
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(1536).fill(0);
    
    words.forEach(word => {
      const hash = this.simpleHash(word);
      const index = hash % 1536;
      embedding[index] += 1;
    });

    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  /**
   * Simple hash function for text
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Analyze crew relevance of a query
   */
  analyzeQueryRelevance(query: string): { crewMember: string; relevance: number }[] {
    const results = this.crewMembers.map(member => {
      let relevance = 0;
      const queryLower = query.toLowerCase();
      
      member.keywords.forEach(keyword => {
        if (queryLower.includes(keyword)) {
          relevance += 1;
        }
      });

      return { crewMember: member.id, relevance };
    });

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Get documentation statistics
   */
  async getDocumentationStats() {
    try {
      const { data: docCount } = await this.supabase
        .from('documents')
        .select('count', { count: 'exact' });

      const { data: chunkCount } = await this.supabase
        .from('document_chunks')
        .select('count', { count: 'exact' });

      const { data: crewRelevantCount } = await this.supabase
        .from('documents')
        .select('count', { count: 'exact' })
        .eq('metadata->>crew_relevant', true);

      return {
        totalDocuments: docCount?.[0]?.count || 0,
        totalChunks: chunkCount?.[0]?.count || 0,
        crewRelevantDocuments: crewRelevantCount?.[0]?.count || 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting documentation stats:', error);
      throw error;
    }
  }
}

export default CrewRAGQuery;
