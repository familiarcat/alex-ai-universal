/**
 * 🖖 MCP OpenRouter Optimizer
 * 
 * Context-aware, cost-effective OpenRouter model selection with MCP caching.
 * Enhanced version of the n8n optimizer with caching for even better efficiency.
 * 
 * DDD Architecture: Client => MCP => OpenRouter API (with caching)
 */

const { getMCPCache } = require('./mcp-context-cache');
const https = require('https');
const { loadCrewCredentials } = require('./load-crew-credentials');

/**
 * OpenRouter Model Configuration
 * Cost per 1M tokens (input + output average)
 */
const OPENROUTER_MODELS = {
  // High-performance models
  'anthropic/claude-3.5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    costPer1M: 3.00,
    specialization: ['strategic_analysis', 'reasoning', 'coding', 'writing'],
    strengths: ['complex_reasoning', 'code_generation', 'analysis'],
    bestFor: ['strategic_planning', 'complex_analysis', 'system_architecture'],
    crewMember: ['picard', 'data', 'geordi']
  },
  'openai/gpt-4o': {
    name: 'GPT-4o',
    costPer1M: 5.00,
    specialization: ['research', 'multimodal', 'general_purpose'],
    strengths: ['multimodal', 'creativity', 'general_purpose'],
    bestFor: ['research', 'multimodal_tasks', 'creative_work'],
    crewMember: ['troi', 'uhura']
  },
  
  // Cost-effective models
  'anthropic/claude-3-haiku': {
    name: 'Claude 3 Haiku',
    costPer1M: 0.25,
    specialization: ['quick_analysis', 'simple_tasks'],
    strengths: ['speed', 'cost_effective', 'simple_reasoning'],
    bestFor: ['quick_analysis', 'simple_tasks', 'low_complexity'],
    crewMember: ['obrien']
  },
  'google/gemini-pro-1.5': {
    name: 'Gemini Pro 1.5',
    costPer1M: 2.00,
    specialization: ['optimization', 'code_analysis'],
    strengths: ['code_analysis', 'performance', 'efficiency'],
    bestFor: ['optimization', 'code_review', 'performance_analysis'],
    crewMember: ['quark', 'geordi']
  },
  'meta-llama/llama-3-70b-instruct': {
    name: 'Llama 3 70B',
    costPer1M: 1.00,
    specialization: ['code_implementation', 'cost_effective'],
    strengths: ['open_source', 'cost_effective', 'coding'],
    bestFor: ['code_implementation', 'simple_coding', 'budget_constrained'],
    crewMember: ['obrien', 'riker']
  },
  
  // Specialized models
  'openai/gpt-4o-mini': {
    name: 'GPT-4o Mini',
    costPer1M: 0.60,
    specialization: ['general_purpose', 'cost_effective'],
    strengths: ['general_purpose', 'cost_effective', 'balanced'],
    bestFor: ['general_tasks', 'balanced_performance'],
    crewMember: ['crusher', 'worf']
  }
};

/**
 * Task Type to Model Affinity Scoring
 */
const TASK_AFFINITIES = {
  'strategic_planning': {
    'anthropic/claude-3.5-sonnet': 0.98,
    'openai/gpt-4o': 0.90,
    'google/gemini-pro-1.5': 0.75,
    'meta-llama/llama-3-70b-instruct': 0.65
  },
  'complex_analysis': {
    'anthropic/claude-3.5-sonnet': 0.95,
    'openai/gpt-4o': 0.88,
    'google/gemini-pro-1.5': 0.80,
    'meta-llama/llama-3-70b-instruct': 0.70
  },
  'code_generation': {
    'anthropic/claude-3.5-sonnet': 0.92,
    'meta-llama/llama-3-70b-instruct': 0.90,
    'google/gemini-pro-1.5': 0.85,
    'openai/gpt-4o': 0.82
  },
  'quick_analysis': {
    'anthropic/claude-3-haiku': 0.95,
    'openai/gpt-4o-mini': 0.90,
    'meta-llama/llama-3-70b-instruct': 0.85,
    'google/gemini-pro-1.5': 0.80
  },
  'optimization': {
    'google/gemini-pro-1.5': 0.95,
    'meta-llama/llama-3-70b-instruct': 0.85,
    'anthropic/claude-3.5-sonnet': 0.80,
    'openai/gpt-4o': 0.75
  }
};

/**
 * Crew Member to Task Type Mapping
 */
const CREW_TASK_TYPES = {
  'picard': 'strategic_planning',
  'data': 'complex_analysis',
  'geordi': 'code_generation',
  'riker': 'operations',
  'worf': 'security_review',
  'crusher': 'health_monitoring',
  'troi': 'user_experience',
  'uhura': 'user_experience',
  'quark': 'business_analysis',
  'obrien': 'operations'
};

class MCPOpenRouterOptimizer {
  constructor() {
    this.mcpCache = getMCPCache();
    this.apiKey = null;
  }

  /**
   * Initialize OpenRouter API key
   */
  initialize() {
    const credentials = loadCrewCredentials();
    this.apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!this.apiKey) {
      // Try to load from zshrc via loadCrewCredentials
      // The credentials loader should handle this
      throw new Error('OPENROUTER_API_KEY not found. Set in ~/.zshrc');
    }
    
