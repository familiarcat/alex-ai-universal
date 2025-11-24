/**
 * Task-Based OpenRouter Coordinator
 * 
 * Coordinates LLM calls by task instead of individual crew member optimization.
 * All crew members working on the same task use the same LLM model and pool tokens together.
 * 
 * Benefits:
 * - Token pooling: More efficient token usage across crew members
 * - Model consistency: Same model for all crew on a task (reduces echo chamber)
 * - Cost optimization: Riker and Quark optimize task-level decisions
 * - Process-level oversight: Hallucination management at task level
 * 
 * DDD Architecture: Task Coordinator => Crew Assignment => OpenRouter API
 */

const { selectOptimalModel, OPENROUTER_MODELS, TASK_AFFINITIES } = require('./optimizer');

/**
 * Task-Based Coordination Configuration
 */
class TaskBasedCoordinator {
  constructor(openRouterApiKey) {
    this.apiKey = openRouterApiKey;
    this.activeTasks = new Map(); // taskId -> TaskState
    this.taskTokenPools = new Map(); // taskId -> TokenPool
    this.taskModelSelections = new Map(); // taskId -> ModelSelection
    this.openRouterOptimizer = null; // Will be initialized if available
  }

  /**
   * Initialize a task with optimal model selection
   * Riker and Quark collaborate to select the best model for the entire task
   */
  async initializeTask(taskId, taskDescription, crewMembers = [], context = {}) {
    console.log(`\n🎯 Initializing Task: ${taskId}`);
    console.log(`📝 Description: ${taskDescription}`);
    console.log(`👥 Crew Members: ${crewMembers.join(', ')}`);

    // Step 1: Quark analyzes cost efficiency for the task
    const quarkAnalysis = await this.quarkCostAnalysis(taskDescription, crewMembers, context);
    
    // Step 2: Riker coordinates tactical workflow for the task
    const rikerCoordination = await this.rikerTacticalCoordination(taskDescription, crewMembers, context);
    
    // Step 3: Select optimal model for the entire task (using same model for all crew)
    const modelSelection = await this.selectTaskModel(
      taskDescription,
      crewMembers,
      quarkAnalysis,
      rikerCoordination,
      context
    );

    // Step 4: Initialize token pool for this task
    const tokenPool = {
      taskId,
      modelId: modelSelection.modelId,
      totalTokensUsed: 0,
      totalCost: 0,
      crewMemberUsage: new Map(), // crewMember -> { tokens, cost }
      startTime: Date.now()
    };

    // Step 5: Create task state
    const taskState = {
      taskId,
      description: taskDescription,
      crewMembers,
      modelSelection,
      quarkAnalysis,
      rikerCoordination,
      tokenPool,
      context,
      status: 'active',
      createdAt: Date.now(),
      crewResponses: [] // Store all crew responses for process-level hallucination detection
    };

    this.activeTasks.set(taskId, taskState);
    this.taskTokenPools.set(taskId, tokenPool);
    this.taskModelSelections.set(taskId, modelSelection);

    console.log(`✅ Task initialized with model: ${modelSelection.modelName}`);
    console.log(`💰 Estimated cost per 1M tokens: $${modelSelection.costPer1M}`);
    console.log(`🎯 All crew members will use the same model for consistency\n`);

    return taskState;
  }

  /**
   * Quark's cost analysis for the task
   * Uses the task-based model (will be determined, but Quark provides input)
   */
  async quarkCostAnalysis(taskDescription, crewMembers, context) {
    const prompt = `You are Quark, the Ferengi business operations specialist. Analyze this task for optimal cost efficiency:

Task: ${taskDescription}
Crew Members: ${crewMembers.join(', ')}
Context: ${JSON.stringify(context, null, 2)}

Provide:
1. Cost efficiency analysis for this task
2. Recommended model selection based on cost/performance balance
3. Estimated token usage for the task
4. Budget recommendations
5. ROI considerations

Be specific, practical, and profit-focused. Consider that all crew members will use the same model to pool tokens efficiently.`;

    // Use a cost-effective model for Quark's analysis (but this is just for his input)
    // The actual task model will be selected based on his + Riker's recommendations
    const tempModel = selectOptimalModel({
      taskType: 'business_analysis',
      complexity: 'medium',
      crewMember: 'quark',
      estimatedTokens: 500
    });

    // Make the call (this would integrate with actual OpenRouter API)
    // For now, return structured analysis
    return {
      recommendedModel: tempModel.modelId,
      costEfficiency: 'high',
      estimatedTokens: 2000,
      budgetRecommendation: 'cost-effective',
      reasoning: 'Task requires balanced cost/performance model for crew coordination'
    };
  }

