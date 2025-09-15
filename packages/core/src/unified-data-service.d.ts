/**
 * Unified Data Service - Central Data Management
 *
 * This service provides unified data access across all sub-projects,
 * integrating with N8N Federation Crew, Supabase, and local fallbacks.
 */
export interface DataSource {
    name: string;
    type: 'n8n' | 'supabase' | 'local';
    isAvailable: boolean;
    lastSync: Date | null;
}
export interface UnifiedDataConfig {
    enableN8N: boolean;
    enableSupabase: boolean;
    enableLocalFallback: boolean;
    cacheDuration: number;
    retryAttempts: number;
}
export declare class UnifiedDataService {
    private credentialsManager;
    private config;
    private dataSources;
    private cache;
    constructor(config?: Partial<UnifiedDataConfig>);
    /**
     * Initialize the unified data service
     */
    initialize(): Promise<void>;
    /**
     * Test all data source connections
     */
    testConnections(): Promise<void>;
    /**
     * Test N8N connection
     */
    private testN8NConnection;
    /**
     * Test Supabase connection
     */
    private testSupabaseConnection;
    /**
     * Get data from the best available source
     */
    getData<T>(key: string, fetcher: () => Promise<T>): Promise<T>;
    /**
     * Get job opportunities
     */
    getJobOpportunities(): Promise<any[]>;
    /**
     * Get contacts
     */
    getContacts(): Promise<any[]>;
    /**
     * Get data from N8N
     */
    private getFromN8N;
    /**
     * Get data from Supabase
     */
    private getFromSupabase;
    /**
     * Get local job data
     */
    private getLocalJobData;
    /**
     * Get local contact data
     */
    private getLocalContactData;
    /**
     * Test connection
     */
    testConnection(): Promise<boolean>;
    /**
     * Get data sources status
     */
    getDataSources(): DataSource[];
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Cleanup
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=unified-data-service.d.ts.map