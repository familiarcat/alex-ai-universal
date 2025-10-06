/**
 * N8N Client Library for Alex AI Universal
 * 
 * This library provides comprehensive integration with the N8N server
 * for real-time workflow execution, crew coordination, and system monitoring.
 */

// Environment configuration
const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_BASE_URL || 'https://n8n.pbradygeorgen.com'
const N8N_API_KEY = process.env.NEXT_PUBLIC_N8N_API_KEY || ''

// Types
export interface N8NWorkflow {
  id: string
  name: string
  active: boolean
  nodes: any[]
  connections: any
  settings: any
  createdAt: string
  updatedAt: string
}

export interface N8NExecution {
  id: string
  workflowId: string
  status: 'running' | 'success' | 'error' | 'waiting'
  startedAt: string
  finishedAt?: string
  data: any
  mode: 'manual' | 'trigger'
}

export interface N8NHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  uptime: number
  activeWorkflows: number
  totalExecutions: number
  lastExecution: string
  systemLoad: {
    cpu: number
    memory: number
    disk: number
  }
}

export interface CrewCoordinationRequest {
  message: string
  crewMembers: string[]
  platform: string
  sessionId: string
  context: any
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface MemorySyncRequest {
  memories: any[]
  platform: string
  syncType: 'incremental' | 'full' | 'emergency'
  crewMembers: string[]
}

export interface EmergencyProtocolRequest {
  emergencyType: 'infinite_loop' | 'unresponsive' | 'performance_degradation' | 'security_breach'
  affectedCrewMember: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  context: any
  backupCrewMember?: string
}

export interface N8NApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

/**
 * N8N Client Class
 */
export class N8NClient {
  private baseUrl: string
  private apiKey: string
  private isConnected: boolean = false

  constructor(baseUrl: string = N8N_BASE_URL, apiKey: string = N8N_API_KEY) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  /**
   * Initialize connection and verify N8N server accessibility
   */
  async initialize(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/api/v1/health')
      this.isConnected = response.success
      return this.isConnected
    } catch (error) {
      console.error('Failed to initialize N8N connection:', error)
      this.isConnected = false
      return false
    }
  }

