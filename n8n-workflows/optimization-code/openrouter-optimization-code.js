/**
 * OpenRouter Optimization Code for N8N Workflows
 * 
 * Paste this code into N8N Function/Code nodes before OpenRouter HTTP requests
 * 
 * This code:
 * 1. Analyzes task context (crew member, task type, complexity)
 * 2. Selects optimal OpenRouter model based on cost and performance
 * 3. Generates optimized OpenRouter API request
 */

const { selectOptimalModel, generateOpenRouterRequest } = require('@alex-ai/shared-utilities/openrouter');

// Extract context from workflow data
const inputData = $input.all()[0].json;
const crewMember = inputData.crewMember || inputData.crew_member || 'data';
const taskType = inputData.taskType || inputData.task_type;
const complexity = inputData.complexity || 'medium';
const messages = inputData.messages || [{ role: 'user', content: inputData.prompt || inputData.message }];
const budgetConstraint = inputData.budgetConstraint || inputData.budget_constraint || null;
const estimatedTokens = inputData.estimatedTokens || inputData.estimated_tokens || 1500;

// Select optimal model
const modelSelection = selectOptimalModel({
  taskType,
  complexity,
  crewMember,
  budgetConstraint,
  estimatedTokens
});

// Generate optimized OpenRouter request
const openRouterRequest = generateOpenRouterRequest(modelSelection, messages, {
  temperature: inputData.temperature || 0.7,
  maxTokens: inputData.maxTokens || null
});

// Return optimized configuration
return {
  ...inputData,
  openRouterConfig: {
    model: modelSelection.modelId,
    messages: openRouterRequest.messages,
    temperature: openRouterRequest.temperature,
    max_tokens: openRouterRequest.max_tokens
  },
  optimization: {
    selectedModel: modelSelection.modelName,
    estimatedCost: modelSelection.estimatedCost,
    estimatedTokens: modelSelection.estimatedTokens,
    reasoning: modelSelection.reasoning
  }
};
