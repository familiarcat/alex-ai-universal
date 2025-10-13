/**
 * LCARS - Library Computer (LC) System
 * 
 * The analytical brain of the LCARS system that integrates with the RAG database
 * to provide intelligent data analysis, crew coordination, and LLM optimization.
 * 
 * Core Functions:
 * - Prompt analysis and complexity assessment
 * - Dynamic LLM selection via Open Router
 * - Crew knowledge integration and learning
 * - Performance monitoring and optimization
 * - Cross-project intelligence coordination
 */

import { createClient } from '@supabase/supabase-js'
import { CrewRAGQuery } from './crew-rag-query'
import { CrewKnowledgeCaptureSystem } from './crew-knowledge-capture'

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Open Router Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

interface PromptAnalysis {
  complexity: number // 0-10 scale
  taskType: string // 'strategic' | 'analytical' | 'creative' | 'technical' | 'documentation'
  estimatedTokens: number
  crewMemberOptimal: string
  recommendedModel: string
  reasoning: string
  costEstimate: number
}

interface LLMModel {
  id: string
  name: string
  provider: string
  contextWindow: number
  costPer1kTokens: number
  specialties: string[]
  performanceRating: number // 0-10
}

interface CrewPerformanceMetrics {
  crewMemberId: string
  totalRequests: number
  averageResponseTime: number
  averageCost: number
  modelUsageStats: Record<string, number>
  successRate: number
  lastUpdated: string
}

export class LCARSLibraryComputer {
  private supabase: any
  private ragQuery: CrewRAGQuery
  private knowledgeCapture: CrewKnowledgeCaptureSystem
  private performanceMetrics: Map<string, CrewPerformanceMetrics>
  