  /**
   * Make authenticated HTTP request to N8N API
   */
  private async makeRequest<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<N8NApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': this.apiKey,
      'User-Agent': 'Alex-AI-Universal/1.0',
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, requestOptions)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Get N8N server health status
   */
  async getHealthStatus(): Promise<N8NApiResponse<N8NHealthStatus>> {
    return this.makeRequest<N8NHealthStatus>('/api/v1/health')
  }

  /**
   * List all workflows
   */
  async getWorkflows(): Promise<N8NApiResponse<N8NWorkflow[]>> {
    return this.makeRequest<N8NWorkflow[]>('/api/v1/workflows')
  }

  /**
   * Get specific workflow
   */
  async getWorkflow(workflowId: string): Promise<N8NApiResponse<N8NWorkflow>> {
    return this.makeRequest<N8NWorkflow>(`/api/v1/workflows/${workflowId}`)
  }

  /**
   * Execute workflow manually
   */
  async executeWorkflow(
    workflowId: string, 
    inputData: any = {}
  ): Promise<N8NApiResponse<N8NExecution>> {
    return this.makeRequest<N8NExecution>(`/api/v1/workflows/${workflowId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ inputData }),
    })
  }

  /**
   * Get workflow executions
   */
  async getExecutions(
    workflowId?: string, 
    limit: number = 50
  ): Promise<N8NApiResponse<N8NExecution[]>> {
    const params = new URLSearchParams()
    if (workflowId) params.append('workflowId', workflowId)
    params.append('limit', limit.toString())
    
    return this.makeRequest<N8NExecution[]>(`/api/v1/executions?${params}`)
  }

  /**
   * Execute crew coordination workflow
   */
  async executeCrewCoordination(request: CrewCoordinationRequest): Promise<N8NApiResponse> {
    return this.makeRequest('/api/v1/workflows/crew-coordination/execute', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  /**
   * Execute memory sync workflow
   */
  async executeMemorySync(request: MemorySyncRequest): Promise<N8NApiResponse> {
    return this.makeRequest('/api/v1/workflows/memory-sync/execute', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  /**
   * Execute emergency protocol workflow
   */
  async executeEmergencyProtocol(request: EmergencyProtocolRequest): Promise<N8NApiResponse> {
    return this.makeRequest('/api/v1/workflows/emergency-protocols/execute', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  /**
   * Execute cross-platform sync workflow
   */
  async executeCrossPlatformSync(data: {
    platforms: string[]
    syncType: string
    timestamp: Date
    data: any
  }): Promise<N8NApiResponse> {
    return this.makeRequest('/api/v1/workflows/cross-platform-sync/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Execute optimization workflow
   */
  async executeOptimization(data: {
    message: string
    platform: string
    sessionId: string
    resourceUsage: any
  }): Promise<N8NApiResponse> {
    return this.makeRequest('/api/v1/workflows/optimization/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Get connection status
   */
  isServerConnected(): boolean {
    return this.isConnected
  }

  /**
   * Test connection to N8N server
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.getHealthStatus()
      this.isConnected = response.success
      return response.success
    } catch (error) {
      console.error('N8N connection test failed:', error)
      this.isConnected = false
      return false
    }
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(): Promise<N8NApiResponse<{
    totalWorkflows: number
    activeWorkflows: number
    totalExecutions: number
    successfulExecutions: number
    failedExecutions: number
    averageExecutionTime: number
  }>> {
    return this.makeRequest('/api/v1/workflows/stats')
  }

  /**
   * Create or update workflow
   */
  async upsertWorkflow(workflow: Partial<N8NWorkflow>): Promise<N8NApiResponse<N8NWorkflow>> {
    const method = workflow.id ? 'PUT' : 'POST'
    const endpoint = workflow.id 
      ? `/api/v1/workflows/${workflow.id}`
      : '/api/v1/workflows'

    return this.makeRequest<N8NWorkflow>(endpoint, {
      method,
      body: JSON.stringify(workflow),
    })
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string): Promise<N8NApiResponse> {
    return this.makeRequest(`/api/v1/workflows/${workflowId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Get real-time execution updates via polling
   */
  async pollExecution(executionId: string): Promise<N8NApiResponse<N8NExecution>> {
    return this.makeRequest<N8NExecution>(`/api/v1/executions/${executionId}`)
  }
}

/**
 * Singleton instance for global use
 */
export const n8nClient = new N8NClient()

/**
 * Utility functions
 */
export const N8NUtils = {
  /**
   * Format execution status for display
   */
  formatExecutionStatus: (status: string): { text: string; color: string; icon: string } => {
    switch (status) {
      case 'running':
        return { text: 'Running', color: 'blue', icon: '🔄' }
      case 'success':
        return { text: 'Success', color: 'green', icon: '✅' }
      case 'error':
        return { text: 'Error', color: 'red', icon: '❌' }
      case 'waiting':
        return { text: 'Waiting', color: 'yellow', icon: '⏳' }
      default:
        return { text: 'Unknown', color: 'gray', icon: '❓' }
    }
  },

  /**
   * Format health status for display
   */
  formatHealthStatus: (status: string): { text: string; color: string; icon: string } => {
    switch (status) {
      case 'healthy':
        return { text: 'Healthy', color: 'green', icon: '✅' }
      case 'degraded':
        return { text: 'Degraded', color: 'yellow', icon: '⚠️' }
      case 'unhealthy':
        return { text: 'Unhealthy', color: 'red', icon: '❌' }
      default:
        return { text: 'Unknown', color: 'gray', icon: '❓' }
    }
  },

  /**
   * Calculate system load percentage
   */
  calculateSystemLoad: (cpu: number, memory: number, disk: number): number => {
    return Math.round((cpu + memory + disk) / 3)
  },

  /**
   * Format uptime for display
   */
  formatUptime: (seconds: number): string => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  },
}

export default n8nClient


