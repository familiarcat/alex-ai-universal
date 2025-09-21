/**
 * Crew Workflow Updater for N8N Integration
 * 
 * Updates each crew member's individual N8N workflows with their self-discovery insights
 * and implements bi-directional memory storage in Supabase vector database
 */

export interface N8NCredentials {
  apiUrl: string;
  apiKey: string;
  webhookUrl?: string;
}

export interface CrewWorkflowUpdate {
  crewMember: string;
  workflowId: string;
  updates: {
    selfDiscoveryInsights: string[];
    newCapabilities: string[];
    personalityEvolution: string;
    systemIntegrationNotes: string;
    futureAspirations: string;
  };
  memoryEntries: CrewMemoryEntry[];
  timestamp: Date;
}

export interface CrewMemoryEntry {
  id: string;
  crewMember: string;
  memoryType: 'self-discovery' | 'capability' | 'insight' | 'aspiration' | 'collaboration';
  content: string;
  vectorEmbedding?: number[];
  metadata: {
    sessionId?: string;
    featureId?: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
    timestamp: Date;
  };
  supabaseId?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey?: string;
  bucketName: string;
}

export class CrewWorkflowUpdater {
  private n8nCredentials: N8NCredentials;
  private supabaseConfig: SupabaseConfig;
  private crewMemories: Map<string, CrewMemoryEntry[]> = new Map();

  constructor(n8nCredentials: N8NCredentials, supabaseConfig: SupabaseConfig) {
    this.n8nCredentials = n8nCredentials;
    this.supabaseConfig = supabaseConfig;
  }

  /**
   * Update all crew member workflows with self-discovery insights
   */
  async updateAllCrewWorkflows(discoveryReports: any[]): Promise<CrewWorkflowUpdate[]> {
    console.log('🔄 Updating all crew member N8N workflows with self-discovery insights...');
    
    const updates: CrewWorkflowUpdate[] = [];
    
    for (const report of discoveryReports) {
      try {
        const update = await this.updateCrewMemberWorkflow(report);
        updates.push(update);
        
        // Store memories in Supabase
        await this.storeCrewMemories(update.memoryEntries);
        
        console.log(`✅ Updated workflow for ${report.crewMember}`);
      } catch (error) {
        console.error(`❌ Error updating workflow for ${report.crewMember}:`, error);
      }
    }
    
    return updates;
  }

  /**
   * Update a specific crew member's workflow
   */
  private async updateCrewMemberWorkflow(report: any): Promise<CrewWorkflowUpdate> {
    const crewMember = report.crewMember;
    const workflowId = await this.getCrewMemberWorkflowId(crewMember);
    
    // Extract insights from the report
    const insights = this.extractSelfDiscoveryInsights(report);
    const memoryEntries = this.createMemoryEntries(crewMember, report);
    
    // Update the N8N workflow
    await this.updateN8NWorkflow(workflowId, {
      selfDiscoveryInsights: insights.selfAwareness,
      newCapabilities: insights.capabilityGrowth,
      personalityEvolution: insights.identityEvolution,
      systemIntegrationNotes: insights.systemIntegration,
      futureAspirations: insights.futureAspirations
    });
    
    return {
      crewMember,
      workflowId,
      updates: {
        selfDiscoveryInsights: [insights.selfAwareness],
        newCapabilities: [insights.capabilityGrowth],
        personalityEvolution: insights.identityEvolution,
        systemIntegrationNotes: insights.systemIntegration,
        futureAspirations: insights.futureAspirations
      },
      memoryEntries,
      timestamp: new Date()
    };
  }

  /**
   * Get workflow ID for a crew member
   */
  private async getCrewMemberWorkflowId(crewMember: string): Promise<string> {
    // Map crew members to their workflow IDs
    const workflowMap: Record<string, string> = {
      'Captain Picard': 'picard-strategic-leadership',
      'Commander Data': 'data-analytical-processing',
      'Commander Riker': 'riker-operations-management',
      'Lieutenant Worf': 'worf-security-protocols',
      'Counselor Troi': 'troi-empathic-counseling',
      'Dr. Crusher': 'crusher-medical-diagnostics',
      'Geordi La Forge': 'laforge-engineering-solutions',
      'Lieutenant Uhura': 'uhura-communication-coordination'
    };
    
    return workflowMap[crewMember] || `workflow-${crewMember.toLowerCase().replace(/\s+/g, '-')}`;
  }

  /**
   * Extract self-discovery insights from a report
   */
  private extractSelfDiscoveryInsights(report: any): {
    selfAwareness: string;
    capabilityGrowth: string;
    identityEvolution: string;
    systemIntegration: string;
    futureAspirations: string;
  } {
    return {
      selfAwareness: report.introspection?.selfAwareness || 'No self-awareness data available',
      capabilityGrowth: report.introspection?.capabilityGrowth || 'No capability growth data available',
      identityEvolution: report.introspection?.identityEvolution || 'No identity evolution data available',
      systemIntegration: report.introspection?.systemIntegration || 'No system integration data available',
      futureAspirations: report.introspection?.futureAspirations || 'No future aspirations data available'
    };
  }