    return true;
  }

  /**
   * Select optimal model with MCP caching
   */
  selectOptimalModel(context, options = {}) {
    const {
      taskType,
      complexity = 'medium',
      crewMember,
      budgetConstraint = null,
      estimatedTokens = 1500,
      useCache = true
    } = { ...context, ...options };

    // Check cache first (MCP efficiency gain!)
    if (useCache) {
      const cacheKey = this.mcpCache.generateCacheKey(JSON.stringify({
        taskType,
        complexity,
        crewMember,
        budgetConstraint,
        estimatedTokens
      }), {});
      
      const cached = this.mcpCache.getContext(cacheKey);
      if (cached) {
        console.log('   ✅ Using cached model selection (MCP efficiency)');
        return JSON.parse(cached.content);
      }
    }

    // Determine task type from crew member if not provided
    const actualTaskType = taskType || CREW_TASK_TYPES[crewMember] || 'general';
    
    // Get affinity scores for this task type
    const affinities = TASK_AFFINITIES[actualTaskType] || {};
    
    // Calculate scores for all models
    const scores = {};
    
    Object.keys(OPENROUTER_MODELS).forEach(modelId => {
      const model = OPENROUTER_MODELS[modelId];
      let score = affinities[modelId] || 0.7; // Default neutral score
      
      // Adjust for complexity
      const complexityMultiplier = {
        'low': 0.9,
        'medium': 1.0,
        'high': 1.1
      }[complexity] || 1.0;
      score *= complexityMultiplier;
      
      // Cost efficiency bonus (lower cost = higher bonus)
      const costEfficiency = 1 / (model.costPer1M * 1000); // Normalize
      score += costEfficiency * 0.1;
      
      // Crew member alignment bonus
      if (crewMember && model.crewMember && model.crewMember.includes(crewMember)) {
        score += 0.15;
      }
      
      // Budget constraint adjustment
      if (budgetConstraint) {
        const estimatedCost = (estimatedTokens / 1000000) * model.costPer1M;
        if (estimatedCost > budgetConstraint) {
          score *= 0.5; // Penalize expensive models if over budget
        }
      }
      
      scores[modelId] = score;
    });
    
    // Select best model
    const bestModel = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0];
    
    const selectedModel = OPENROUTER_MODELS[bestModel[0]];
    const estimatedCost = (estimatedTokens / 1000000) * selectedModel.costPer1M;

    const result = {
      modelId: bestModel[0],
      model: selectedModel,
      confidence: bestModel[1],
      estimatedCost,
      estimatedTokens,
      scores,
      reasoning: {
        taskType: actualTaskType,
        complexity,
        crewMember,
        budgetConstraint
      }
    };

    // Cache result (MCP efficiency!)
    if (useCache) {
      const cacheKey = this.mcpCache.generateCacheKey(JSON.stringify({
        taskType,
        complexity,
        crewMember,
        budgetConstraint,
        estimatedTokens
      }), {});
      
      this.mcpCache.storeContext(
        JSON.stringify(result),
        null,
        {
          sessionId: `openrouter-selection-${Date.now()}`,
          tags: ['openrouter', 'model-selection', taskType, crewMember].filter(Boolean)
        }
      );
    }

    return result;
  }

  /**
   * Call OpenRouter API with optimized model selection
   */
  async callOpenRouter(prompt, context = {}, options = {}) {
    if (!this.apiKey) {
      this.initialize();
    }

    // Select optimal model
    const modelSelection = this.selectOptimalModel(context, options);
    
    console.log(`🤖 Selected model: ${modelSelection.model.name}`);
    console.log(`   Cost: $${modelSelection.estimatedCost.toFixed(4)}`);
    console.log(`   Confidence: ${(modelSelection.confidence * 100).toFixed(1)}%`);

    // Make API call
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model: modelSelection.modelId,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        ...options.apiOptions || {}
      });

      const options = {
        hostname: 'openrouter.ai',
        port: 443,
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://alex-ai-universal.com',
          'X-Title': 'Alex AI Universal'
        },
        timeout: 30000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const result = JSON.parse(body);
              resolve({
                ...result,
                modelSelection,
                cost: modelSelection.estimatedCost
              });
            } catch (e) {
              resolve({ body, modelSelection });
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * Get optimization statistics
   */
  getStats() {
    const cacheStats = this.mcpCache.getStats();
    return {
      cache: cacheStats,
      models: Object.keys(OPENROUTER_MODELS).length,
      taskTypes: Object.keys(TASK_AFFINITIES).length
    };
  }
}

// Singleton instance
let mcpOpenRouterOptimizerInstance = null;

function getMCPOpenRouterOptimizer() {
  if (!mcpOpenRouterOptimizerInstance) {
    mcpOpenRouterOptimizerInstance = new MCPOpenRouterOptimizer();
  }
  return mcpOpenRouterOptimizerInstance;
}

module.exports = { getMCPOpenRouterOptimizer, MCPOpenRouterOptimizer, OPENROUTER_MODELS };