  // Available LLM models from Open Router
  private availableModels: LLMModel[] = [
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      contextWindow: 200000,
      costPer1kTokens: 0.003,
      specialties: ['strategic', 'analytical', 'complex_reasoning'],
      performanceRating: 9.5
    },
    {
      id: 'openai/gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      contextWindow: 128000,
      costPer1kTokens: 0.01,
      specialties: ['creative', 'technical', 'general'],
      performanceRating: 9.0
    },
    {
      id: 'google/gemini-pro-1.5',
      name: 'Gemini Pro 1.5',
      provider: 'Google',
      contextWindow: 1000000,
      costPer1kTokens: 0.0005,
      specialties: ['analytical', 'documentation', 'large_context'],
      performanceRating: 8.5
    },
    {
      id: 'meta-llama/llama-3.1-70b-instruct',
      name: 'Llama 3.1 70B',
      provider: 'Meta',
      contextWindow: 8192,
      costPer1kTokens: 0.0003,
      specialties: ['technical', 'documentation', 'cost_effective'],
      performanceRating: 8.0
    },
    {
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'Anthropic',
      contextWindow: 200000,
      costPer1kTokens: 0.00025,
      specialties: ['fast_response', 'documentation', 'simple_tasks'],
      performanceRating: 7.5
    }
  ]

  constructor() {
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey)
    } else {
      console.warn('Supabase credentials not found. Library Computer will operate in offline mode.')
      this.supabase = null
    }
    
    this.ragQuery = new CrewRAGQuery()
    this.knowledgeCapture = new CrewKnowledgeCaptureSystem()
    this.performanceMetrics = new Map()
    
    console.log('🖖 LCARS Library Computer initialized')
    console.log(`   • Available Models: ${this.availableModels.length}`)
    console.log(`   • RAG Integration: ${this.supabase ? 'Active' : 'Offline'}`)
  }

  /**
   * Analyze a prompt and recommend optimal LLM model
   */
  async analyzePrompt(
    prompt: string,
    crewMemberId: string,
    context?: any
  ): Promise<PromptAnalysis> {
    try {
      // 1. Estimate complexity based on prompt characteristics
      const complexity = this.calculateComplexity(prompt, context)
      
      // 2. Determine task type
      const taskType = this.determineTaskType(prompt, crewMemberId)
      
      // 3. Estimate token count
      const estimatedTokens = this.estimateTokenCount(prompt, context)
      
      // 4. Query RAG for similar past requests
      const relevantHistory = await this.getRelevantHistory(crewMemberId, prompt)
      
      // 5. Select optimal model
      const recommendedModel = this.selectOptimalModel(
        complexity,
        taskType,
        estimatedTokens,
        relevantHistory
      )
      
      // 6. Calculate cost estimate
      const model = this.availableModels.find(m => m.id === recommendedModel)!
      const costEstimate = (estimatedTokens / 1000) * model.costPer1kTokens
      
      // 7. Generate reasoning
      const reasoning = this.generateRecommendationReasoning(
        model,
        complexity,
        taskType,
        relevantHistory
      )
      
      return {
        complexity,
        taskType,
        estimatedTokens,
        crewMemberOptimal: crewMemberId,
        recommendedModel,
        reasoning,
        costEstimate
      }
    } catch (error) {
      console.error('Error analyzing prompt:', error)
      // Fallback to default model
      return {
        complexity: 5,
        taskType: 'general',
        estimatedTokens: 1000,
        crewMemberOptimal: crewMemberId,
        recommendedModel: 'anthropic/claude-3-haiku',
        reasoning: 'Fallback to default model due to analysis error',
        costEstimate: 0.00025
      }
    }
  }

  /**
   * Calculate prompt complexity (0-10 scale)
   */
  private calculateComplexity(prompt: string, context?: any): number {
    let complexity = 5 // Base complexity
    
    // Length factor (longer prompts often more complex)
    if (prompt.length > 1000) complexity += 1
    if (prompt.length > 2000) complexity += 1
    
    // Technical keywords
    const technicalKeywords = ['implement', 'architecture', 'algorithm', 'optimize', 'design', 'integrate']
    const technicalCount = technicalKeywords.filter(kw => prompt.toLowerCase().includes(kw)).length
    complexity += technicalCount * 0.5
    
    // Strategic keywords
    const strategicKeywords = ['strategy', 'plan', 'coordinate', 'evaluate', 'decide', 'prioritize']
    const strategicCount = strategicKeywords.filter(kw => prompt.toLowerCase().includes(kw)).length
    complexity += strategicCount * 0.5
    
    // Context complexity
    if (context && Object.keys(context).length > 5) complexity += 1
    
    // Clamp to 0-10
    return Math.min(Math.max(complexity, 0), 10)
  }

  /**
   * Determine task type from prompt and crew member
   */
  private determineTaskType(prompt: string, crewMemberId: string): string {
    const promptLower = prompt.toLowerCase()
    
    // Check for specific task indicators
    if (promptLower.includes('strategy') || promptLower.includes('plan') || promptLower.includes('decide')) {
      return 'strategic'
    }
    if (promptLower.includes('analyze') || promptLower.includes('calculate') || promptLower.includes('metrics')) {
      return 'analytical'
    }
    if (promptLower.includes('design') || promptLower.includes('create') || promptLower.includes('generate')) {
      return 'creative'
    }
    if (promptLower.includes('implement') || promptLower.includes('code') || promptLower.includes('technical')) {
      return 'technical'
    }
    if (promptLower.includes('document') || promptLower.includes('explain') || promptLower.includes('describe')) {
      return 'documentation'
    }
    
    // Fallback based on crew member expertise
    const crewDefaults: Record<string, string> = {
      'captain_picard': 'strategic',
      'commander_data': 'analytical',
      'commander_riker': 'tactical',
      'lieutenant_geordi': 'technical',
      'lieutenant_worf': 'security',
      'counselor_troi': 'creative',
      'dr_crusher': 'analytical',
      'lieutenant_uhura': 'documentation',
      'quark': 'analytical'
    }
    
    return crewDefaults[crewMemberId] || 'general'
  }

  /**
   * Estimate token count for prompt + context
   */
  private estimateTokenCount(prompt: string, context?: any): number {
    // Rough estimation: 1 token ≈ 4 characters
    let tokenCount = Math.ceil(prompt.length / 4)
    
    if (context) {
      const contextStr = JSON.stringify(context)
      tokenCount += Math.ceil(contextStr.length / 4)
    }
    
    // Add buffer for response
    tokenCount = Math.ceil(tokenCount * 1.5)
    
    return tokenCount
  }

  /**
   * Query RAG system for relevant historical context
   */
  private async getRelevantHistory(crewMemberId: string, prompt: string): Promise<any[]> {
    try {
      if (!this.supabase) return []
      
      // Get recent interactions for this crew member
      const interactions = await this.knowledgeCapture.getKnowledgeDevelopment(crewMemberId)
      
      // Filter for relevant ones (simple keyword matching for now)
      const promptKeywords = prompt.toLowerCase().split(' ').filter(w => w.length > 4)
      const relevant = interactions.filter((interaction: any) => {
        const queryLower = interaction.query.toLowerCase()
        return promptKeywords.some(keyword => queryLower.includes(keyword))
      })
      
      return relevant.slice(0, 5) // Top 5 most relevant
    } catch (error) {
      console.error('Error fetching relevant history:', error)
      return []
    }
  }

  /**
   * Select optimal LLM model based on analysis
   */
  private selectOptimalModel(
    complexity: number,
    taskType: string,
    estimatedTokens: number,
    history: any[]
  ): string {
    // Filter models by specialty
    let candidates = this.availableModels.filter(model => 
      model.specialties.includes(taskType) || model.specialties.includes('general')
    )
    
    // If no specialty match, use all models
    if (candidates.length === 0) {
      candidates = this.availableModels
    }
    
    // Score each model
    const scoredModels = candidates.map(model => {
      let score = model.performanceRating
      
      // Complexity matching
      if (complexity > 8 && model.performanceRating > 9) score += 2
      if (complexity < 4 && model.specialties.includes('cost_effective')) score += 2
      
      // Token limit matching
      if (estimatedTokens > model.contextWindow) score -= 10 // Eliminate if too large
      
      // Cost efficiency for simple tasks
      if (complexity < 5 && model.costPer1kTokens < 0.001) score += 1
      
      // Historical performance boost
      if (history.length > 0) {
        const successfulModel = history[0]?.metadata?.model_used
        if (successfulModel === model.id) score += 1
      }
      
      return { model, score }
    })
    
    // Sort by score and select best
    scoredModels.sort((a, b) => b.score - a.score)
    
    return scoredModels[0].model.id
  }

  /**
   * Generate human-readable reasoning for model recommendation
   */
  private generateRecommendationReasoning(
    model: LLMModel,
    complexity: number,
    taskType: string,
    history: any[]
  ): string {
    const reasons: string[] = []
    
    reasons.push(`Selected ${model.name} for ${taskType} task`)
    
    if (complexity > 7) {
      reasons.push(`High complexity (${complexity}/10) requires advanced reasoning`)
    } else if (complexity < 4) {
      reasons.push(`Low complexity (${complexity}/10) allows cost-effective model`)
    }
    
    if (model.specialties.includes(taskType)) {
      reasons.push(`Specialized for ${taskType} tasks`)
    }
    
    if (history.length > 0) {
      reasons.push(`Based on ${history.length} similar past interactions`)
    }
    
    reasons.push(`Cost-efficient at $${model.costPer1kTokens}/1K tokens`)
    
    return reasons.join('. ')
  }

  /**
   * Record performance metrics for learning
   */
  async recordPerformance(
    crewMemberId: string,
    modelUsed: string,
    responseTime: number,
    actualCost: number,
    success: boolean
  ): Promise<void> {
    try {
      // Get existing metrics or create new
      let metrics = this.performanceMetrics.get(crewMemberId) || {
        crewMemberId,
        totalRequests: 0,
        averageResponseTime: 0,
        averageCost: 0,
        modelUsageStats: {},
        successRate: 1.0,
        lastUpdated: new Date().toISOString()
      }
      
      // Update metrics
      metrics.totalRequests += 1
      metrics.averageResponseTime = 
        (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) / metrics.totalRequests
      metrics.averageCost = 
        (metrics.averageCost * (metrics.totalRequests - 1) + actualCost) / metrics.totalRequests
      metrics.modelUsageStats[modelUsed] = (metrics.modelUsageStats[modelUsed] || 0) + 1
      metrics.successRate = 
        (metrics.successRate * (metrics.totalRequests - 1) + (success ? 1 : 0)) / metrics.totalRequests
      metrics.lastUpdated = new Date().toISOString()
      
      this.performanceMetrics.set(crewMemberId, metrics)
      
      // Store in Supabase if available
      if (this.supabase) {
        await this.supabase.from('lcars_performance_metrics').upsert({
          crew_member_id: crewMemberId,
          metrics: metrics,
          updated_at: metrics.lastUpdated
        })
      }
    } catch (error) {
      console.error('Error recording performance:', error)
    }
  }

  /**
   * Get crew performance summary
   */
  getCrewPerformanceSummary(crewMemberId: string): CrewPerformanceMetrics | null {
    return this.performanceMetrics.get(crewMemberId) || null
  }

  /**
   * Get all available models
   */
  getAvailableModels(): LLMModel[] {
    return this.availableModels
  }

  /**
   * Get system status
   */
  getSystemStatus(): any {
    return {
      status: 'operational',
      ragIntegration: this.supabase ? 'active' : 'offline',
      availableModels: this.availableModels.length,
      trackedCrewMembers: this.performanceMetrics.size,
      timestamp: new Date().toISOString()
    }
  }
}

export default LCARSLibraryComputer



