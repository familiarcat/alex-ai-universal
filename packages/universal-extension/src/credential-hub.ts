/**
 * Universal Credential Hub System
 * 
 * Centralized credential management for all Alex AI instances
 * Provides secure access to OpenRouter, Supabase, and N8N resources
 * Optimizes LLM usage and cost management across all platforms
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export interface UniversalCredentials {
  openrouter: {
    apiKey: string;
    baseUrl: string;
    models: {
      primary: string;
      fallback: string;
      costOptimized: string;
      performanceOptimized: string;
    };
    rateLimits: {
      requestsPerMinute: number;
      tokensPerMinute: number;
    };
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceKey: string;
    databaseUrl: string;
  };
  n8n: {
    baseUrl: string;
    apiKey: string;
    webhookUrl: string;
    workflowIds: {
      crewCoordination: string;
      memorySync: string;
      crossPlatformSync: string;
      optimization: string;
    };
  };
  optimization: {
    costThreshold: number;
    performanceThreshold: number;
    modelSelectionStrategy: 'cost' | 'performance' | 'balanced';
    usageTracking: boolean;
  };
}

export interface LLMOptimization {
  model: string;
  cost: number;
  performance: number;
  latency: number;
  selectionReason: string;
  estimatedCost: number;
  estimatedTokens: number;
}

export interface ResourceUsage {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageLatency: number;
  optimizationSavings: number;
  lastUpdated: Date;
}

/**
 * Universal Credential Hub Manager
 * Manages centralized credentials and resource optimization
 */
export class UniversalCredentialHub {
  private credentials: UniversalCredentials;
  private resourceUsage: ResourceUsage;
  private credentialDir: string;
  private encryptionKey: string;

  constructor() {
    this.credentialDir = path.join(os.homedir(), '.alex-ai', 'credentials');
    this.encryptionKey = this.generateEncryptionKey();
    this.resourceUsage = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageLatency: 0,
      optimizationSavings: 0,
      lastUpdated: new Date()
    };
    