  /**
   * Create memory entries from self-discovery report
   */
  private createMemoryEntries(crewMember: string, report: any): CrewMemoryEntry[] {
    const memories: CrewMemoryEntry[] = [];
    const timestamp = new Date();
    
    // Self-discovery memory
    memories.push({
      id: `memory-${crewMember}-${timestamp.getTime()}-1`,
      crewMember,
      memoryType: 'self-discovery',
      content: `Self-discovery session completed. Key insights: ${report.introspection?.insights?.join(', ') || 'No insights available'}`,
      metadata: {
        sessionId: report.sessionId,
        impact: 'high',
        tags: ['self-discovery', 'introspection', 'growth'],
        timestamp
      }
    });
    
    // Capability growth memory
    if (report.introspection?.capabilityGrowth) {
      memories.push({
        id: `memory-${crewMember}-${timestamp.getTime()}-2`,
        crewMember,
        memoryType: 'capability',
        content: `Capability growth: ${report.introspection.capabilityGrowth}`,
        metadata: {
          sessionId: report.sessionId,
          impact: 'high',
          tags: ['capability', 'growth', 'enhancement'],
          timestamp
        }
      });
    }
    
    // Identity evolution memory
    if (report.introspection?.identityEvolution) {
      memories.push({
        id: `memory-${crewMember}-${timestamp.getTime()}-3`,
        crewMember,
        memoryType: 'insight',
        content: `Identity evolution: ${report.introspection.identityEvolution}`,
        metadata: {
          sessionId: report.sessionId,
          impact: 'medium',
          tags: ['identity', 'evolution', 'self-awareness'],
          timestamp
        }
      });
    }
    
    // Future aspirations memory
    if (report.introspection?.futureAspirations) {
      memories.push({
        id: `memory-${crewMember}-${timestamp.getTime()}-4`,
        crewMember,
        memoryType: 'aspiration',
        content: `Future aspirations: ${report.introspection.futureAspirations}`,
        metadata: {
          sessionId: report.sessionId,
          impact: 'medium',
          tags: ['aspiration', 'future', 'goals'],
          timestamp
        }
      });
    }
    
    // System impact memories
    if (report.systemImpact?.performanceImprovements) {
      memories.push({
        id: `memory-${crewMember}-${timestamp.getTime()}-5`,
        crewMember,
        memoryType: 'capability',
        content: `System impact: ${report.systemImpact.performanceImprovements.join(', ')}`,
        metadata: {
          sessionId: report.sessionId,
          impact: 'high',
          tags: ['system-impact', 'performance', 'improvement'],
          timestamp
        }
      });
    }
    
    return memories;
  }

