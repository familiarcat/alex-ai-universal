'use client'

import { useState, useEffect } from 'react'
import { useN8N } from '@/contexts/N8NContext'
import { ContrastCard, ContrastText, ContrastButton } from '@/components/ContrastAware'
import { N8NExecution, N8NWorkflow } from '@/lib/n8n-client'

export default function N8NIntegration() {
  const {
    isConnected,
    isInitializing,
    connectionError,
    healthStatus,
    workflows,
    activeWorkflows,
    recentExecutions,
    isLoadingWorkflows,
    isLoadingExecutions,
    workflowStats,
    initialize,
    testConnection,
    refreshHealthStatus,
    refreshWorkflows,
    refreshExecutions,
    executeWorkflow,
    executeCrewCoordination,
    executeMemorySync,
    executeEmergencyProtocol,
    formatExecutionStatus,
    formatHealthStatus,
    formatUptime
  } = useN8N()

  const [selectedWorkflow, setSelectedWorkflow] = useState<N8NWorkflow | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<any>(null)

  // Initialize on mount
  useEffect(() => {
    if (!isConnected && !isInitializing) {
      initialize()
    }
  }, [isConnected, isInitializing, initialize])

  const handleExecuteWorkflow = async (workflowId: string) => {
    setIsExecuting(true)
    setExecutionResult(null)
    
    try {
      const result = await executeWorkflow(workflowId, {
        message: 'Test execution from Alex AI Universal',
        timestamp: new Date().toISOString(),
        source: 'nextjs-demo'
      })
      
      setExecutionResult(result)
      
      // Refresh executions to show the new one
      setTimeout(() => refreshExecutions(), 1000)
    } catch (error) {
      console.error('Workflow execution failed:', error)
      setExecutionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const handleExecuteCrewCoordination = async () => {
    setIsExecuting(true)
    setExecutionResult(null)
    
    try {
      const result = await executeCrewCoordination({
        message: 'Test crew coordination from Alex AI Universal',
        crewMembers: ['Captain Picard', 'Commander Data', 'Commander Riker'],
        platform: 'nextjs-demo',
        sessionId: `session-${Date.now()}`,
        context: { timestamp: new Date().toISOString() },
        priority: 'medium'
      })
      
      setExecutionResult(result)
    } catch (error) {
      console.error('Crew coordination execution failed:', error)
      setExecutionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const handleExecuteMemorySync = async () => {
    setIsExecuting(true)
    setExecutionResult(null)
    
    try {
      const result = await executeMemorySync({
        memories: [
          { id: 'test-1', content: 'Test memory sync from Alex AI Universal', timestamp: new Date().toISOString() }
        ],
        platform: 'nextjs-demo',
        syncType: 'incremental',
        crewMembers: ['Captain Picard', 'Commander Data']
      })
      
      setExecutionResult(result)
    } catch (error) {
      console.error('Memory sync execution failed:', error)
      setExecutionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const handleExecuteEmergencyProtocol = async () => {
    setIsExecuting(true)
    setExecutionResult(null)
    
    try {
      const result = await executeEmergencyProtocol({
        emergencyType: 'performance_degradation',
        affectedCrewMember: 'Commander Data',
        severity: 'medium',
        context: { timestamp: new Date().toISOString(), source: 'test' },
        backupCrewMember: 'Captain Picard'
      })
      
      setExecutionResult(result)
    } catch (error) {
      console.error('Emergency protocol execution failed:', error)
      setExecutionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-theme-accent mb-4">
          🖖 N8N Integration Dashboard
        </h1>
        <p className="text-xl text-theme-enhancements">
          Real-time workflow management and system integration
        </p>
      </div>

      {/* Connection Status */}
      <ContrastCard variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-theme-accent">Connection Status</h2>
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-theme-role' : 'bg-red-400'}`}></div>
            <span className={`font-bold ${isConnected ? 'text-theme-role' : 'text-red-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        {connectionError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">
              <strong>Connection Error:</strong> {connectionError}
            </p>
          </div>
        )}
        
        <div className="flex space-x-4">
          <ContrastButton
            onClick={testConnection}
            disabled={isInitializing}
            variant="component"
          >
            {isInitializing ? 'Testing...' : 'Test Connection'}
          </ContrastButton>
          
          <ContrastButton
            onClick={refreshHealthStatus}
            disabled={isInitializing}
            variant="role"
          >
            Refresh Health
          </ContrastButton>
        </div>
      </ContrastCard>

      {/* Health Status */}
      {healthStatus && (
        <ContrastCard variant="elevated">
          <h2 className="text-2xl font-bold text-theme-accent mb-6">🖖 N8N Server Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                formatHealthStatus(healthStatus.status).color === 'green' ? 'text-theme-role' :
                formatHealthStatus(healthStatus.status).color === 'yellow' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {formatHealthStatus(healthStatus.status).text}
              </div>
              <div className="text-theme-enhancements">Server Status</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-theme-component mb-2">
                {formatUptime(healthStatus.uptime)}
              </div>
              <div className="text-theme-enhancements">Uptime</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-theme-accent mb-2">
                v{healthStatus.version}
              </div>
              <div className="text-theme-enhancements">Version</div>
            </div>
          </div>
        </ContrastCard>
      )}

      {/* Workflow Statistics */}
      {workflowStats && (
        <ContrastCard variant="elevated">
          <h2 className="text-2xl font-bold text-theme-accent mb-6">Workflow Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-component">{workflowStats.totalWorkflows}</div>
              <div className="text-theme-enhancements">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-role">{workflowStats.activeWorkflows}</div>
              <div className="text-theme-enhancements">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-accent">{workflowStats.totalExecutions}</div>
              <div className="text-theme-enhancements">Executions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-role">{workflowStats.successfulExecutions}</div>
              <div className="text-theme-enhancements">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{workflowStats.failedExecutions}</div>
              <div className="text-theme-enhancements">Failed</div>
            </div>
          </div>
        </ContrastCard>
      )}

      {/* Workflow Management */}
      <ContrastCard variant="elevated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-theme-accent">Workflow Management</h2>
          <ContrastButton
            onClick={refreshWorkflows}
            disabled={isLoadingWorkflows}
            variant="component"
          >
            {isLoadingWorkflows ? 'Loading...' : 'Refresh Workflows'}
          </ContrastButton>
        </div>

        {workflows.length === 0 ? (
          <p className="text-theme-enhancements text-center py-8">
            {isLoadingWorkflows ? 'Loading workflows...' : 'No workflows found'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedWorkflow?.id === workflow.id
                    ? 'border-theme-component bg-theme-component/10'
                    : 'border-theme-accent/20 hover:border-theme-accent/40'
                }`}
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-theme-accent">{workflow.name}</h3>
                  <div className={`w-2 h-2 rounded-full ${workflow.active ? 'bg-theme-role' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-sm text-theme-enhancements mb-3">
                  {workflow.active ? 'Active' : 'Inactive'} • {workflow.nodes.length} nodes
                </p>
                <ContrastButton
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExecuteWorkflow(workflow.id)
                  }}
                  disabled={isExecuting || !workflow.active}
                  variant="role"
                  className="w-full text-sm"
                >
                  {isExecuting ? 'Executing...' : 'Execute'}
                </ContrastButton>
              </div>
            ))}
          </div>
        )}
      </ContrastCard>

      {/* Alex AI Specific Workflows */}
      <ContrastCard variant="elevated">
        <h2 className="text-2xl font-bold text-theme-accent mb-6">🖖 Alex AI Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-theme-secondary/20 rounded-lg">
            <h3 className="text-lg font-bold text-theme-accent mb-3">Crew Coordination</h3>
            <p className="text-theme-enhancements text-sm mb-4">
              Coordinate crew members for task execution and collaboration
            </p>
            <ContrastButton
              onClick={handleExecuteCrewCoordination}
              disabled={isExecuting || !isConnected}
              variant="component"
              className="w-full"
            >
              {isExecuting ? 'Executing...' : 'Execute Crew Coordination'}
            </ContrastButton>
          </div>

          <div className="p-4 bg-theme-secondary/20 rounded-lg">
            <h3 className="text-lg font-bold text-theme-accent mb-3">Memory Sync</h3>
            <p className="text-theme-enhancements text-sm mb-4">
              Synchronize RAG memories across crew members and platforms
            </p>
            <ContrastButton
              onClick={handleExecuteMemorySync}
              disabled={isExecuting || !isConnected}
              variant="role"
              className="w-full"
            >
              {isExecuting ? 'Executing...' : 'Execute Memory Sync'}
            </ContrastButton>
          </div>

          <div className="p-4 bg-theme-secondary/20 rounded-lg">
            <h3 className="text-lg font-bold text-theme-accent mb-3">Emergency Protocols</h3>
            <p className="text-theme-enhancements text-sm mb-4">
              Execute emergency protocols for crew member failures
            </p>
            <ContrastButton
              onClick={handleExecuteEmergencyProtocol}
              disabled={isExecuting || !isConnected}
              variant="enhancements"
              className="w-full"
            >
              {isExecuting ? 'Executing...' : 'Execute Emergency Protocol'}
            </ContrastButton>
          </div>

          <div className="p-4 bg-theme-secondary/20 rounded-lg">
            <h3 className="text-lg font-bold text-theme-accent mb-3">System Status</h3>
            <p className="text-theme-enhancements text-sm mb-4">
              Current system status and connection information
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-theme-enhancements">N8N Connected:</span>
                <span className={`font-bold ${isConnected ? 'text-theme-role' : 'text-red-400'}`}>
                  {isConnected ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-enhancements">Active Workflows:</span>
                <span className="text-theme-accent">{activeWorkflows.length}</span>
              </div>
            </div>
          </div>
        </div>
      </ContrastCard>

      {/* Recent Executions */}
      <ContrastCard variant="elevated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-theme-accent">Recent Executions</h2>
          <ContrastButton
            onClick={refreshExecutions}
            disabled={isLoadingExecutions}
            variant="component"
          >
            {isLoadingExecutions ? 'Loading...' : 'Refresh'}
          </ContrastButton>
        </div>

        {recentExecutions.length === 0 ? (
          <p className="text-theme-enhancements text-center py-8">
            {isLoadingExecutions ? 'Loading executions...' : 'No recent executions'}
          </p>
        ) : (
          <div className="space-y-4">
            {recentExecutions.slice(0, 10).map((execution) => {
              const status = formatExecutionStatus(execution.status)
              return (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-4 bg-theme-secondary/20 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{status.icon}</span>
                    <div>
                      <div className="text-theme-accent font-medium">
                        Workflow: {execution.workflowId}
                      </div>
                      <div className="text-sm text-theme-enhancements">
                        {new Date(execution.startedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      status.color === 'green' ? 'text-theme-role' :
                      status.color === 'yellow' ? 'text-yellow-400' :
                      status.color === 'red' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {status.text}
                    </div>
                    <div className="text-sm text-theme-enhancements">
                      {execution.mode}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ContrastCard>

      {/* Execution Result */}
      {executionResult && (
        <ContrastCard variant="elevated">
          <h2 className="text-2xl font-bold text-theme-accent mb-4">Execution Result</h2>
          <div className={`p-4 rounded-lg ${
            executionResult.success 
              ? 'bg-theme-role/20 border border-theme-role/50' 
              : 'bg-red-500/20 border border-red-500/50'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">{executionResult.success ? '✅' : '❌'}</span>
              <span className={`font-bold ${
                executionResult.success ? 'text-theme-role' : 'text-red-400'
              }`}>
                {executionResult.success ? 'Success' : 'Failed'}
              </span>
            </div>
            {executionResult.error && (
              <p className="text-red-400 text-sm mb-2">
                <strong>Error:</strong> {executionResult.error}
              </p>
            )}
            {executionResult.data && (
              <pre className="text-theme-enhancements text-xs bg-theme-secondary/20 p-2 rounded overflow-x-auto">
                {JSON.stringify(executionResult.data, null, 2)}
              </pre>
            )}
            <p className="text-theme-enhancements text-xs mt-2">
              {new Date(executionResult.timestamp).toLocaleString()}
            </p>
          </div>
        </ContrastCard>
      )}
    </div>
  )
}




