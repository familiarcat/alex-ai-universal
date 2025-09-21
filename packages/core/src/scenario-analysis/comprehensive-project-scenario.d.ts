/**
 * Comprehensive Project Scenario Analysis
 *
 * Analyzes complete developer workflow with CursorAI integration
 * and captures crew member learning through RAG system
 */
export interface ProjectScenario {
    id: string;
    name: string;
    description: string;
    steps: ScenarioStep[];
    crewLearning: Map<string, CrewMemberLearning>;
    projectType: string;
    clientType: string;
    technologies: string[];
    startTime: Date;
    endTime?: Date;
}
export interface ScenarioStep {
    stepNumber: number;
    title: string;
    description: string;
    alexAIAssistance: string[];
    crewContributions: Map<string, string>;
    learningOpportunities: string[];
    ragMemories: string[];
    completionStatus: 'pending' | 'in-progress' | 'completed';
}
export interface CrewMemberLearning {
    crewMember: string;
    projectInsights: string[];
    technicalLearnings: string[];
    clientUnderstanding: string[];
    projectTypeKnowledge: string[];
    collaborationInsights: string[];
    ragMemories: string[];
    verificationQueries: string[];
    introspection: string;
}
export declare class ComprehensiveProjectScenarioAnalyzer {
    private scenario;
    private ragSystem;
    private n8nIntegration;
    constructor();
    /**
     * Initialize the comprehensive project scenario
     */
    private initializeScenario;
    /**
     * Initialize detailed scenario steps
     */
    private initializeScenarioSteps;
    /**
     * Execute complete scenario analysis
     */
    executeScenarioAnalysis(): Promise<ProjectScenario>;
    /**
     * Execute individual scenario step
     */
    private executeScenarioStep;
    /**
     * Generate crew contributions for each step
     */
    private generateCrewContributions;
    /**
     * Generate specific contribution for crew member
     */
    private generateCrewMemberContribution;
    /**
     * Store step memories in RAG system
     */
    private storeStepMemories;
    /**
     * Generate comprehensive crew learning analysis
     */
    private generateCrewLearningAnalysis;
    /**
     * Generate detailed learning for specific crew member
     */
    private generateCrewMemberLearning;
    /**
     * Store crew learnings in RAG system
     */
    private storeCrewLearningsInRAG;
    /**
     * Store individual RAG memory
     */
    private storeRAGMemory;
    /**
     * Conduct Observation Lounge session in cinematic screenplay format
     */
    conductObservationLoungeSession(): Promise<void>;
}
//# sourceMappingURL=comprehensive-project-scenario.d.ts.map