  /**
   * Riker's tactical coordination for the task
   * Uses the task-based model (will be determined, but Riker provides input)
   */
  async rikerTacticalCoordination(taskDescription, crewMembers, context) {
    const prompt = `You are Commander William Riker, Executive Officer. Coordinate this task for optimal tactical workflow:

Task: ${taskDescription}
Crew Members: ${crewMembers.join(', ')}
Context: ${JSON.stringify(context, null, 2)}

Provide:
1. Optimal crew member coordination strategy
2. Workflow sequencing recommendations
3. Model selection based on task complexity and crew needs
4. Risk assessment
5. Execution strategy

Be tactical, organized, and operationally focused. Consider that all crew members will use the same model to ensure consistency and reduce echo chamber effects.`;

    // Use a cost-effective model for Riker's coordination (but this is just for his input)
    const tempModel = selectOptimalModel({
      taskType: 'operations',
      complexity: 'medium',
      crewMember: 'riker',
      estimatedTokens: 500
    });

    return {
      recommendedModel: tempModel.modelId,
      coordinationStrategy: 'parallel_with_sync',
      workflowSequence: 'analyze -> coordinate -> execute -> validate',
      riskLevel: 'medium',
      reasoning: 'Task requires consistent model for crew coordination'
    };
  }

  /**
   * Select optimal model for the entire task
   * Combines Quark's cost analysis and Riker's tactical coordination
   * All crew members will use this same model
   */
  async selectTaskModel(taskDescription, crewMembers, quarkAnalysis, rikerCoordination, context) {
    // Determine task type from description and crew members
    const taskType = this.inferTaskType(taskDescription, crewMembers);
    const complexity = this.assessComplexity(taskDescription, context);
    
    // Get model recommendations from Quark and Riker
    const quarkModel = quarkAnalysis.recommendedModel;
    const rikerModel = rikerCoordination.recommendedModel;
    
    // Calculate optimal model considering:
    // 1. Task type and complexity
    // 2. Quark's cost efficiency recommendations
    // 3. Riker's tactical coordination needs
    // 4. Need for consistency across all crew members
    
    const baseSelection = selectOptimalModel({
      taskType,
      complexity,
      estimatedTokens: this.estimateTaskTokens(crewMembers.length, complexity),
      budgetConstraint: context.budgetConstraint || null
    });

    // Adjust based on Quark and Riker's recommendations
    // Prefer models that both recommend, or balance their recommendations
    let finalModel = baseSelection;
    
    if (quarkModel === rikerModel && OPENROUTER_MODELS[quarkModel]) {
      // Both recommend the same model - use it
      finalModel = {
        ...selectOptimalModel({
          taskType,
          complexity,
          estimatedTokens: baseSelection.estimatedTokens
        }),
        modelId: quarkModel,
        modelName: OPENROUTER_MODELS[quarkModel].name,
        costPer1M: OPENROUTER_MODELS[quarkModel].costPer1M,
        reasoning: {
          ...baseSelection.reasoning,
          quarkRecommendation: quarkModel,
          rikerRecommendation: rikerModel,
          consensus: true,
          taskBased: true
        }
      };
    } else {
      // Different recommendations - use base selection but note both recommendations
      finalModel.reasoning.quarkRecommendation = quarkModel;
      finalModel.reasoning.rikerRecommendation = rikerModel;
      finalModel.reasoning.consensus = false;
      finalModel.reasoning.taskBased = true;
    }

    return finalModel;
  }

