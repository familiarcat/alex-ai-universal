"use strict";
/**
 * Alex AI Manager - Central Integration Hub
 *
 * This is the central manager that all sub-projects in the monorepo can use
 * to integrate with the Alex AI system, N8N Federation Crew, and universal
 * credential management.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlexAIStatus = exports.getAlexAI = exports.initializeAlexAI = exports.AlexAIManager = void 0;
const n8n_credentials_manager_1 = require("./n8n-credentials-manager");
const unified_data_service_1 = require("./unified-data-service");
const stealth_scraping_service_1 = require("./stealth-scraping-service");
const crew_manager_1 = require("./crew-manager");
class AlexAIManager {
    constructor(config = {}) {
        this.isInitialized = false;
        this.config = {
            environment: 'development',
            enableN8NIntegration: true,
            enableStealthScraping: true,
            enableCrewManagement: true,
            enableTesting: true,
            logLevel: 'info',
            ...config
        };
        this.credentialsManager = new n8n_credentials_manager_1.N8NCredentialsManager();
        this.dataService = new unified_data_service_1.UnifiedDataService();
        this.stealthService = new stealth_scraping_service_1.StealthScrapingService();
        this.crewManager = new crew_manager_1.AlexAICrewManager();
    }
    /**
     * Get singleton instance of Alex AI Manager
     */
    static getInstance(config) {
        if (!AlexAIManager.instance) {
            AlexAIManager.instance = new AlexAIManager(config);
        }
        return AlexAIManager.instance;
    }
    /**
     * Initialize Alex AI system
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('🔄 Alex AI Manager already initialized');
            return;
        }
        console.log('🚀 Initializing Alex AI Manager...');
        try {
            // Initialize credentials manager
            if (this.config.enableN8NIntegration) {
                await this.credentialsManager.getCredentials();
                console.log('✅ N8N Federation Crew credentials loaded');
            }
            // Initialize data service
            await this.dataService.initialize();
            console.log('✅ Unified data service initialized');
            // Initialize stealth service
            if (this.config.enableStealthScraping) {
                await this.stealthService.initialize();
                console.log('✅ Stealth scraping service initialized');
            }
            // Initialize crew manager
            if (this.config.enableCrewManagement) {
                await this.crewManager.initialize();
                console.log('✅ Alex AI crew manager initialized');
            }
            this.isInitialized = true;
            console.log('🎉 Alex AI Manager initialization complete!');
        }
        catch (error) {
            console.error('❌ Alex AI Manager initialization failed:', error);
            throw error;
        }
    }
    /**
     * Get system status
     */
    async getStatus() {
        const status = {
            isInitialized: this.isInitialized,
            n8nConnection: false,
            supabaseConnection: false,
            crewStatus: {},
            lastHealthCheck: new Date(),
            version: '2.0.0'
        };
        try {
            // Check N8N connection
            if (this.config.enableN8NIntegration) {
                status.n8nConnection = await this.credentialsManager.testConnection();
            }
            // Check Supabase connection
            status.supabaseConnection = await this.dataService.testConnection();
            // Check crew status
            if (this.config.enableCrewManagement) {
                status.crewStatus = await this.crewManager.getCrewStatus();
            }
        }
        catch (error) {
            console.error('Error checking Alex AI status:', error);
        }
        return status;
    }
    /**
     * Get credentials manager
     */
    getCredentialsManager() {
        return this.credentialsManager;
    }
    /**
     * Get data service
     */
    getDataService() {
        return this.dataService;
    }
    /**
     * Get stealth scraping service
     */
    getStealthService() {
        return this.stealthService;
    }
    /**
     * Get crew manager
     */
    getCrewManager() {
        return this.crewManager;
    }
    /**
     * Run end-to-end tests
     */
    async runTests() {
        if (!this.config.enableTesting) {
            throw new Error('Testing is disabled in configuration');
        }
        console.log('🧪 Running Alex AI end-to-end tests...');
        const results = {
            credentials: await this.credentialsManager.testConnection(),
            dataService: await this.dataService.testConnection(),
            stealthService: await this.stealthService.testConnection(),
            crewManager: await this.crewManager.testConnection(),
            timestamp: new Date().toISOString()
        };
        console.log('✅ Alex AI tests completed:', results);
        return results;
    }
    /**
     * Get configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('🔧 Alex AI configuration updated:', this.config);
    }
    /**
     * Shutdown Alex AI system
     */
    async shutdown() {
        console.log('🛑 Shutting down Alex AI Manager...');
        try {
            await this.stealthService.cleanup();
            await this.dataService.cleanup();
            await this.crewManager.cleanup();
            this.isInitialized = false;
            console.log('✅ Alex AI Manager shutdown complete');
        }
        catch (error) {
            console.error('❌ Error during Alex AI shutdown:', error);
        }
    }
}
exports.AlexAIManager = AlexAIManager;
// Export convenience functions for easy integration
const initializeAlexAI = async (config) => {
    const manager = AlexAIManager.getInstance(config);
    await manager.initialize();
    return manager;
};
exports.initializeAlexAI = initializeAlexAI;
const getAlexAI = () => AlexAIManager.getInstance();
exports.getAlexAI = getAlexAI;
const getAlexAIStatus = async () => {
    const manager = AlexAIManager.getInstance();
    return await manager.getStatus();
};
exports.getAlexAIStatus = getAlexAIStatus;
// Default export
exports.default = AlexAIManager;
//# sourceMappingURL=alex-ai-manager.js.map