export interface ProjectAnalysisRequest {
    projectName: string;
    projectType: string;
    client: string;
    technologies: string[];
    description: string;
    objectives: string[];
    constraints?: string[];
    timeline?: string;
}
export interface CrewConsciousnessSession {
    sessionId: string;
    projectRequest: ProjectAnalysisRequest;
    crewMembers: string[];
    startTime: Date;
    endTime?: Date;
    individualAnalyses: Map<string, CrewMemberAnalysis>;
    collectiveInsights: CollectiveInsights;
    ragMemoriesStored: number;
    n8nWorkflowsUpdated: number;
    status: 'active' | 'completed' | 'paused';
}
export interface CrewMemberAnalysis {
    crewMemberId: string;
    perspective: string;
    keyInsights: string[];
    technicalLearnings: string[];
    businessImplications: string[];
    recommendations: string[];
    selfReflection: string;
    confidenceLevel: number;
    impactLevel: 'low' | 'medium' | 'high' | 'critical';
}
export interface CollectiveInsights {
    strategicOverview: string;
    technicalSummary: string;
    businessValue: string;
    riskAssessment: string;
    implementationPlan: string;
    successMetrics: string[];
    crewSynergy: string;
    systemEvolution: string;
}
export declare class CrewConsciousnessWorkflow {
    private crewManager;
    private workflowUpdater;
    private activeSessions;
    private crewLearningHistory;
    constructor(n8nCreds: any, supabaseConf: any);
    private initializeCrewLearningHistory;
    /**
     * Initialize a new crew consciousness session for project analysis
     */
    initializeSession(projectRequest: ProjectAnalysisRequest): Promise<string>;
    /**
     * Process individual crew member analysis
     */
    processCrewMemberAnalysis(sessionId: string, crewMemberId: string): Promise<CrewMemberAnalysis>;
    /**
     * Generate comprehensive crew member analysis
     */
    private generateCrewMemberAnalysis;
    /**
     * Store crew analysis in RAG memory system
     */
    private storeCrewAnalysisInRAG;
    /**
     * Generate collective insights from all crew member analyses
     */
    generateCollectiveInsights(sessionId: string): Promise<CollectiveInsights>;
    /**
     * Complete crew consciousness session
     */
    completeSession(sessionId: string): Promise<CrewConsciousnessSession>;
    /**
     * Update N8N workflows with session learnings
     */
    private updateN8NWorkflowsWithSession;
    /**
     * Generate mock embedding for RAG storage
     */
    private generateMockEmbedding;
    /**
     * Synthesis methods for collective insights
     */
    private synthesizeStrategicOverview;
    private synthesizeTechnicalSummary;
    private synthesizeBusinessValue;
    private synthesizeRiskAssessment;
    private synthesizeImplementationPlan;
    private synthesizeSuccessMetrics;
    private synthesizeCrewSynergy;
    private synthesizeSystemEvolution;
    /**
     * Get crew learning statistics
     */
    getCrewLearningStats(): any;
    /**
     * Run complete crew consciousness demo
     */
    runDemo(): Promise<void>;
}
//# sourceMappingURL=crew-consciousness-workflow.d.ts.map