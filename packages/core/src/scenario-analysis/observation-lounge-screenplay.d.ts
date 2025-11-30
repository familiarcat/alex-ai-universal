/**
 * Observation Lounge Screenplay Format
 *
 * Enhanced cinematic screenplay format for crew learning debriefs
 * with character motivations and emotional depth
 */
export interface CharacterProfile {
    name: string;
    action: string;
    motivation: string;
    dialogue_style: string;
    opening_statement: string;
    insight_action: string;
    insight_motivation: string;
    technical_action: string;
    technical_motivation: string;
    client_action: string;
    client_motivation: string;
    collaboration_action: string;
    collaboration_motivation: string;
    introspection_action: string;
    introspection_motivation: string;
    closing_action: string;
    closing_motivation: string;
    closing_statement: string;
}
export declare class ObservationLoungeScreenplay {
    /**
     * Generate cinematic screenplay format for Observation Lounge session
     */
    generateScreenplayOpening(): string;
    /**
     * Generate character-specific screenplay segment
     */
    generateCharacterSegment(crewMember: string, learning: any): string;
    /**
     * Generate screenplay closing
     */
    generateScreenplayClosing(): string;
    /**
     * Get detailed character profile for screenplay format
     */
    private getCharacterProfile;
}
//# sourceMappingURL=observation-lounge-screenplay.d.ts.map