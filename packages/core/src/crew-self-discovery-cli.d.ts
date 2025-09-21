/**
 * Crew Self-Discovery CLI
 *
 * Command-line interface for the crew self-discovery system
 */
import * as commander from 'commander';
export declare class CrewSelfDiscoveryCLI {
    private discoverySystem;
    constructor();
    /**
     * Initialize the CLI commands
     */
    initializeCommands(program: commander.Command): void;
    /**
     * Display a full self-discovery report
     */
    private displayFullReport;
    /**
     * Calculate duration between two dates
     */
    private calculateDuration;
    /**
     * Run a complete self-discovery demo
     */
    private runCompleteDemo;
    /**
     * Get demo features for a specific crew member
     */
    private getDemoFeaturesForCrewMember;
}
//# sourceMappingURL=crew-self-discovery-cli.d.ts.map