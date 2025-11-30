/**
 * OpenRouter Optimization Module
 * 
 * Provides context-aware, cost-effective OpenRouter model selection
 * for all crew workflows and Alex AI operations.
 * 
 * DDD Architecture: Used by Client => N8N workflows => OpenRouter API
 */

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
  },
  'security_review': {
    'anthropic/claude-3.5-sonnet': 0.95,
    'openai/gpt-4o': 0.90,
    'google/gemini-pro-1.5': 0.80,
    'meta-llama/llama-3-70b-instruct': 0.70
  },
  'health_monitoring': {
    'openai/gpt-4o-mini': 0.90,
    'anthropic/claude-3-haiku': 0.88,
    'google/gemini-pro-1.5': 0.85,
    'meta-llama/llama-3-70b-instruct': 0.80
  },
  'user_experience': {
    'openai/gpt-4o': 0.95,
    'anthropic/claude-3.5-sonnet': 0.90,
    'openai/gpt-4o-mini': 0.85,
    'google/gemini-pro-1.5': 0.80
  },
  'business_analysis': {
    'anthropic/claude-3.5-sonnet': 0.92,
    'openai/gpt-4o': 0.88,
    'google/gemini-pro-1.5': 0.85,
    'openai/gpt-4o-mini': 0.80
  },
  'operations': {
    'meta-llama/llama-3-70b-instruct': 0.90,
    'anthropic/claude-3-haiku': 0.88,
    'openai/gpt-4o-mini': 0.85,
    'google/gemini-pro-1.5': 0.80
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

/**
 * Select optimal OpenRouter model based on context
 */
function selectOptimalModel(context) {
  const {
    taskType,
    complexity = 'medium',
    crewMember,
    budgetConstraint = null,
    estimatedTokens = 1500
  } = context;
  
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
  
  return {
    modelId: bestModel[0],
    modelName: selectedModel.name,
    confidence: bestModel[1],
    estimatedCost,
    estimatedTokens,
    costPer1M: selectedModel.costPer1M,
    reasoning: {
      taskType: actualTaskType,
      complexity,
      crewMember,
      affinityScore: affinities[bestModel[0]] || 0.7,
      costEfficiency: selectedModel.costPer1M < 2.0 ? 'high' : selectedModel.costPer1M < 4.0 ? 'medium' : 'low',
      allScores: scores
    }
  };
}

/**
 * Generate OpenRouter API request configuration
 */
function generateOpenRouterRequest(modelSelection, messages, options = {}) {
  const {
    temperature = 0.7,
    maxTokens = null,
    stream = false
  } = options;
  
  return {
    model: modelSelection.modelId,
    messages: messages,
    temperature,
    max_tokens: maxTokens || (modelSelection.estimatedTokens * 1.2), // 20% buffer
    stream
  };
}

/**
 * Estimate cost for a request
 */
function estimateCost(modelId, estimatedTokens) {
  const model = OPENROUTER_MODELS[modelId];
  if (!model) {
    return { error: `Unknown model: ${modelId}` };
  }
  
  const cost = (estimatedTokens / 1000000) * model.costPer1M;
  return {
    modelId,
    modelName: model.name,
    estimatedTokens,
    estimatedCost: cost,
    costPer1M: model.costPer1M
  };
}

module.exports = {
  selectOptimalModel,
  generateOpenRouterRequest,
  estimateCost,
  OPENROUTER_MODELS,
  TASK_AFFINITIES,
  CREW_TASK_TYPES
};

