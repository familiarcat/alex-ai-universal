'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  n8nClient, 
  N8NHealthStatus, 
  N8NWorkflow, 
  N8NExecution, 
  N8NApiResponse,
  N8NUtils 
} from '@/lib/n8n-client'

interface N8NContextType {
  // Connection status
  isConnected: boolean
  isInitializing: boolean
  connectionError: string | null

  // Health status
  healthStatus: N8NHealthStatus | null
  lastHealthCheck: Date | null

  // Workflows
  workflows: N8NWorkflow[]
  activeWorkflows: N8NWorkflow[]
  isLoadingWorkflows: boolean

  // Executions
  recentExecutions: N8NExecution[]
  isLoadingExecutions: boolean

  // Statistics
  workflowStats: {
    totalWorkflows: number
    activeWorkflows: number
    totalExecutions: number
    successfulExecutions: number
    failedExecutions: number
    averageExecutionTime: number
  } | null

  // Actions
  initialize: () => Promise<void>
  testConnection: () => Promise<boolean>
  refreshHealthStatus: () => Promise<void>
  refreshWorkflows: () => Promise<void>
  refreshExecutions: () => Promise<void>
  executeWorkflow: (workflowId: string, inputData?: any) => Promise<N8NApiResponse>
  executeCrewCoordination: (request: any) => Promise<N8NApiResponse>
  executeMemorySync: (request: any) => Promise<N8NApiResponse>
  executeEmergencyProtocol: (request: any) => Promise<N8NApiResponse>
  executeCrossPlatformSync: (data: any) => Promise<N8NApiResponse>
  executeOptimization: (data: any) => Promise<N8NApiResponse>

  // Utils
  formatExecutionStatus: (status: string) => { text: string; color: string; icon: string }
  formatHealthStatus: (status: string) => { text: string; color: string; icon: string }
  formatUptime: (seconds: number) => string
  calculateSystemLoad: (cpu: number, memory: number, disk: number) => number
}

const N8NContext = createContext<N8NContextType | undefined>(undefined)

interface N8NProviderProps {
  children: ReactNode
}

