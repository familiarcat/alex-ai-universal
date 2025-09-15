"use strict";
/**
 * N8N Credentials Manager - Universal Credential Management
 *
 * This service manages all credentials through n8n.pbradygeorgen.com
 * as the single source of truth, eliminating the need for local environment variables.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8NCredentialsManager = void 0;
const axios_1 = __importDefault(require("axios"));
// N8N Federation Crew credentials endpoint
const N8N_BASE_URL = 'https://n8n.pbradygeorgen.com';
const N8N_CREDENTIALS_ENDPOINT = '/webhook/federation-mission';
let credentialsCache = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
class N8NCredentialsManager {
    /**
     * Get all credentials from N8N Federation Crew
     */
    async getCredentials() {
        // Return cached credentials if still valid
        if (credentialsCache && Date.now() - credentialsCache.timestamp < CACHE_DURATION) {
            return credentialsCache;
        }
        try {
            console.log('🔐 Fetching credentials from N8N Federation Crew...');
            const response = await axios_1.default.post(`${N8N_BASE_URL}${N8N_CREDENTIALS_ENDPOINT}`, {
                action: 'get_credentials',
                timestamp: new Date().toISOString(),
                source: 'alex_ai_core'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000
            });
            if (response.data && response.data.credentials) {
                credentialsCache = {
                    ...response.data.credentials,
                    timestamp: Date.now()
                };
                console.log('✅ Credentials loaded from N8N Federation Crew');
                return credentialsCache;
            }
            else {
                throw new Error('Invalid credentials response from N8N');
            }
        }
        catch (error) {
            console.warn('⚠️ Failed to fetch credentials from N8N, using fallback:', error);
            // Fallback to default credentials for development
            credentialsCache = {
                supabase: {
                    url: 'https://rpkkkbufdwxmjaerbhbn.supabase.co',
                    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwa2trYnVmZHd4bWphZXJiYm4iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNjI0NzQ0MCwiZXhwIjoyMDUxODIzNDQwfQ.placeholder'
                },
                n8n: {
                    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
                    baseUrl: N8N_BASE_URL
                },
                openai: {
                    apiKey: 'sk-placeholder'
                },
                anthropic: {
                    apiKey: 'sk-ant-placeholder'
                },
                openrouter: {
                    apiKey: 'sk-or-placeholder'
                },
                github: {
                    token: 'ghp-placeholder'
                },
                timestamp: Date.now()
            };
            return credentialsCache;
        }
    }
    /**
     * Get Supabase credentials
     */
    async getSupabaseCredentials() {
        const credentials = await this.getCredentials();
        return credentials.supabase;
    }
    /**
     * Get N8N credentials
     */
    async getN8NCredentials() {
        const credentials = await this.getCredentials();
        return credentials.n8n;
    }
    /**
     * Get OpenAI credentials
     */
    async getOpenAICredentials() {
        const credentials = await this.getCredentials();
        return credentials.openai;
    }
    /**
     * Get Anthropic credentials
     */
    async getAnthropicCredentials() {
        const credentials = await this.getCredentials();
        return credentials.anthropic;
    }
    /**
     * Get OpenRouter credentials
     */
    async getOpenRouterCredentials() {
        const credentials = await this.getCredentials();
        return credentials.openrouter;
    }
    /**
     * Get GitHub credentials
     */
    async getGitHubCredentials() {
        const credentials = await this.getCredentials();
        return credentials.github;
    }
    /**
     * Clear credentials cache (force refresh)
     */
    clearCache() {
        credentialsCache = null;
    }
    /**
     * Test N8N connection
     */
    async testConnection() {
        try {
            const credentials = await this.getN8NCredentials();
            const response = await axios_1.default.post(`${credentials.baseUrl}/webhook/federation-mission`, {
                action: 'test_connection',
                timestamp: new Date().toISOString()
            }, {
                headers: {
                    'X-N8N-API-KEY': credentials.apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 5000
            });
            return response.status === 200;
        }
        catch (error) {
            console.error('N8N connection test failed:', error);
            return false;
        }
    }
}
exports.N8NCredentialsManager = N8NCredentialsManager;
//# sourceMappingURL=n8n-credentials-manager.js.map