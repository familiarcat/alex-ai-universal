'use client'

import { useState, useEffect } from 'react'
import { WebSocket } from 'ws'

interface DashboardData {
  crewMembers: Array<{
    id: string
    name: string
    role: string
    status: 'active' | 'inactive'
    component: string
    expertise: string[]
  }>
  systemStatus: {
    server: 'online' | 'offline'
    connections: number
    lastUpdate: string
  }
  theme: string
  config: any
}

interface UnifiedDashboardProps {
  demoProjectUrl?: string
}

export default function UnifiedDashboard({ demoProjectUrl = 'http://localhost:3001' }: UnifiedDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [activeView, setActiveView] = useState<'dashboard' | 'live-preview'>('dashboard')
  const [userRole, setUserRole] = useState<'admin' | 'user' | 'public'>('user')

  // WebSocket connection for real-time updates
  useEffect(() => {
    let ws: WebSocket | null = null
    
    const connectWebSocket = () => {
      try {
        ws = new WebSocket('ws://localhost:3001')
        
        ws.onopen = () => {
          console.log('🖖 Unified Dashboard WebSocket Connected')
          setConnectionStatus('connected')
        }
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'dashboard-update') {
              setDashboardData(data.payload)
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }
        
        ws.onclose = () => {
          console.log('WebSocket disconnected, attempting to reconnect...')
          setConnectionStatus('disconnected')
          setTimeout(connectWebSocket, 3000)
        }
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          setConnectionStatus('disconnected')
        }
      } catch (error) {
        console.error('Failed to connect WebSocket:', error)
        setConnectionStatus('disconnected')
      }
    }

    connectWebSocket()

    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [])

  // Fetch initial data from demo project
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${demoProjectUrl}/api/dashboard`)
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      }
    }

    fetchDashboardData()
  }, [demoProjectUrl])

  return (
    <div className="unified-dashboard min-h-screen theme-background">
      {/* Unified Navigation Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b-2 border-blue-600/30 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🖖</span>
            <h1 className="text-xl font-bold text-white">Alex AI Universal - Unified Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 
                'bg-red-400'
              }`}></div>
              <span className="text-sm font-medium text-white capitalize">
                {connectionStatus}
              </span>
            </div>

            {/* View Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  activeView === 'dashboard' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                🎛️ Dashboard
              </button>
              <button
                onClick={() => setActiveView('live-preview')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  activeView === 'live-preview' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                🌐 Live Preview
              </button>
            </div>

            {/* Role Selector */}
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="px-3 py-1 rounded text-sm bg-white/20 text-white border border-white/30"
            >
              <option value="public">Public</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto p-6">
        {activeView === 'dashboard' ? (
          <DashboardView 
            data={dashboardData} 
            userRole={userRole}
            connectionStatus={connectionStatus}
          />
        ) : (
          <LivePreviewView 
            data={dashboardData}
            demoProjectUrl={demoProjectUrl}
          />
        )}
      </div>
    </div>
  )
}

// Dashboard View Component
function DashboardView({ data, userRole, connectionStatus }: {
  data: DashboardData | null
  userRole: string
  connectionStatus: string
}) {
  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🖖</div>
        <h2 className="text-2xl font-bold text-white mb-2">Loading Unified Dashboard</h2>
        <p className="text-gray-300">Connecting to Alex AI systems...</p>
        <div className="mt-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Status */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-4">🔧 System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              data.systemStatus.server === 'online' ? 'text-green-400' : 'text-red-400'
            }`}>
              {data.systemStatus.server === 'online' ? 'Online' : 'Offline'}
            </div>
            <div className="text-gray-300">Server Status</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{data.systemStatus.connections}</div>
            <div className="text-gray-300">Active Connections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{data.crewMembers.length}</div>
            <div className="text-gray-300">Crew Members</div>
          </div>
        </div>
      </div>

      {/* Crew Status Grid */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-4">👥 Crew Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.crewMembers.map((member) => (
            <div key={member.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  member.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <div>
                  <div className="font-bold text-white">{member.name}</div>
                  <div className="text-sm text-gray-300">{member.role}</div>
                  <div className="text-xs text-blue-300">{member.component}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Panel (if admin) */}
      {userRole === 'admin' && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-white mb-4">🔐 Admin Panel</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all">
              🔄 Sync Systems
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-all">
              📊 Analytics
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-all">
              ⚙️ Settings
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition-all">
              🚨 Emergency
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Live Preview View Component
function LivePreviewView({ data, demoProjectUrl }: {
  data: DashboardData | null
  demoProjectUrl: string
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">🌐 Live Frontend Preview</h2>
        <p className="text-gray-300 mb-4">Real-time synchronization with demo project</p>
      </div>

      {/* Live Preview Frame */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={`${demoProjectUrl}/live`}
            className="w-full h-full"
            title="Live Frontend Preview"
          />
        </div>
      </div>

      {/* Preview Controls */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">🎛️ Preview Controls</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all">
            🔄 Refresh
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-all">
            📱 Mobile View
          </button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-all">
            🔍 Inspect
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-medium transition-all">
            📊 Analytics
          </button>
        </div>
      </div>
    </div>
  )
}
