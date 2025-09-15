/**
 * N8N Credentials Manager - Universal Credential Management
 *
 * This service manages all credentials through n8n.pbradygeorgen.com
 * as the single source of truth, eliminating the need for local environment variables.
 */
interface CredentialsCache {
    supabase: {
        url: string;
        anonKey: string;
        serviceKey?: string;
    };
    n8n: {
        apiKey: string;
        baseUrl: string;
    };
    openai: {
        apiKey: string;
    };
    anthropic: {
        apiKey: string;
    };
    openrouter: {
        apiKey: string;
    };
    github: {
        token: string;
    };
    timestamp: number;
}
export declare class N8NCredentialsManager {
    /**
     * Get all credentials from N8N Federation Crew
     */
    getCredentials(): Promise<CredentialsCache>;
    /**
     * Get Supabase credentials
     */
    getSupabaseCredentials(): Promise<{
        url: string;
        anonKey: string;
        serviceKey?: string;
    }>;
    /**
     * Get N8N credentials
     */
    getN8NCredentials(): Promise<{
        apiKey: string;
        baseUrl: string;
    }>;
    /**
     * Get OpenAI credentials
     */
    getOpenAICredentials(): Promise<{
        apiKey: string;
    }>;
    /**
     * Get Anthropic credentials
     */
    getAnthropicCredentials(): Promise<{
        apiKey: string;
    }>;
    /**
     * Get OpenRouter credentials
     */
    getOpenRouterCredentials(): Promise<{
        apiKey: string;
    }>;
    /**
     * Get GitHub credentials
     */
    getGitHubCredentials(): Promise<{
        token: string;
    }>;
    /**
     * Clear credentials cache (force refresh)
     */
    clearCache(): void;
    /**
     * Test N8N connection
     */
    testConnection(): Promise<boolean>;
}
export {};
//# sourceMappingURL=n8n-credentials-manager.d.ts.map