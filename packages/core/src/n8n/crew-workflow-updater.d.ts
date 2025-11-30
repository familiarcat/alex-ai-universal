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
export declare class CrewWorkflowUpdater {
    private n8nCredentials;
    private supabaseConfig;
    private crewMemories;
    constructor(n8nCredentials: N8NCredentials, supabaseConfig: SupabaseConfig);
    /**
     * Update all crew member workflows with self-discovery insights
     */
    updateAllCrewWorkflows(discoveryReports: any[]): Promise<CrewWorkflowUpdate[]>;
    /**
     * Update a specific crew member's workflow
     */
    private updateCrewMemberWorkflow;
    /**
     * Get workflow ID for a crew member
     */
    private getCrewMemberWorkflowId;
    /**
     * Extract self-discovery insights from a report
     */
    private extractSelfDiscoveryInsights;
    /**
     * Create memory entries from self-discovery report
     */
    private createMemoryEntries;
    /**
     * Update N8N workflow with new data
     */
    private updateN8NWorkflow;
    /**
     * Store crew memories in Supabase vector database
     */
    storeCrewMemories(memories: CrewMemoryEntry[]): Promise<void>;
    /**
     * Generate vector embedding for memory content
     */
    private generateVectorEmbedding;
    /**
     * Store memory in Supabase
     */
    private storeInSupabase;
    /**
     * Retrieve crew memories from Supabase
     */
    retrieveCrewMemories(crewMember: string, query?: string): Promise<CrewMemoryEntry[]>;
    /**
     * Calculate similarity between two vectors
     */
    private calculateSimilarity;
    /**
     * Get crew memory statistics
     */
    getCrewMemoryStats(): {
        totalMemories: number;
        memoriesByCrewMember: Record<string, number>;
        memoriesByType: Record<string, number>;
        averageMemorySize: number;
    };
    /**
     * Optimize vector storage for space efficiency
     */
    optimizeVectorStorage(): Promise<void>;
    /**
     * Group similar memories for compression
     */
    private groupSimilarMemories;
    /**
     * Compress a group of similar memories
     */
    private compressMemoryGroup;
}
//# sourceMappingURL=crew-workflow-updater.d.ts.map