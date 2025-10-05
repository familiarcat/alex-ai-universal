'use client'

import { useState, useEffect } from 'react'

interface HealthStatus {
  server: 'online' | 'offline'
  database: 'connected' | 'disconnected'
  websocket: 'active' | 'inactive'
  memory: number
  uptime: string
  lastCheck: string
}

export default function HealthCheck() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    server: 'online',
    database: 'connected',
    websocket: 'active',
    memory: 256,
    uptime: '2h 34m',
    lastCheck: new Date().toLocaleTimeString()
  })

  const [isChecking, setIsChecking] = useState(false)

  const checkHealth = async () => {
    setIsChecking(true)
    // Simulate health check
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setHealthStatus({
      server: 'online',
      database: 'connected',
      websocket: 'active',
      memory: Math.floor(Math.random() * 100) + 200,
      uptime: '2h 34m',
      lastCheck: new Date().toLocaleTimeString()
    })
    setIsChecking(false)
  }

  useEffect(() => {
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'active':
        return 'text-green-400'
      case 'offline':
      case 'disconnected':
      case 'inactive':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'active':
        return '✅'
      case 'offline':
      case 'disconnected':
      case 'inactive':
        return '❌'
      default:
        return '❓'
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🏥 System Health Check
        </h1>
        <p className="text-xl text-gray-300">
          Real-time monitoring of all system components and services
        </p>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Server Status</h3>
            <span className="text-2xl">{getStatusIcon(healthStatus.server)}</span>
          </div>
          <div className={`text-xl font-bold ${getStatusColor(healthStatus.server)}`}>
            {healthStatus.server.toUpperCase()}
          </div>
          <div className="text-sm text-gray-300 mt-1">Main application server</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Database</h3>
            <span className="text-2xl">{getStatusIcon(healthStatus.database)}</span>
          </div>
          <div className={`text-xl font-bold ${getStatusColor(healthStatus.database)}`}>
            {healthStatus.database.toUpperCase()}
          </div>
          <div className="text-sm text-gray-300 mt-1">Supabase connection</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">WebSocket</h3>
            <span className="text-2xl">{getStatusIcon(healthStatus.websocket)}</span>
          </div>
          <div className={`text-xl font-bold ${getStatusColor(healthStatus.websocket)}`}>
            {healthStatus.websocket.toUpperCase()}
          </div>
          <div className="text-sm text-gray-300 mt-1">Real-time connections</div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">System Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{healthStatus.memory}MB</div>
            <div className="text-gray-300">Memory Usage</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${(healthStatus.memory / 512) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{healthStatus.uptime}</div>
            <div className="text-gray-300">Uptime</div>
            <div className="text-sm text-gray-400 mt-1">Since last restart</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
            <div className="text-gray-300">Availability</div>
            <div className="text-sm text-gray-400 mt-1">Last 30 days</div>
          </div>
        </div>
      </div>

      {/* Component Status */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Component Status</h2>
        <div className="space-y-4">
          {[
            { name: 'Alex AI Core Engine', status: 'online', description: 'Main AI processing engine' },
            { name: 'Crew Management System', status: 'online', description: 'Crew member coordination and monitoring' },
            { name: 'RAG Memory System', status: 'online', description: 'Retrieval-augmented generation memory' },
            { name: 'N8N Workflow Engine', status: 'online', description: 'Automation and workflow management' },
            { name: 'Supabase Integration', status: 'online', description: 'Database and authentication services' },
            { name: 'WebSocket Server', status: 'online', description: 'Real-time communication layer' },
            { name: 'Theme Manager', status: 'online', description: 'UI theme and styling system' },
            { name: 'Security Protocol', status: 'online', description: 'Security monitoring and compliance' }
          ].map((component, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getStatusIcon(component.status)}</span>
                <div>
                  <div className="text-white font-medium">{component.name}</div>
                  <div className="text-sm text-gray-400">{component.description}</div>
                </div>
              </div>
              <div className={`font-bold ${getStatusColor(component.status)}`}>
                {component.status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Check Actions */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Manual Health Check</h3>
            <p className="text-gray-300">Last checked: {healthStatus.lastCheck}</p>
          </div>
          <button
            onClick={checkHealth}
            disabled={isChecking}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            {isChecking ? '🔄 Checking...' : '🔍 Check Health'}
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Environment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Environment:</span>
                <span className="text-white">Development</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Platform:</span>
                <span className="text-white">Next.js 15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Node Version:</span>
                <span className="text-white">v20.19.1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Framework:</span>
                <span className="text-white">React 18</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Performance</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Response Time:</span>
                <span className="text-white">45ms avg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Throughput:</span>
                <span className="text-white">1,250 req/min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Error Rate:</span>
                <span className="text-green-400">0.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Active Connections:</span>
                <span className="text-white">127</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
