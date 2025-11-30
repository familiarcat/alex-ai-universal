"use strict";
/**
 * Unified Data Service - Central Data Management
 *
 * This service provides unified data access across all sub-projects,
 * integrating with N8N Federation Crew, Supabase, and local fallbacks.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedDataService = void 0;
const n8n_credentials_manager_1 = require("./n8n-credentials-manager");
const axios_1 = __importDefault(require("axios"));
class UnifiedDataService {
    constructor(config = {}) {
        this.dataSources = [];
        this.cache = new Map();
        this.credentialsManager = new n8n_credentials_manager_1.N8NCredentialsManager();
        this.config = {
            enableN8N: true,
            enableSupabase: true,
            enableLocalFallback: true,
            cacheDuration: 10 * 60 * 1000, // 10 minutes
            retryAttempts: 3,
            ...config
        };
    }
    /**
     * Initialize the unified data service
     */
    async initialize() {
        console.log('🔄 Initializing Unified Data Service...');
        // Initialize data sources
        this.dataSources = [
            {
                name: 'N8N Federation Crew',
                type: 'n8n',
                isAvailable: false,
                lastSync: null
            },
            {
                name: 'Supabase Database',
                type: 'supabase',
                isAvailable: false,
                lastSync: null
            },
            {
                name: 'Local Fallback',
                type: 'local',
                isAvailable: true,
                lastSync: new Date()
            }
        ];
        // Test connections
        await this.testConnections();
        console.log('✅ Unified Data Service initialized');
    }
    /**
     * Test all data source connections
     */
    async testConnections() {
        for (const source of this.dataSources) {
            try {
                switch (source.type) {
                    case 'n8n':
                        source.isAvailable = await this.testN8NConnection();
                        break;
                    case 'supabase':
                        source.isAvailable = await this.testSupabaseConnection();
                        break;
                    case 'local':
                        source.isAvailable = true;
                        break;
                }
                source.lastSync = new Date();
            }
            catch (error) {
                console.warn(`⚠️ Data source ${source.name} unavailable:`, error);
                source.isAvailable = false;
            }
        }
    }
    /**
     * Test N8N connection
     */
    async testN8NConnection() {
        if (!this.config.enableN8N)
            return false;
        try {
            const credentials = await this.credentialsManager.getN8NCredentials();
            const response = await axios_1.default.post(`${credentials.baseUrl}/webhook/federation-mission`, { action: 'test_connection' }, { timeout: 5000 });
            return response.status === 200;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Test Supabase connection
     */
    async testSupabaseConnection() {
        if (!this.config.enableSupabase)
            return false;
        try {
            const credentials = await this.credentialsManager.getSupabaseCredentials();
            // Test Supabase connection
            return !!credentials.url && !!credentials.anonKey;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get data from the best available source
     */
    async getData(key, fetcher) {
        // Check cache first
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.config.cacheDuration) {
            return cached.data;
        }
        // Try to fetch from available sources
        for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
            try {
                const data = await fetcher();
                this.cache.set(key, { data, timestamp: Date.now() });
                return data;
            }
            catch (error) {
                console.warn(`⚠️ Attempt ${attempt + 1} failed for ${key}:`, error);
                if (attempt === this.config.retryAttempts - 1) {
                    throw error;
                }
            }
        }
        throw new Error(`Failed to fetch data for ${key} after ${this.config.retryAttempts} attempts`);
    }
    /**
     * Get job opportunities
     */
    async getJobOpportunities() {
        return this.getData('job_opportunities', async () => {
            // Try N8N first
            if (this.dataSources.find(s => s.type === 'n8n' && s.isAvailable)) {
                return await this.getFromN8N('job-opportunities');
            }
            // Try Supabase
            if (this.dataSources.find(s => s.type === 'supabase' && s.isAvailable)) {
                return await this.getFromSupabase('job_opportunities');
            }
            // Fallback to local data
            return this.getLocalJobData();
        });
    }
    /**
     * Get contacts
     */
    async getContacts() {
        return this.getData('contacts', async () => {
            // Try N8N first
            if (this.dataSources.find(s => s.type === 'n8n' && s.isAvailable)) {
                return await this.getFromN8N('contacts');
            }
            // Try Supabase
            if (this.dataSources.find(s => s.type === 'supabase' && s.isAvailable)) {
                return await this.getFromSupabase('contacts');
            }
            // Fallback to local data
            return this.getLocalContactData();
        });
    }
    /**
     * Get data from N8N
     */
    async getFromN8N(endpoint) {
        const credentials = await this.credentialsManager.getN8NCredentials();
        const response = await axios_1.default.post(`${credentials.baseUrl}/webhook/${endpoint}`, {
            action: 'get_all',
            timestamp: new Date().toISOString(),
            source: 'alex_ai_core'
        }, {
            headers: {
                'X-N8N-API-KEY': credentials.apiKey,
                'Content-Type': 'application/json',
            },
            timeout: 10000
        });
        return response.data?.data || response.data || [];
    }
    /**
     * Get data from Supabase
     */
    async getFromSupabase(table) {
        const credentials = await this.credentialsManager.getSupabaseCredentials();
        // This would use the Supabase client
        // For now, return empty array as placeholder
        return [];
    }
    /**
     * Get local job data
     */
    getLocalJobData() {
        return [
            {
                id: 'local-1',
                company: 'Microsoft',
                position: 'Senior Software Engineer - AI/ML Platform',
                location: 'St. Louis, MO',
                salary_range: '$120k-180k',
                alex_ai_score: 95,
                source: 'local_fallback'
            },
            {
                id: 'local-2',
                company: 'Boeing',
                position: 'Senior Software Engineer - AI/ML',
                location: 'St. Louis, MO',
                salary_range: '$110k-170k',
                alex_ai_score: 88,
                source: 'local_fallback'
            }
        ];
    }
    /**
     * Get local contact data
     */
    getLocalContactData() {
        return [
            {
                id: 'contact-1',
                company: 'Microsoft',
                name: 'John Smith',
                title: 'Hiring Manager',
                email: 'john.smith@microsoft.com',
                confidence_level: 'high',
                source: 'local_fallback'
            }
        ];
    }
    /**
     * Test connection
     */
    async testConnection() {
        await this.testConnections();
        return this.dataSources.some(source => source.isAvailable);
    }
    /**
     * Get data sources status
     */
    getDataSources() {
        return [...this.dataSources];
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * Cleanup
     */
    async cleanup() {
        this.cache.clear();
        console.log('✅ Unified Data Service cleaned up');
    }
}
exports.UnifiedDataService = UnifiedDataService;
//# sourceMappingURL=unified-data-service.js.map