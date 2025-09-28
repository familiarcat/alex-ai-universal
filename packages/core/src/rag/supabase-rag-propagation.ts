/**
 * Supabase Self-Propagating RAG Structure
 * Handles memory storage, retrieval, and self-propagation for N8N crew members
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface RAGMemory {
  id: string;
  content: string;
  crewMember: string;
  sessionId: string;
  prompt: string;
  response: string;
  embeddings: number[];
  metadata: {
    timestamp: Date;
    confidence: number;
    source: string;
    tags: string[];
    relationships: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RAGQuery {
  query: string;
  crewMember?: string;
  sessionId?: string;
  limit?: number;
  similarityThreshold?: number;
  includeMetadata?: boolean;
}

export interface RAGSearchResult {
  memory: RAGMemory;
  similarity: number;
  relevance: number;
}

export interface RAGPropagationResult {
  memoriesStored: number;
  memoriesUpdated: number;
  relationshipsCreated: number;
  crewMemberContributions: { [crewMember: string]: number };
  propagationLevel: 'low' | 'medium' | 'high';
}

export class SupabaseRAGPropagation {
  private supabase: SupabaseClient;
  private memoriesTable = 'alex_ai_memories';
  private relationshipsTable = 'alex_ai_memory_relationships';
  private embeddingsTable = 'alex_ai_embeddings';

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Initialize RAG schema and tables
   */
  async initializeSchema(): Promise<void> {
    console.log('🗄️  Initializing Supabase RAG schema...');

    try {
      // Create memories table
      await this.createMemoriesTable();
      
      // Create relationships table
      await this.createRelationshipsTable();
      
      // Create embeddings table
      await this.createEmbeddingsTable();

      console.log('✅ RAG schema initialized successfully');

    } catch (error: any) {
      console.error('❌ Failed to initialize RAG schema:', error.message);
      throw error;
    }
  }

  /**
   * Store crew member memory with self-propagation
   */
  async storeMemory(
    content: string,
    crewMember: string,
    sessionId: string,
    prompt: string,
    response: string,
    metadata?: any
  ): Promise<RAGMemory> {
    console.log(`🧠 Storing memory from ${crewMember}...`);

    try {
      // Generate embeddings for the memory content
      const embeddings = await this.generateEmbeddings(content);

      // Create memory object
      const memory: Omit<RAGMemory, 'id' | 'createdAt' | 'updatedAt'> = {
        content,
        crewMember,
        sessionId,
        prompt,
        response,
        embeddings,
        metadata: {
          timestamp: new Date(),
          confidence: this.calculateConfidence(content, response),
          source: 'crew_member',
          tags: this.extractTags(content),
          relationships: [],
          ...metadata
        }
      };

      // Store in Supabase
      const { data, error } = await this.supabase
        .from(this.memoriesTable)
        .insert([memory])
        .select()
        .single();

      if (error) throw error;

      const storedMemory: RAGMemory = {
        ...memory,
        id: data.id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Trigger self-propagation
      await this.triggerSelfPropagation(storedMemory);

      console.log(`✅ Memory stored with ID: ${storedMemory.id}`);
      return storedMemory;

    } catch (error: any) {
      console.error('❌ Failed to store memory:', error.message);
      throw error;
    }
  }

  /**
   * Search memories with similarity matching
   */
  async searchMemories(query: RAGQuery): Promise<RAGSearchResult[]> {
    console.log(`🔍 Searching memories for: "${query.query}"`);

    try {
      // Generate embeddings for the query
      const queryEmbeddings = await this.generateEmbeddings(query.query);

      // Build search query
      let supabaseQuery = this.supabase
        .from(this.memoriesTable)
        .select('*');

      // Apply filters
      if (query.crewMember) {
        supabaseQuery = supabaseQuery.eq('crew_member', query.crewMember);
      }

      if (query.sessionId) {
        supabaseQuery = supabaseQuery.eq('session_id', query.sessionId);
      }

      // Execute query
      const { data: memories, error } = await supabaseQuery;

      if (error) throw error;

      // Calculate similarities
      const results: RAGSearchResult[] = memories.map(memory => ({
        memory: this.mapToRAGMemory(memory),
        similarity: this.calculateSimilarity(queryEmbeddings, memory.embeddings),
        relevance: this.calculateRelevance(memory, query)
      }));

      // Filter by similarity threshold
      const threshold = query.similarityThreshold || 0.7;
      const filteredResults = results.filter(r => r.similarity >= threshold);

      // Sort by relevance and similarity
      filteredResults.sort((a, b) => {
        const scoreA = (a.similarity * 0.6) + (a.relevance * 0.4);
        const scoreB = (b.similarity * 0.6) + (b.relevance * 0.4);
        return scoreB - scoreA;
      });

      // Limit results
      const limit = query.limit || 10;
      const finalResults = filteredResults.slice(0, limit);

      console.log(`✅ Found ${finalResults.length} relevant memories`);
      return finalResults;

    } catch (error: any) {
      console.error('❌ Memory search failed:', error.message);
      throw error;
    }
  }

  /**
   * Get memories for crew member context
   */
  async getCrewMemberContext(crewMember: string, sessionId?: string): Promise<RAGMemory[]> {
    console.log(`👤 Getting context for ${crewMember}...`);

    try {
      let query = this.supabase
        .from(this.memoriesTable)
        .select('*')
        .eq('crew_member', crewMember)
        .order('created_at', { ascending: false });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      const memories = data.map(memory => this.mapToRAGMemory(memory));

      console.log(`✅ Retrieved ${memories.length} memories for ${crewMember}`);
      return memories;

    } catch (error: any) {
      console.error('❌ Failed to get crew member context:', error.message);
      throw error;
    }
  }

  /**
   * Propagate memories across crew members
   */
  async propagateMemories(
    sourceMemories: RAGMemory[],
    targetCrewMembers: string[]
  ): Promise<RAGPropagationResult> {
    console.log(`🔄 Propagating ${sourceMemories.length} memories to ${targetCrewMembers.length} crew members...`);

    let memoriesStored = 0;
    let memoriesUpdated = 0;
    let relationshipsCreated = 0;
    const crewMemberContributions: { [crewMember: string]: number } = {};

    for (const memory of sourceMemories) {
      for (const targetCrewMember of targetCrewMembers) {
        if (memory.crewMember === targetCrewMember) continue; // Skip self

        try {
          // Check if similar memory already exists for target crew member
          const existingMemories = await this.searchMemories({
            query: memory.content,
            crewMember: targetCrewMember,
            limit: 1,
            similarityThreshold: 0.8
          });

          if (existingMemories.length > 0) {
            // Update existing memory with new insights
            await this.updateMemoryWithInsights(existingMemories[0].memory, memory);
            memoriesUpdated++;
          } else {
            // Create new propagated memory
            const propagatedMemory = await this.createPropagatedMemory(memory, targetCrewMember);
            memoriesStored++;
            crewMemberContributions[targetCrewMember] = 
              (crewMemberContributions[targetCrewMember] || 0) + 1;
          }

          // Create relationship
          await this.createMemoryRelationship(memory.id, targetCrewMember);
          relationshipsCreated++;

        } catch (error: any) {
          console.error(`❌ Failed to propagate memory to ${targetCrewMember}:`, error.message);
        }
      }
    }

    const propagationLevel = this.determinePropagationLevel(
      memoriesStored, 
      memoriesUpdated, 
      relationshipsCreated
    );

    const result: RAGPropagationResult = {
      memoriesStored,
      memoriesUpdated,
      relationshipsCreated,
      crewMemberContributions,
      propagationLevel
    };

    console.log(`✅ Propagation complete: ${memoriesStored} stored, ${memoriesUpdated} updated, ${relationshipsCreated} relationships`);
    return result;
  }

  /**
   * Get memory statistics
   */
  async getMemoryStatistics(): Promise<{
    totalMemories: number;
    crewMemberCounts: { [crewMember: string]: number };
    recentActivity: number;
    averageConfidence: number;
  }> {
    try {
      // Get total memories
      const { count: totalMemories } = await this.supabase
        .from(this.memoriesTable)
        .select('*', { count: 'exact', head: true });

      // Get crew member counts
      const { data: crewData } = await this.supabase
        .from(this.memoriesTable)
        .select('crew_member');

      const crewMemberCounts: { [crewMember: string]: number } = {};
      crewData?.forEach(memory => {
        crewMemberCounts[memory.crew_member] = 
          (crewMemberCounts[memory.crew_member] || 0) + 1;
      });

      // Get recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { count: recentActivity } = await this.supabase
        .from(this.memoriesTable)
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      // Get average confidence
      const { data: confidenceData } = await this.supabase
        .from(this.memoriesTable)
        .select('metadata');

      const averageConfidence = confidenceData?.reduce((sum, memory) => {
        return sum + (memory.metadata?.confidence || 0);
      }, 0) / (confidenceData?.length || 1);

      return {
        totalMemories: totalMemories || 0,
        crewMemberCounts,
        recentActivity: recentActivity || 0,
        averageConfidence: averageConfidence || 0
      };

    } catch (error: any) {
      console.error('❌ Failed to get memory statistics:', error.message);
      throw error;
    }
  }

  // Private helper methods
  private async createMemoriesTable(): Promise<void> {
    const { error } = await this.supabase.rpc('create_memories_table');
    if (error) throw error;
  }

  private async createRelationshipsTable(): Promise<void> {
    const { error } = await this.supabase.rpc('create_relationships_table');
    if (error) throw error;
  }

  private async createEmbeddingsTable(): Promise<void> {
    const { error } = await this.supabase.rpc('create_embeddings_table');
    if (error) throw error;
  }

  private async generateEmbeddings(text: string): Promise<number[]> {
    // This would integrate with OpenAI embeddings API
    // For now, return a mock embedding
    return Array.from({ length: 1536 }, () => Math.random());
  }

  private calculateConfidence(content: string, response: string): number {
    // Simple confidence calculation based on content length and response quality
    const contentLength = content.length;
    const responseLength = response.length;
    const baseConfidence = Math.min(0.95, 0.5 + (contentLength / 1000) * 0.3);
    return Math.min(0.95, baseConfidence + (responseLength / 1000) * 0.15);
  }

  private extractTags(content: string): string[] {
    // Simple tag extraction
    const commonTags = ['technical', 'strategic', 'analytical', 'creative', 'logical'];
    return commonTags.filter(tag => 
      content.toLowerCase().includes(tag.toLowerCase())
    );
  }

  private async triggerSelfPropagation(memory: RAGMemory): Promise<void> {
    // Find related memories and propagate
    const relatedMemories = await this.searchMemories({
      query: memory.content,
      limit: 5,
      similarityThreshold: 0.6
    });

    if (relatedMemories.length > 0) {
      const otherCrewMembers = [...new Set(
        relatedMemories.map(r => r.memory.crewMember)
      )].filter(cm => cm !== memory.crewMember);

      if (otherCrewMembers.length > 0) {
        await this.propagateMemories([memory], otherCrewMembers);
      }
    }
  }

  private calculateSimilarity(embeddings1: number[], embeddings2: number[]): number {
    // Cosine similarity calculation
    const dotProduct = embeddings1.reduce((sum, val, i) => sum + val * embeddings2[i], 0);
    const magnitude1 = Math.sqrt(embeddings1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(embeddings2.reduce((sum, val) => sum + val * val, 0));
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  private calculateRelevance(memory: any, query: RAGQuery): number {
    // Simple relevance calculation
    let relevance = 0.5;
    
    if (query.crewMember && memory.crew_member === query.crewMember) {
      relevance += 0.3;
    }
    
    if (query.sessionId && memory.session_id === query.sessionId) {
      relevance += 0.2;
    }

    return Math.min(1.0, relevance);
  }

  private mapToRAGMemory(data: any): RAGMemory {
    return {
      id: data.id,
      content: data.content,
      crewMember: data.crew_member,
      sessionId: data.session_id,
      prompt: data.prompt,
      response: data.response,
      embeddings: data.embeddings,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private async updateMemoryWithInsights(existingMemory: RAGMemory, newMemory: RAGMemory): Promise<void> {
    // Update existing memory with insights from new memory
    const updatedContent = `${existingMemory.content}\n\nAdditional insights: ${newMemory.content}`;
    
    await this.supabase
      .from(this.memoriesTable)
      .update({
        content: updatedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingMemory.id);
  }

  private async createPropagatedMemory(originalMemory: RAGMemory, targetCrewMember: string): Promise<RAGMemory> {
    const propagatedContent = `Propagated from ${originalMemory.crewMember}: ${originalMemory.content}`;
    
    const { data, error } = await this.supabase
      .from(this.memoriesTable)
      .insert([{
        content: propagatedContent,
        crew_member: targetCrewMember,
        session_id: originalMemory.sessionId,
        prompt: originalMemory.prompt,
        response: `Insight from ${originalMemory.crewMember}: ${originalMemory.response}`,
        embeddings: originalMemory.embeddings,
        metadata: {
          ...originalMemory.metadata,
          source: 'propagation',
          propagated_from: originalMemory.crewMember
        }
      }])
      .select()
      .single();

    if (error) throw error;

    return this.mapToRAGMemory(data);
  }

  private async createMemoryRelationship(sourceMemoryId: string, targetCrewMember: string): Promise<void> {
    await this.supabase
      .from(this.relationshipsTable)
      .insert([{
        source_memory_id: sourceMemoryId,
        target_crew_member: targetCrewMember,
        relationship_type: 'propagation',
        created_at: new Date().toISOString()
      }]);
  }

  private determinePropagationLevel(
    stored: number, 
    updated: number, 
    relationships: number
  ): 'low' | 'medium' | 'high' {
    const total = stored + updated + relationships;
    if (total >= 20) return 'high';
    if (total >= 10) return 'medium';
    return 'low';
  }
}

