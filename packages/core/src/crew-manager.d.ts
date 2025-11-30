/**
 * Alex AI Crew Manager - Crew Coordination and Management
 *
 * This service manages Alex AI crew members and their interactions
 * with the N8N Federation Crew for all sub-projects.
 */
export interface CrewMember {
    id: string;
    name: string;
    role: string;
    specialization: string[];
    status: 'active' | 'inactive' | 'busy';
    lastActivity: Date;
    capabilities: string[];
}
export interface CrewInteraction {
    id: string;
    from: string;
    to: string;
    type: 'collaboration' | 'handoff' | 'consultation';
    data: any;
    timestamp: Date;
    status: 'pending' | 'completed' | 'failed';
}
export interface CrewStatus {
    totalMembers: number;
    activeMembers: number;
    busyMembers: number;
    lastUpdate: Date;
    members: Record<string, CrewMember>;
}
export declare class AlexAICrewManager {
    private credentialsManager;
    private crewMembers;
    private interactions;
    constructor();
    /**
     * Initialize crew members
     */
    private initializeCrewMembers;
    /**
     * Initialize the crew manager
     */
    initialize(): Promise<void>;
    /**
     * Test connection to N8N Federation Crew
     */
    private testFederationConnection;
    /**
     * Get crew status
     */
    getCrewStatus(): Promise<Record<string, boolean>>;
    /**
     * Get all crew members
     */
    getCrewMembers(): CrewMember[];
    /**
     * Get crew member by ID
     */
    getCrewMember(id: string): CrewMember | null;
    /**
     * Update crew member status
     */
    updateCrewMemberStatus(id: string, status: 'active' | 'inactive' | 'busy'): void;
    /**
     * Create crew interaction
     */
    createInteraction(interaction: Omit<CrewInteraction, 'id' | 'timestamp' | 'status'>): CrewInteraction;
    /**
     * Get crew interactions
     */
    getInteractions(): CrewInteraction[];
    /**
     * Get interactions for a specific crew member
     */
    getInteractionsForMember(memberId: string): CrewInteraction[];
    /**
     * Coordinate with N8N Federation Crew
     */
    coordinateWithFederation(action: string, data: any): Promise<any>;
    /**
     * Assign task to crew member
     */
    assignTask(memberId: string, task: any): Promise<CrewInteraction>;
    /**
     * Complete task
     */
    completeTask(interactionId: string, result: any): Promise<void>;
    /**
     * Get crew analytics
     */
    getCrewAnalytics(): CrewStatus;
    /**
     * Test connection
     */
    testConnection(): Promise<boolean>;
    /**
     * Cleanup
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=crew-manager.d.ts.map