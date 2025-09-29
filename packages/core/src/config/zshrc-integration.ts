/**
 * ~/.zshrc Integration System - Loads N8N API configuration from ~/.zshrc
 * 
 * Enables seamless integration with N8N workflows using user's existing configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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

export class ZshrcIntegration {
  private zshrcPath: string;
  private config: ZshrcConfig | null = null;

  constructor() {
    this.zshrcPath = path.join(os.homedir(), '.zshrc');
  }

  /**
   * Load configuration from ~/.zshrc
   */
  async loadConfig(): Promise<ZshrcConfig> {
    try {
      console.log('🔧 Loading configuration from ~/.zshrc...');
      
      if (!fs.existsSync(this.zshrcPath)) {
        console.warn('⚠️ ~/.zshrc not found, using environment variables');
        return this.loadFromEnvironment();
      }
      
      const zshrcContent = await fs.promises.readFile(this.zshrcPath, 'utf8');
      this.config = this.parseZshrcContent(zshrcContent);
      
      console.log('✅ Configuration loaded from ~/.zshrc');
      return this.config;
    } catch (error) {
      console.error('❌ Failed to load ~/.zshrc configuration:', error);
      return this.loadFromEnvironment();
    }
  }

  /**
   * Parse ~/.zshrc content
   */
  private parseZshrcContent(content: string): ZshrcConfig {
    const lines = content.split('\n');
    const config: Partial<ZshrcConfig> = {};
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('#') || trimmedLine === '') {
        continue;
      }
      
      // Parse export statements
      if (trimmedLine.startsWith('export ')) {
        const match = trimmedLine.match(/export\s+(\w+)=(.+)/);
        if (match) {
          const [, key, value] = match;
          const cleanValue = value.replace(/['"]/g, '');
          
          switch (key) {
            case 'N8N_API_URL':
              config.n8nApiUrl = cleanValue;
              break;
            case 'N8N_API_KEY':
              config.n8nApiKey = cleanValue;
              break;
            case 'N8N_WEBHOOK_URL':
              config.n8nWebhookUrl = cleanValue;
              break;
            case 'SUPABASE_URL':
              config.supabaseUrl = cleanValue;
              break;
            case 'SUPABASE_ANON_KEY':
              config.supabaseKey = cleanValue;
              break;
            case 'OPENAI_API_KEY':
              config.openaiApiKey = cleanValue;
              break;
          }
        }
      }
      
      // Parse Alex AI specific configuration
      if (trimmedLine.includes('ALEX_AI_')) {
        const match = trimmedLine.match(/export\s+ALEX_AI_(\w+)=(.+)/);
        if (match) {
          const [, key, value] = match;
          const cleanValue = value.replace(/['"]/g, '');
          
          if (!config.alexAiConfig) {
            config.alexAiConfig = {
              enableRAG: true,
              enableScraping: true,
              enableBilateralSync: true,
              learningRate: 0.1,
              maxEmbeddings: 1000
            };
          }
          
          switch (key) {
            case 'ENABLE_RAG':
              config.alexAiConfig.enableRAG = cleanValue === 'true';
              break;
            case 'ENABLE_SCRAPING':
              config.alexAiConfig.enableScraping = cleanValue === 'true';
              break;
            case 'ENABLE_BILATERAL_SYNC':
              config.alexAiConfig.enableBilateralSync = cleanValue === 'true';
              break;
            case 'LEARNING_RATE':
              config.alexAiConfig.learningRate = parseFloat(cleanValue) || 0.1;
              break;
            case 'MAX_EMBEDDINGS':
              config.alexAiConfig.maxEmbeddings = parseInt(cleanValue) || 1000;
              break;
          }
        }
      }
    }
    
    return this.fillMissingConfig(config);
  }

  /**
   * Fill missing configuration with defaults
   */
  private fillMissingConfig(config: Partial<ZshrcConfig>): ZshrcConfig {
    return {
      n8nApiUrl: config.n8nApiUrl || 'https://n8n.pbradygeorgen.com/api/v1',
      n8nApiKey: config.n8nApiKey || '',
      n8nWebhookUrl: config.n8nWebhookUrl || 'https://n8n.pbradygeorgen.com/webhook',
      supabaseUrl: config.supabaseUrl || 'https://your-project.supabase.co',
      supabaseKey: config.supabaseKey || '',
      openaiApiKey: config.openaiApiKey || '',
      alexAiConfig: {
        enableRAG: config.alexAiConfig?.enableRAG ?? true,
        enableScraping: config.alexAiConfig?.enableScraping ?? true,
        enableBilateralSync: config.alexAiConfig?.enableBilateralSync ?? true,
        learningRate: config.alexAiConfig?.learningRate ?? 0.1,
        maxEmbeddings: config.alexAiConfig?.maxEmbeddings ?? 1000
      }
    };
  }

  /**
   * Load configuration from environment variables
   */
  private loadFromEnvironment(): ZshrcConfig {
    console.log('🔧 Loading configuration from environment variables...');
    
    return {
      n8nApiUrl: process.env.N8N_API_URL || 'https://n8n.pbradygeorgen.com/api/v1',
      n8nApiKey: process.env.N8N_API_KEY || '',
      n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'https://n8n.pbradygeorgen.com/webhook',
      supabaseUrl: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
      supabaseKey: process.env.SUPABASE_ANON_KEY || '',
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      alexAiConfig: {
        enableRAG: process.env.ALEX_AI_ENABLE_RAG === 'true',
        enableScraping: process.env.ALEX_AI_ENABLE_SCRAPING === 'true',
        enableBilateralSync: process.env.ALEX_AI_ENABLE_BILATERAL_SYNC === 'true',
        learningRate: parseFloat(process.env.ALEX_AI_LEARNING_RATE || '0.1'),
        maxEmbeddings: parseInt(process.env.ALEX_AI_MAX_EMBEDDINGS || '1000')
      }
    };
  }

  /**
   * Save configuration to ~/.zshrc
   */
  async saveConfig(config: ZshrcConfig): Promise<void> {
    try {
      console.log('💾 Saving configuration to ~/.zshrc...');
      
      let zshrcContent = '';
      
      // Read existing content
      if (fs.existsSync(this.zshrcPath)) {
        zshrcContent = await fs.promises.readFile(this.zshrcPath, 'utf8');
      }
      
      // Remove existing Alex AI configuration
      zshrcContent = this.removeAlexAiConfig(zshrcContent);
      
      // Add new configuration
      const newConfig = this.generateZshrcConfig(config);
      zshrcContent += '\n' + newConfig;
      
      // Write back to file
      await fs.promises.writeFile(this.zshrcPath, zshrcContent, 'utf8');
      
      console.log('✅ Configuration saved to ~/.zshrc');
    } catch (error) {
      console.error('❌ Failed to save configuration to ~/.zshrc:', error);
      throw error;
    }
  }

  /**
   * Remove existing Alex AI configuration
   */
  private removeAlexAiConfig(content: string): string {
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => {
      const trimmedLine = line.trim();
      return !trimmedLine.includes('N8N_API_') &&
             !trimmedLine.includes('SUPABASE_') &&
             !trimmedLine.includes('OPENAI_API_KEY') &&
             !trimmedLine.includes('ALEX_AI_');
    });
    
    return filteredLines.join('\n');
  }

  /**
   * Generate ~/.zshrc configuration
   */
  private generateZshrcConfig(config: ZshrcConfig): string {
    return `
# Alex AI Configuration
# Generated by Alex AI Universal
export N8N_API_URL="${config.n8nApiUrl}"
export N8N_API_KEY="${config.n8nApiKey}"
export N8N_WEBHOOK_URL="${config.n8nWebhookUrl}"
export SUPABASE_URL="${config.supabaseUrl}"
export SUPABASE_ANON_KEY="${config.supabaseKey}"
export OPENAI_API_KEY="${config.openaiApiKey}"

# Alex AI Specific Configuration
export ALEX_AI_ENABLE_RAG="${config.alexAiConfig.enableRAG}"
export ALEX_AI_ENABLE_SCRAPING="${config.alexAiConfig.enableScraping}"
export ALEX_AI_ENABLE_BILATERAL_SYNC="${config.alexAiConfig.enableBilateralSync}"
export ALEX_AI_LEARNING_RATE="${config.alexAiConfig.learningRate}"
export ALEX_AI_MAX_EMBEDDINGS="${config.alexAiConfig.maxEmbeddings}"

# Reload shell configuration
source ~/.zshrc
`;
  }

  /**
   * Validate configuration
   */
  validateConfig(config: ZshrcConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.n8nApiUrl) {
      errors.push('N8N API URL is required');
    }
    
    if (!config.n8nApiKey) {
      errors.push('N8N API Key is required');
    }
    
    if (!config.supabaseUrl) {
      errors.push('Supabase URL is required');
    }
    
    if (!config.supabaseKey) {
      errors.push('Supabase Key is required');
    }
    
    if (!config.openaiApiKey) {
      errors.push('OpenAI API Key is required');
    }
    
    if (config.alexAiConfig.learningRate < 0 || config.alexAiConfig.learningRate > 1) {
      errors.push('Learning rate must be between 0 and 1');
    }
    
    if (config.alexAiConfig.maxEmbeddings < 1) {
      errors.push('Max embeddings must be greater than 0');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get configuration status
   */
  getConfigStatus(config: ZshrcConfig): {
    n8n: boolean;
    supabase: boolean;
    openai: boolean;
    alexAi: boolean;
  } {
    return {
      n8n: !!(config.n8nApiUrl && config.n8nApiKey),
      supabase: !!(config.supabaseUrl && config.supabaseKey),
      openai: !!config.openaiApiKey,
      alexAi: config.alexAiConfig.enableRAG || config.alexAiConfig.enableScraping || config.alexAiConfig.enableBilateralSync
    };
  }

  /**
   * Generate setup instructions
   */
  generateSetupInstructions(): string {
    return `
# Alex AI Universal Setup Instructions
# ===================================

## 1. Add to ~/.zshrc

Add the following lines to your ~/.zshrc file:

# N8N Configuration
export N8N_API_URL="https://n8n.pbradygeorgen.com/api/v1"
export N8N_API_KEY="your-n8n-api-key"
export N8N_WEBHOOK_URL="https://n8n.pbradygeorgen.com/webhook"

# Supabase Configuration
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-supabase-anon-key"

# OpenAI Configuration
export OPENAI_API_KEY="your-openai-api-key"

# Alex AI Configuration
export ALEX_AI_ENABLE_RAG="true"
export ALEX_AI_ENABLE_SCRAPING="true"
export ALEX_AI_ENABLE_BILATERAL_SYNC="true"
export ALEX_AI_LEARNING_RATE="0.1"
export ALEX_AI_MAX_EMBEDDINGS="1000"

## 2. Reload shell configuration

Run: source ~/.zshrc

## 3. Verify configuration

Run: npx alexi learning-model verify-status

## 4. Start using Alex AI

Run: npx alexi
Then say: "Engage AlexAI"
`;
  }
}