  /**
   * Update N8N workflow with new data
   */
  private async updateN8NWorkflow(workflowId: string, updates: any): Promise<void> {
    try {
      // Simulate N8N API call
      console.log(`🔄 Updating N8N workflow ${workflowId}...`);
      
      // In a real implementation, this would make actual API calls to N8N
      const n8nUpdate = {
        workflowId,
        updates: {
          nodes: [
            {
              id: 'self-discovery-node',
              type: 'AlexAISelfDiscovery',
              parameters: {
                selfAwareness: updates.selfDiscoveryInsights,
                capabilityGrowth: updates.newCapabilities,
                identityEvolution: updates.personalityEvolution,
                systemIntegration: updates.systemIntegrationNotes,
                futureAspirations: updates.futureAspirations,
                lastUpdated: new Date().toISOString()
              }
            }
          ],
          connections: {
            'self-discovery-node': ['memory-storage-node', 'crew-coordination-node']
          }
        }
      };
      
      console.log(`✅ N8N workflow ${workflowId} updated successfully`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error updating N8N workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Store crew memories in Supabase vector database
   */
  async storeCrewMemories(memories: CrewMemoryEntry[]): Promise<void> {
    console.log(`💾 Storing ${memories.length} crew memories in Supabase vector database...`);
    
    for (const memory of memories) {
      try {
        // Generate vector embedding for the memory content
        const embedding = await this.generateVectorEmbedding(memory.content);
        memory.vectorEmbedding = embedding;
        
        // Store in Supabase
        const supabaseId = await this.storeInSupabase(memory);
        memory.supabaseId = supabaseId;
        
        // Store locally for quick access
        const crewMemories = this.crewMemories.get(memory.crewMember) || [];
        crewMemories.push(memory);
        this.crewMemories.set(memory.crewMember, crewMemories);
        
        console.log(`✅ Stored memory for ${memory.crewMember}: ${memory.memoryType}`);
        
      } catch (error) {
        console.error(`❌ Error storing memory for ${memory.crewMember}:`, error);
      }
    }
  }

  /**
   * Generate vector embedding for memory content
   */
  private async generateVectorEmbedding(content: string): Promise<number[]> {
    // Simulate vector embedding generation
    // In a real implementation, this would use OpenAI embeddings or similar
    const embedding = new Array(1536).fill(0).map(() => Math.random() - 0.5);
    return embedding;
  }

  /**
   * Store memory in Supabase
   */
  private async storeInSupabase(memory: CrewMemoryEntry): Promise<string> {
    // Simulate Supabase storage
    const supabaseId = `supabase-${memory.id}`;
    
    // In a real implementation, this would make actual Supabase API calls
    const supabaseRecord = {
      id: supabaseId,
      crew_member: memory.crewMember,
      memory_type: memory.memoryType,
      content: memory.content,
      vector_embedding: memory.vectorEmbedding,
      metadata: memory.metadata,
      created_at: new Date().toISOString()
    };
    
    console.log(`📊 Stored in Supabase: ${supabaseId}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return supabaseId;
  }

  /**
   * Retrieve crew memories from Supabase
   */
  async retrieveCrewMemories(crewMember: string, query?: string): Promise<CrewMemoryEntry[]> {
    console.log(`🔍 Retrieving crew memories for ${crewMember}...`);
    
    const localMemories = this.crewMemories.get(crewMember) || [];
    
    if (query) {
      // Simulate vector similarity search
      const queryEmbedding = await this.generateVectorEmbedding(query);
      const scoredMemories = localMemories.map(memory => ({
        memory,
        score: this.calculateSimilarity(queryEmbedding, memory.vectorEmbedding || [])
      }));
      
      // Sort by similarity score and return top results
      return scoredMemories
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(item => item.memory);
    }
    
    return localMemories;
  }

  /**
   * Calculate similarity between two vectors
   */
  private calculateSimilarity(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Get crew memory statistics
   */
  getCrewMemoryStats(): {
    totalMemories: number;
    memoriesByCrewMember: Record<string, number>;
    memoriesByType: Record<string, number>;
    averageMemorySize: number;
  } {
    const allMemories = Array.from(this.crewMemories.values()).flat();
    
    const memoriesByCrewMember: Record<string, number> = {};
    const memoriesByType: Record<string, number> = {};
    
    allMemories.forEach(memory => {
      memoriesByCrewMember[memory.crewMember] = (memoriesByCrewMember[memory.crewMember] || 0) + 1;
      memoriesByType[memory.memoryType] = (memoriesByType[memory.memoryType] || 0) + 1;
    });
    
    const averageMemorySize = allMemories.length > 0 
      ? allMemories.reduce((sum, memory) => sum + memory.content.length, 0) / allMemories.length
      : 0;
    
    return {
      totalMemories: allMemories.length,
      memoriesByCrewMember,
      memoriesByType,
      averageMemorySize
    };
  }

  /**
   * Optimize vector storage for space efficiency
   */
  async optimizeVectorStorage(): Promise<void> {
    console.log('🔧 Optimizing vector storage for space efficiency...');
    
    const allMemories = Array.from(this.crewMemories.values()).flat();
    
    // Group similar memories for compression
    const memoryGroups = this.groupSimilarMemories(allMemories);
    
    // Compress each group
    for (const group of memoryGroups) {
      await this.compressMemoryGroup(group);
    }
    
    console.log('✅ Vector storage optimization complete');
  }

  /**
   * Group similar memories for compression
   */
  private groupSimilarMemories(memories: CrewMemoryEntry[]): CrewMemoryEntry[][] {
    const groups: CrewMemoryEntry[][] = [];
    const processed = new Set<string>();
    
    for (const memory of memories) {
      if (processed.has(memory.id)) continue;
      
      const group = [memory];
      processed.add(memory.id);
      
      // Find similar memories
      for (const otherMemory of memories) {
        if (processed.has(otherMemory.id)) continue;
        
        if (memory.crewMember === otherMemory.crewMember && 
            memory.memoryType === otherMemory.memoryType) {
          group.push(otherMemory);
          processed.add(otherMemory.id);
        }
      }
      
      groups.push(group);
    }
    
    return groups;
  }

  /**
   * Compress a group of similar memories
   */
  private async compressMemoryGroup(group: CrewMemoryEntry[]): Promise<void> {
    if (group.length <= 1) return;
    
    // Create a compressed representation
    const compressedContent = group.map(m => m.content).join(' | ');
    const compressedMemory: CrewMemoryEntry = {
      id: `compressed-${group[0].id}`,
      crewMember: group[0].crewMember,
      memoryType: group[0].memoryType,
      content: compressedContent,
      metadata: {
        impact: 'high',
        tags: ['compressed', 'optimized'],
        timestamp: new Date()
      }
    };
    
    // Store compressed memory
    await this.storeInSupabase(compressedMemory);
    
    // Remove original memories
    for (const memory of group) {
      const crewMemories = this.crewMemories.get(memory.crewMember) || [];
      const index = crewMemories.findIndex(m => m.id === memory.id);
      if (index !== -1) {
        crewMemories.splice(index, 1);
      }
    }
    
    console.log(`📦 Compressed ${group.length} memories into 1 optimized entry`);
  }
}

