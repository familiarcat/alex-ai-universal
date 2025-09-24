/**
 * N8N Credentials Manager
 * Handles N8N workflow credentials and authentication
 */
export interface N8NCredentials {
    apiKey?: string;
    baseUrl?: string;
    username?: string;
    password?: string;
}
export declare class N8NCredentialsManager {
    private credentials;
    constructor(credentials?: N8NCredentials);
    /**
     * Set credentials for N8N connection
     */
    setCredentials(credentials: N8NCredentials): void;
    /**
     * Get current credentials
     */
    getCredentials(): N8NCredentials;
    /**
     * Check if credentials are valid
     */
    hasValidCredentials(): boolean;
    /**
     * Clear all credentials
     */
    clearCredentials(): void;
    /**
     * Get authentication headers for API requests
     */
    getAuthHeaders(): Record<string, string>;
    /**
     * Test N8N connection
     */
    testConnection(): Promise<boolean>;
    /**
     * Get N8N credentials (alias for getCredentials)
     */
    getN8NCredentials(): N8NCredentials;
    /**
     * Get Supabase credentials (placeholder - this might need separate implementation)
     */
    getSupabaseCredentials(): any;
}
export default N8NCredentialsManager;
//# sourceMappingURL=n8n-credentials-manager.d.ts.map