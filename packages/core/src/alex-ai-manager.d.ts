/**
 * Alex AI Manager - Central Integration Hub
 *
 * This is the central manager that all sub-projects in the monorepo can use
 * to integrate with the Alex AI system, N8N Federation Crew, and universal
 * credential management.
 */
import { N8NCredentialsManager } from './n8n-credentials-manager';
import { UnifiedDataService } from './unified-data-service';
import { StealthScrapingService } from './stealth-scraping-service';
import { AlexAICrewManager } from './crew-manager';
export interface AlexAIConfig {
    environment: 'development' | 'staging' | 'production';
    enableN8NIntegration: boolean;
    enableStealthScraping: boolean;
    enableCrewManagement: boolean;
    enableTesting: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}
export interface AlexAIStatus {
    isInitialized: boolean;
    n8nConnection: boolean;
    supabaseConnection: boolean;
    crewStatus: Record<string, boolean>;
    lastHealthCheck: Date;
    version: string;
}
export declare class AlexAIManager {
    private static instance;
    private config;
    private credentialsManager;
    private dataService;
    private stealthService;
    private crewManager;
    private isInitialized;
    private constructor();
    /**
     * Get singleton instance of Alex AI Manager
     */
    static getInstance(config?: Partial<AlexAIConfig>): AlexAIManager;
    /**
     * Initialize Alex AI system
     */
    initialize(): Promise<void>;
    /**
     * Get system status
     */
    getStatus(): Promise<AlexAIStatus>;
    /**
     * Get credentials manager
     */
    getCredentialsManager(): N8NCredentialsManager;
    /**
     * Get data service
     */
    getDataService(): UnifiedDataService;
    /**
     * Get stealth scraping service
     */
    getStealthService(): StealthScrapingService;
    /**
     * Get crew manager
     */
    getCrewManager(): AlexAICrewManager;
    /**
     * Run end-to-end tests
     */
    runTests(): Promise<any>;
    /**
     * Get configuration
     */
    getConfig(): AlexAIConfig;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<AlexAIConfig>): void;
    /**
     * Shutdown Alex AI system
     */
    shutdown(): Promise<void>;
}
export declare const initializeAlexAI: (config?: Partial<AlexAIConfig>) => Promise<AlexAIManager>;
export declare const getAlexAI: () => AlexAIManager;
export declare const getAlexAIStatus: () => Promise<AlexAIStatus>;
export default AlexAIManager;
//# sourceMappingURL=alex-ai-manager.d.ts.map