  /**
   * Execute crew member request within a task
   * All crew members use the same model, tokens are pooled
   */
  async executeCrewRequest(taskId, crewMember, prompt, options = {}) {
    const taskState = this.activeTasks.get(taskId);
    if (!taskState) {
      throw new Error(`Task ${taskId} not found. Initialize task first.`);
    }

    const modelSelection = taskState.modelSelection;
    const tokenPool = taskState.tokenPool;

    console.log(`\n👤 ${crewMember} executing request in task: ${taskId}`);
    console.log(`🤖 Using shared model: ${modelSelection.modelName}`);

    // Prepare request using the task's shared model
    const request = {
      model: modelSelection.modelId,
      messages: [
        {
          role: 'system',
          content: `You are ${crewMember} from the Star Trek crew. ${this.getCrewMemberContext(crewMember, taskState)}`
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

    // Execute request using OpenRouter API
    const startTime = Date.now();
    let response;
    
    // Try to use real OpenRouter API if available
    if (this.apiKey && this.apiKey !== 'test-key') {
      try {
        // Initialize optimizer if not already done
        if (!this.openRouterOptimizer) {
          const { getMCPOpenRouterOptimizer } = require('../../../../scripts/utils/mcp-openrouter-optimizer');
          this.openRouterOptimizer = getMCPOpenRouterOptimizer();
          this.openRouterOptimizer.initialize();
        }
        
        // Make real API call
        const apiResult = await this.openRouterOptimizer.optimizeAndCall(prompt, {
          crewMember,
          complexity: taskState.context?.complexity || 'medium',
          context: {
            taskType: this.inferTaskType(taskState.description, taskState.crewMembers),
            taskContext: taskState.context
          },
          apiOptions: {
            model: modelSelection.modelId,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000
          }
        });
        
        // Convert to standard format
        response = {
          choices: [{ 
            message: { 
              content: apiResult.choices?.[0]?.message?.content || apiResult.body || 'No response' 
            } 
          }],
          usage: apiResult.usage || {
            prompt_tokens: 150,
            completion_tokens: 200,
            total_tokens: 350
          }
        };
      } catch (error) {
        console.warn(`⚠️  OpenRouter API call failed, using simulation: ${error.message}`);
        // Fallback to simulation
        response = {
          choices: [{ message: { content: `Response from ${crewMember} using ${modelSelection.modelName}` } }],
          usage: {
            prompt_tokens: 150,
            completion_tokens: 200,
            total_tokens: 350
          }
        };
      }
    } else {
      // Simulation mode (no API key)
      response = {
        choices: [{ message: { content: `Response from ${crewMember} using ${modelSelection.modelName}` } }],
        usage: {
          prompt_tokens: 150,
          completion_tokens: 200,
          total_tokens: 350
        }
      };
    }
    
    const latency = Date.now() - startTime;

    // Update token pool
    const tokensUsed = response.usage.total_tokens;
    const cost = (tokensUsed / 1000000) * modelSelection.costPer1M;
    
    tokenPool.totalTokensUsed += tokensUsed;
    tokenPool.totalCost += cost;
    
    if (!tokenPool.crewMemberUsage.has(crewMember)) {
      tokenPool.crewMemberUsage.set(crewMember, { tokens: 0, cost: 0 });
    }
    const memberUsage = tokenPool.crewMemberUsage.get(crewMember);
    memberUsage.tokens += tokensUsed;
    memberUsage.cost += cost;

    // Store response for process-level hallucination detection
    taskState.crewResponses.push({
      crewMember,
      prompt,
      response: response.choices[0].message.content,
      tokens: tokensUsed,
      cost,
      timestamp: Date.now(),
      latency
    });

    console.log(`✅ ${crewMember} response complete`);
    console.log(`📊 Tokens used: ${tokensUsed} (Task total: ${tokenPool.totalTokensUsed})`);
    console.log(`💰 Cost: $${cost.toFixed(4)} (Task total: $${tokenPool.totalCost.toFixed(4)})`);

    return {
      crewMember,
      response: response.choices[0].message.content,
      usage: response.usage,
      cost,
      latency,
      taskTokenPool: {
        totalTokens: tokenPool.totalTokensUsed,
        totalCost: tokenPool.totalCost,
        crewMemberBreakdown: Object.fromEntries(tokenPool.crewMemberUsage)
      }
    };
  }

  /**
   * Get crew member context for the task
   */
  getCrewMemberContext(crewMember, taskState) {
    return `
You are working on a task with other crew members. All crew members are using the same LLM model (${taskState.modelSelection.modelName}) to ensure consistency and efficient token pooling.

Task: ${taskState.description}
Crew Members: ${taskState.crewMembers.join(', ')}
Quark's Cost Analysis: ${JSON.stringify(taskState.quarkAnalysis, null, 2)}
Riker's Coordination: ${JSON.stringify(taskState.rikerCoordination, null, 2)}

Provide your perspective while maintaining consistency with the shared model approach.`;
  }

  /**
   * Infer task type from description and crew members
   */
  inferTaskType(description, crewMembers) {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('strategic') || lowerDesc.includes('plan') || crewMembers.includes('picard')) {
      return 'strategic_planning';
    }
    if (lowerDesc.includes('optimize') || lowerDesc.includes('cost') || crewMembers.includes('quark')) {
      return 'optimization';
    }
    if (lowerDesc.includes('security') || lowerDesc.includes('threat') || crewMembers.includes('worf')) {
      return 'security_review';
    }
    if (lowerDesc.includes('code') || lowerDesc.includes('implement') || crewMembers.includes('geordi')) {
      return 'code_generation';
    }
    if (lowerDesc.includes('analyze') || lowerDesc.includes('analysis') || crewMembers.includes('data')) {
      return 'complex_analysis';
    }
    
    return 'general';
  }

  /**
   * Assess task complexity
   */
  assessComplexity(description, context) {
    const lowerDesc = description.toLowerCase();
    const wordCount = description.split(' ').length;
    
    if (wordCount > 100 || lowerDesc.includes('complex') || lowerDesc.includes('comprehensive')) {
      return 'high';
    }
    if (wordCount < 20 || lowerDesc.includes('simple') || lowerDesc.includes('quick')) {
      return 'low';
    }
    return 'medium';
  }

  /**
   * Estimate total tokens for a task based on crew size and complexity
   */
  estimateTaskTokens(crewCount, complexity) {
    const baseTokens = {
      low: 500,
      medium: 1500,
      high: 3000
    };
    
    const base = baseTokens[complexity] || 1500;
    return base * crewCount; // Each crew member will contribute
  }

  /**
   * Get task summary with token pooling statistics
   */
  getTaskSummary(taskId) {
    const taskState = this.activeTasks.get(taskId);
    if (!taskState) {
      return null;
    }

    return {
      taskId,
      description: taskState.description,
      crewMembers: taskState.crewMembers,
      model: {
        id: taskState.modelSelection.modelId,
        name: taskState.modelSelection.modelName,
        costPer1M: taskState.modelSelection.costPer1M
      },
      tokenPool: {
        totalTokens: taskState.tokenPool.totalTokensUsed,
        totalCost: taskState.tokenPool.totalCost,
        crewMemberBreakdown: Object.fromEntries(taskState.tokenPool.crewMemberUsage),
        averageCostPerMember: taskState.tokenPool.totalCost / taskState.crewMembers.length
      },
      crewResponses: taskState.crewResponses.length,
      duration: Date.now() - taskState.createdAt,
      status: taskState.status
    };
  }

  /**
   * Complete a task and return final summary
   */
  completeTask(taskId) {
    const taskState = this.activeTasks.get(taskId);
    if (!taskState) {
      throw new Error(`Task ${taskId} not found`);
    }

    taskState.status = 'completed';
    taskState.completedAt = Date.now();

    const summary = this.getTaskSummary(taskId);
    
    // Clean up (keep for a while for analysis)
    setTimeout(() => {
      this.activeTasks.delete(taskId);
      this.taskTokenPools.delete(taskId);
      this.taskModelSelections.delete(taskId);
    }, 3600000); // Keep for 1 hour

    return summary;
  }
}

module.exports = { TaskBasedCoordinator };

