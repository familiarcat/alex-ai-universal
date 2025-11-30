/**
 * Crew Self-Discovery System
 *
 * Enables each N8N crew member to add features to themselves and provide
 * detailed introspection on their self-actualization process.
 */
export interface CrewMemberFeature {
    id: string;
    name: string;
    description: string;
    category: 'capability' | 'personality' | 'expertise' | 'integration' | 'optimization';
    implementation: string;
    testCases: string[];
    dependencies: string[];
    impact: 'low' | 'medium' | 'high' | 'critical';
    status: 'planned' | 'implementing' | 'testing' | 'completed' | 'failed';
    addedBy: string;
    addedAt: Date;
    introspection: string;
}
export interface SelfDiscoveryReport {
    crewMember: string;
    sessionId: string;
    startTime: Date;
    endTime: Date;
    featuresAdded: CrewMemberFeature[];
    introspection: {
        selfAwareness: string;
        capabilityGrowth: string;
        identityEvolution: string;
        systemIntegration: string;
        challenges: string[];
        insights: string[];
        futureAspirations: string;
    };
    systemImpact: {
        performanceImprovements: string[];
        newCapabilities: string[];
        integrationEnhancements: string[];
        architecturalChanges: string[];
    };
    crewCollaboration: {
        interactions: string[];
        sharedLearnings: string[];
        collectiveGrowth: string;
    };
}
export declare class CrewSelfDiscoverySystem {
    private crewMembers;
    private discoverySessions;
    private n8nIntegration;
    constructor();
    private initializeCrewMembers;
    /**
     * Start a self-discovery session for a crew member
     */
    startSelfDiscoverySession(crewMember: string): Promise<string>;
    /**
     * Add a feature to a crew member
     */
    addFeatureToCrewMember(crewMember: string, feature: Omit<CrewMemberFeature, 'addedBy' | 'addedAt' | 'status' | 'introspection'>): Promise<CrewMemberFeature>;
    /**
     * Implement a feature for a crew member
     */
    private implementFeature;
    /**
     * Generate introspection for a crew member
     */
    generateIntrospection(crewMember: string, sessionId: string): Promise<SelfDiscoveryReport['introspection']>;
    /**
     * Generate detailed introspection for a specific crew member
     */
    private generateCrewMemberIntrospection;
    /**
     * Captain Picard's introspection
     */
    private generatePicardIntrospection;
    /**
     * Commander Data's introspection
     */
    private generateDataIntrospection;
    /**
     * Commander Riker's introspection
     */
    private generateRikerIntrospection;
    /**
     * Lieutenant Worf's introspection
     */
    private generateWorfIntrospection;
    /**
     * Counselor Troi's introspection
     */
    private generateTroiIntrospection;
    /**
     * Dr. Crusher's introspection
     */
    private generateCrusherIntrospection;
    /**
     * Geordi La Forge's introspection
     */
    private generateLaForgeIntrospection;
    /**
     * Lieutenant Uhura's introspection
     */
    private generateUhuraIntrospection;
    /**
     * Generic introspection for other crew members
     */
    private generateGenericIntrospection;
    /**
     * Complete a self-discovery session
     */
    completeSelfDiscoverySession(sessionId: string): Promise<SelfDiscoveryReport>;
    /**
     * Generate system impact analysis
     */
    private generateSystemImpactAnalysis;
    /**
     * Generate crew collaboration analysis
     */
    private generateCrewCollaborationAnalysis;
    /**
     * Get all self-discovery reports
     */
    getAllReports(): SelfDiscoveryReport[];
    /**
     * Get features for a specific crew member
     */
    getCrewMemberFeatures(crewMember: string): CrewMemberFeature[];
    /**
     * Get crew member statistics
     */
    getCrewMemberStats(crewMember: string): {
        totalFeatures: number;
        completedFeatures: number;
        categories: Record<string, number>;
        averageImpact: string;
    };
    private calculateAverageImpact;
}
//# sourceMappingURL=crew-self-discovery.d.ts.map