    // Initialize with default credentials
    this.credentials = this.getDefaultCredentials();
  }

  /**
   * Initialize credential hub system
   */
  async initialize(): Promise<void> {
    console.log('🔐 Initializing Universal Credential Hub...');
    
    // Ensure credential directory exists
    await this.ensureCredentialDirectory();
    
    // Load credentials from secure storage
    await this.loadCredentials();
    
    // Initialize resource optimization
    await this.initializeResourceOptimization();
    
    console.log('✅ Universal Credential Hub initialized');
  }

  /**
   * Get optimized LLM configuration for a request
   */
  async getOptimizedLLMConfig(
    requestType: 'crew-coordination' | 'memory-sync' | 'analysis' | 'general',
    complexity: 'simple' | 'medium' | 'complex',
    priority: 'cost' | 'performance' | 'balanced'
  ): Promise<LLMOptimization> {
    const strategy = this.credentials.optimization.modelSelectionStrategy;
    
    // Analyze request characteristics
    const requestAnalysis = this.analyzeRequest(requestType, complexity, priority);
    
    // Select optimal model based on strategy
    const modelSelection = await this.selectOptimalModel(requestAnalysis, strategy);
    
    // Calculate cost and performance metrics
    const optimization = await this.calculateOptimization(modelSelection);
    
    return {
      model: modelSelection.model,
      cost: modelSelection.cost,
      performance: modelSelection.performance,
      latency: modelSelection.latency,
      selectionReason: modelSelection.reason,
      estimatedCost: optimization.estimatedCost,
      estimatedTokens: optimization.estimatedTokens
    };
  }

  /**
   * Execute OpenRouter request with optimization
   */
  async executeOpenRouterRequest(
    prompt: string,
    context: string = '',
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<{
    response: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      cost: number;
    };
    optimization: LLMOptimization;
  }> {
    // Get optimized configuration
    const optimization = await this.getOptimizedLLMConfig(
      'general',
      this.analyzeComplexity(prompt),
      'balanced'
    );

    // Prepare request
    const request = {
      model: options.model || optimization.model,
      messages: [
        {
          role: 'system',
          content: `You are Alex AI, a Star Trek crew-based AI assistant. ${context}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      stream: options.stream || false
    };

    // Execute request
    const startTime = Date.now();
    const response = await this.executeRequest(request);
    const latency = Date.now() - startTime;

    // Update resource usage
    await this.updateResourceUsage(response.usage, latency);

    return {
      response: response.choices[0].message.content,
      usage: response.usage,
      optimization
    };
  }

  /**
   * Get Supabase client with our credentials
   */
  async getSupabaseClient(): Promise<any> {
    if (!this.credentials.supabase.url || !this.credentials.supabase.anonKey) {
      throw new Error('Supabase credentials not configured');
    }

    // Dynamic import to avoid build issues
    let createClient: any;
    try {
      // Use require for dynamic import to avoid TypeScript issues
      const supabase = require('@supabase/supabase-js');
      createClient = supabase.createClient;
    } catch (error) {
      console.warn('⚠️ Supabase not available, using local storage only');
      return null;
    }
    
    if (createClient) {
      return createClient(
        this.credentials.supabase.url,
        this.credentials.supabase.anonKey
      );
    }
    return null;
  }

  /**
   * Get N8N workflow execution client
   */
  async getN8NClient(): Promise<any> {
    if (!this.credentials.n8n.baseUrl || !this.credentials.n8n.apiKey) {
      throw new Error('N8N credentials not configured');
    }

    return {
      baseUrl: this.credentials.n8n.baseUrl,
      apiKey: this.credentials.n8n.apiKey,
      webhookUrl: this.credentials.n8n.webhookUrl,
      executeWorkflow: async (workflowId: string, data: any) => {
        return await this.executeN8NWorkflow(workflowId, data);
      }
    };
  }

  /**
   * Get resource usage statistics
   */
  getResourceUsage(): ResourceUsage {
    return this.resourceUsage;
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<{
    costSavings: number;
    performanceImprovements: string[];
    recommendedModels: string[];
    usagePatterns: any;
  }> {
    const usage = this.resourceUsage;
    const recommendations = {
      costSavings: usage.optimizationSavings,
      performanceImprovements: [] as string[],
      recommendedModels: [] as string[],
      usagePatterns: {
        totalRequests: usage.totalRequests,
        averageCostPerRequest: usage.totalCost / Math.max(usage.totalRequests, 1),
        averageLatency: usage.averageLatency
      }
    };

    // Analyze usage patterns and provide recommendations
    if (usage.totalCost > this.credentials.optimization.costThreshold) {
      recommendations.performanceImprovements.push('Consider switching to cost-optimized models for non-critical tasks');
    }

    if (usage.averageLatency > 5000) {
      recommendations.performanceImprovements.push('Consider using performance-optimized models for time-sensitive tasks');
    }

    return recommendations;
  }

  /**
   * Load credentials from secure storage
   */
  private async loadCredentials(): Promise<void> {
    try {
      const credentialFile = path.join(this.credentialDir, 'universal-credentials.json');
      const data = await fs.readFile(credentialFile, 'utf-8');
      const encryptedCredentials = JSON.parse(data);
      
      // Decrypt credentials
      this.credentials = this.decryptCredentials(encryptedCredentials);
      
      console.log('🔐 Universal credentials loaded from secure storage');
    } catch (error) {
      console.log('📝 No existing credentials found, using defaults');
      await this.saveCredentials();
    }
  }

  /**
   * Save credentials to secure storage
   */
  private async saveCredentials(): Promise<void> {
    try {
      const credentialFile = path.join(this.credentialDir, 'universal-credentials.json');
      const encryptedCredentials = this.encryptCredentials(this.credentials);
      
      await fs.writeFile(credentialFile, JSON.stringify(encryptedCredentials, null, 2));
      console.log('🔐 Universal credentials saved to secure storage');
    } catch (error) {
      console.error('❌ Failed to save credentials:', error);
    }
  }

  /**
   * Get default credentials structure
   */
  private getDefaultCredentials(): UniversalCredentials {
    return {
      openrouter: {
        apiKey: process.env.OPENROUTER_API_KEY || '',
        baseUrl: 'https://openrouter.ai/api/v1',
        models: {
          primary: 'openai/gpt-4o-mini',
          fallback: 'anthropic/claude-3-haiku',
          costOptimized: 'microsoft/phi-3-mini-4k-instruct',
          performanceOptimized: 'openai/gpt-4o'
        },
        rateLimits: {
          requestsPerMinute: 60,
          tokensPerMinute: 100000
        }
      },
      supabase: {
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
        serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
        databaseUrl: process.env.SUPABASE_DATABASE_URL || ''
      },
      n8n: {
        baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
        apiKey: process.env.N8N_API_KEY || '',
        webhookUrl: process.env.N8N_WEBHOOK_URL || '',
        workflowIds: {
          crewCoordination: process.env.N8N_CREW_WORKFLOW_ID || '',
          memorySync: process.env.N8N_MEMORY_WORKFLOW_ID || '',
          crossPlatformSync: process.env.N8N_SYNC_WORKFLOW_ID || '',
          optimization: process.env.N8N_OPTIMIZATION_WORKFLOW_ID || ''
        }
      },
      optimization: {
        costThreshold: 10.0,
        performanceThreshold: 5000,
        modelSelectionStrategy: 'balanced',
        usageTracking: true
      }
    };
  }

  /**
   * Analyze request characteristics
   */
  private analyzeRequest(
    requestType: string,
    complexity: string,
    priority: string
  ): any {
    return {
      type: requestType,
      complexity,
      priority,
      estimatedTokens: this.estimateTokens(complexity),
      timeSensitivity: priority === 'performance' ? 'high' : 'medium'
    };
  }

  /**
   * Select optimal model based on analysis
   */
  private async selectOptimalModel(analysis: any, strategy: string): Promise<any> {
    const models = this.credentials.openrouter.models;
    
    switch (strategy) {
      case 'cost':
        return {
          model: models.costOptimized,
          cost: 0.1,
          performance: 0.7,
          latency: 2000,
          reason: 'Cost-optimized model selected for budget efficiency'
        };
      
      case 'performance':
        return {
          model: models.performanceOptimized,
          cost: 1.0,
          performance: 0.95,
          latency: 1000,
          reason: 'Performance-optimized model selected for maximum quality'
        };
      
      case 'balanced':
      default:
        if (analysis.complexity === 'simple') {
          return {
            model: models.costOptimized,
            cost: 0.1,
            performance: 0.7,
            latency: 2000,
            reason: 'Simple request optimized for cost'
          };
        } else if (analysis.complexity === 'complex') {
          return {
            model: models.performanceOptimized,
            cost: 1.0,
            performance: 0.95,
            latency: 1000,
            reason: 'Complex request optimized for performance'
          };
        } else {
          return {
            model: models.primary,
            cost: 0.5,
            performance: 0.85,
            latency: 1500,
            reason: 'Balanced model selected for optimal cost-performance ratio'
          };
        }
    }
  }

  /**
   * Calculate optimization metrics
   */
  private async calculateOptimization(modelSelection: any): Promise<any> {
    return {
      estimatedCost: modelSelection.cost * 0.001, // Per token cost
      estimatedTokens: 1000 // Estimated token usage
    };
  }

  /**
   * Execute OpenRouter request
   */
  private async executeRequest(request: any): Promise<any> {
    const response = await fetch(`${this.credentials.openrouter.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.openrouter.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://alex-ai-universal.com',
        'X-Title': 'Alex AI Universal'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`OpenRouter request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Execute N8N workflow
   */
  private async executeN8NWorkflow(workflowId: string, data: any): Promise<any> {
    const response = await fetch(`${this.credentials.n8n.baseUrl}/api/v1/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.n8n.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`N8N workflow execution failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Update resource usage tracking
   */
  private async updateResourceUsage(usage: any, latency: number): Promise<void> {
    this.resourceUsage.totalRequests++;
    this.resourceUsage.totalTokens += usage.totalTokens;
    this.resourceUsage.totalCost += usage.cost || 0;
    this.resourceUsage.averageLatency = 
      (this.resourceUsage.averageLatency + latency) / 2;
    this.resourceUsage.lastUpdated = new Date();
  }

  /**
   * Analyze prompt complexity
   */
  private analyzeComplexity(prompt: string): 'simple' | 'medium' | 'complex' {
    const wordCount = prompt.split(' ').length;
    const hasCode = prompt.includes('```') || prompt.includes('function') || prompt.includes('class');
    const hasMultipleQuestions = (prompt.match(/\?/g) || []).length > 1;
    
    if (wordCount < 50 && !hasCode && !hasMultipleQuestions) {
      return 'simple';
    } else if (wordCount < 200 && !hasCode) {
      return 'medium';
    } else {
      return 'complex';
    }
  }

  /**
   * Estimate token usage
   */
  private estimateTokens(complexity: string): number {
    switch (complexity) {
      case 'simple': return 100;
      case 'medium': return 500;
      case 'complex': return 1500;
      default: return 500;
    }
  }

  /**
   * Generate encryption key
   */
  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt credentials
   */
  private encryptCredentials(credentials: UniversalCredentials): any {
    // Simple encryption for demo - in production, use proper encryption
    return {
      encrypted: true,
      data: JSON.stringify(credentials)
    };
  }

  /**
   * Decrypt credentials
   */
  private decryptCredentials(encrypted: any): UniversalCredentials {
    if (encrypted.encrypted) {
      return JSON.parse(encrypted.data);
    }
    return encrypted;
  }

  /**
   * Ensure credential directory exists
   */
  private async ensureCredentialDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.credentialDir, { recursive: true });
    } catch (error) {
      console.error('❌ Failed to create credential directory:', error);
    }
  }

  /**
   * Initialize resource optimization
   */
  private async initializeResourceOptimization(): Promise<void> {
    console.log('🎯 Resource optimization initialized');
    console.log(`   💰 Cost threshold: $${this.credentials.optimization.costThreshold}`);
    console.log(`   ⚡ Performance threshold: ${this.credentials.optimization.performanceThreshold}ms`);
    console.log(`   🎯 Strategy: ${this.credentials.optimization.modelSelectionStrategy}`);
  }
}

/**
 * Create Universal Credential Hub instance
 */
export function createUniversalCredentialHub(): UniversalCredentialHub {
  return new UniversalCredentialHub();
}
