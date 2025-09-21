/**
 * ~/.zshrc Integration System - Loads N8N API configuration from ~/.zshrc
 *
 * Enables seamless integration with N8N workflows using user's existing configuration
 */
export interface ZshrcConfig {
    n8nApiUrl: string;
    n8nApiKey: string;
    n8nWebhookUrl: string;
    supabaseUrl: string;
    supabaseKey: string;
    openaiApiKey: string;
    alexAiConfig: {
        enableRAG: boolean;
        enableScraping: boolean;
        enableBilateralSync: boolean;
        learningRate: number;
        maxEmbeddings: number;
    };
}
export declare class ZshrcIntegration {
    private zshrcPath;
    private config;
    constructor();
    /**
     * Load configuration from ~/.zshrc
     */
    loadConfig(): Promise<ZshrcConfig>;
    /**
     * Parse ~/.zshrc content
     */
    private parseZshrcContent;
    /**
     * Fill missing configuration with defaults
     */
    private fillMissingConfig;
    /**
     * Load configuration from environment variables
     */
    private loadFromEnvironment;
    /**
     * Save configuration to ~/.zshrc
     */
    saveConfig(config: ZshrcConfig): Promise<void>;
    /**
     * Remove existing Alex AI configuration
     */
    private removeAlexAiConfig;
    /**
     * Generate ~/.zshrc configuration
     */
    private generateZshrcConfig;
    /**
     * Validate configuration
     */
    validateConfig(config: ZshrcConfig): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Get configuration status
     */
    getConfigStatus(config: ZshrcConfig): {
        n8n: boolean;
        supabase: boolean;
        openai: boolean;
        alexAi: boolean;
    };
    /**
     * Generate setup instructions
     */
    generateSetupInstructions(): string;
}
//# sourceMappingURL=zshrc-integration.d.ts.map