export function N8NProvider({ children }: N8NProviderProps) {
  // Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Health status
  const [healthStatus, setHealthStatus] = useState<N8NHealthStatus | null>(null)
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null)

  // Workflows
  const [workflows, setWorkflows] = useState<N8NWorkflow[]>([])
  const [activeWorkflows, setActiveWorkflows] = useState<N8NWorkflow[]>([])
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false)

  // Executions
  const [recentExecutions, setRecentExecutions] = useState<N8NExecution[]>([])
  const [isLoadingExecutions, setIsLoadingExecutions] = useState(false)

  // Statistics
  const [workflowStats, setWorkflowStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageExecutionTime: 0,
  })

  /**
   * Initialize N8N connection
   */
  const initialize = async (): Promise<void> => {
    try {
      setIsInitializing(true)
      setConnectionError(null)

      console.log('🖖 Initializing N8N connection...')
      const connected = await n8nClient.initialize()
      
      if (connected) {
        setIsConnected(true)
        console.log('✅ N8N connection established')
        
        // Load initial data
        await Promise.all([
          refreshHealthStatus(),
          refreshWorkflows(),
          refreshExecutions(),
          loadWorkflowStats()
        ])
      } else {
        setIsConnected(false)
        setConnectionError('N8N server not available - running in offline mode')
        console.warn('⚠️ N8N server not available - running in offline mode')
      }
    } catch (error: any) {
      console.error('N8N initialization error:', error)
      setIsConnected(false)
      setConnectionError(error.message || 'Unknown connection error')
    } finally {
      setIsInitializing(false)
    }
  }

  /**
   * Test N8N connection
   */
  const testConnection = async (): Promise<boolean> => {
    try {
      const connected = await n8nClient.testConnection()
      setIsConnected(connected)
      
      if (!connected) {
        setConnectionError('Connection test failed')
      } else {
        setConnectionError(null)
      }
      
      return connected
    } catch (error: any) {
      console.error('Connection test error:', error)
      setIsConnected(false)
      setConnectionError(error.message)
      return false
    }
  }

  /**
   * Refresh health status
   */
  const refreshHealthStatus = async (): Promise<void> => {
    try {
      const response = await n8nClient.getHealthStatus()
      if (response.success && response.data) {
        setHealthStatus(response.data)
        setLastHealthCheck(new Date())
        setIsConnected(true)
        setConnectionError(null)
      } else {
        console.warn('Failed to get health status:', response.error)
      }
    } catch (error: any) {
      console.error('Health status refresh error:', error)
      setConnectionError(error.message)
    }
  }

  /**
   * Refresh workflows
   */
  const refreshWorkflows = async (): Promise<void> => {
    try {
      setIsLoadingWorkflows(true)
      const response = await n8nClient.getWorkflows()
      
      if (response.success && response.data) {
        setWorkflows(response.data)
        setActiveWorkflows(response.data.filter(w => w.active))
      } else {
        console.warn('Failed to get workflows:', response.error)
      }
    } catch (error: any) {
      console.error('Workflows refresh error:', error)
    } finally {
      setIsLoadingWorkflows(false)
    }
  }

  /**
   * Refresh executions
   */
  const refreshExecutions = async (): Promise<void> => {
    try {
      setIsLoadingExecutions(true)
      const response = await n8nClient.getExecutions()
      
      if (response.success && response.data) {
        setRecentExecutions(response.data)
      } else {
        console.warn('Failed to get executions:', response.error)
      }
    } catch (error: any) {
      console.error('Executions refresh error:', error)
    } finally {
      setIsLoadingExecutions(false)
    }
  }

  /**
   * Load workflow statistics
   */
  const loadWorkflowStats = async (): Promise<void> => {
    try {
      const response = await n8nClient.getWorkflowStats()
      if (response.success && response.data) {
        setWorkflowStats(response.data)
      }
    } catch (error: any) {
      console.error('Workflow stats error:', error)
    }
  }

  /**
   * Execute workflow
   */
  const executeWorkflow = async (
    workflowId: string, 
    inputData?: any
  ): Promise<N8NApiResponse> => {
    try {
      const response = await n8nClient.executeWorkflow(workflowId, inputData)
      
      // Refresh executions after successful execution
      if (response.success) {
        setTimeout(() => refreshExecutions(), 1000)
      }
      
      return response
    } catch (error: any) {
      console.error('Workflow execution error:', error)
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Execute crew coordination workflow
   */
  const executeCrewCoordination = async (request: any): Promise<N8NApiResponse> => {
    try {
      const response = await n8nClient.executeCrewCoordination(request)
      
      if (response.success) {
        setTimeout(() => refreshExecutions(), 1000)
      }
      
      return response
    } catch (error: any) {
      console.error('Crew coordination execution error:', error)
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Execute memory sync workflow
   */
  const executeMemorySync = async (request: any): Promise<N8NApiResponse> => {
    try {
      const response = await n8nClient.executeMemorySync(request)
      
      if (response.success) {
        setTimeout(() => refreshExecutions(), 1000)
      }
      
      return response
    } catch (error: any) {
      console.error('Memory sync execution error:', error)
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Execute emergency protocol workflow
   */
  const executeEmergencyProtocol = async (request: any): Promise<N8NApiResponse> => {
    try {
      const response = await n8nClient.executeEmergencyProtocol(request)
      
      if (response.success) {
        setTimeout(() => refreshExecutions(), 1000)
      }
      
      return response
    } catch (error: any) {
      console.error('Emergency protocol execution error:', error)
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Execute cross-platform sync workflow
   */
  const executeCrossPlatformSync = async (data: any): Promise<N8NApiResponse> => {
    try {
      const response = await n8nClient.executeCrossPlatformSync(data)
      
      if (response.success) {
        setTimeout(() => refreshExecutions(), 1000)
      }
      
      return response
    } catch (error: any) {
      console.error('Cross-platform sync execution error:', error)
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Execute optimization workflow
   */
  const executeOptimization = async (data: any): Promise<N8NApiResponse> => {
    try {
      const response = await n8nClient.executeOptimization(data)
      
      if (response.success) {
        setTimeout(() => refreshExecutions(), 1000)
      }
      
      return response
    } catch (error: any) {
      console.error('Optimization execution error:', error)
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Initialize on mount
  useEffect(() => {
    initialize()
  }, [])

  // Auto-refresh health status every 30 seconds
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      refreshHealthStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [isConnected])

  // Auto-refresh executions every 60 seconds
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      refreshExecutions()
    }, 60000)

    return () => clearInterval(interval)
  }, [isConnected])

  const contextValue: N8NContextType = {
    // Connection status
    isConnected,
    isInitializing,
    connectionError,

    // Health status
    healthStatus,
    lastHealthCheck,

    // Workflows
    workflows,
    activeWorkflows,
    isLoadingWorkflows,

    // Executions
    recentExecutions,
    isLoadingExecutions,

    // Statistics
    workflowStats,

    // Actions
    initialize,
    testConnection,
    refreshHealthStatus,
    refreshWorkflows,
    refreshExecutions,
    executeWorkflow,
    executeCrewCoordination,
    executeMemorySync,
    executeEmergencyProtocol,
    executeCrossPlatformSync,
    executeOptimization,

    // Utils
    formatExecutionStatus: N8NUtils.formatExecutionStatus,
    formatHealthStatus: N8NUtils.formatHealthStatus,
    formatUptime: N8NUtils.formatUptime,
    calculateSystemLoad: N8NUtils.calculateSystemLoad,
  }

  return (
    <N8NContext.Provider value={contextValue}>
      {children}
    </N8NContext.Provider>
  )
}

/**
 * Hook to use N8N context
 */
export function useN8N(): N8NContextType {
  const context = useContext(N8NContext)
  if (context === undefined) {
    throw new Error('useN8N must be used within an N8NProvider')
  }
  return context
}

export default N8NProvider


