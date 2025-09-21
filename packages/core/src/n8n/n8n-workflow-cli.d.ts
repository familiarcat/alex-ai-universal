/**
 * N8N Workflow CLI
 *
 * Command-line interface for updating crew member N8N workflows
 * and managing bi-directional memory storage
 */
import * as commander from 'commander';
export declare class N8NWorkflowCLI {
    private workflowUpdater;
    private n8nCredentials;
    private supabaseConfig;
    constructor();
    /**
     * Initialize the CLI commands
     */
    initializeCommands(program: commander.Command): void;
    /**
     * Generate mock discovery reports for testing
     */
    private generateMockDiscoveryReports;
    /**
     * Generate mock report for a specific crew member
     */
    private generateMockReportForCrewMember;
    /**
     * Run complete integration demo
     */
    private runCompleteDemo;
}
//# sourceMappingURL=n8n-workflow-cli.d.ts.map