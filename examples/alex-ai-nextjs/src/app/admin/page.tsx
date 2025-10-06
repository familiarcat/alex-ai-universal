'use client'

import { useState } from 'react'
import { ContrastCard, ContrastText, ContrastButton } from '@/components/ContrastAware'

export default function AdminDashboard() {
  const [systemMetrics, setSystemMetrics] = useState({
    uptime: '2h 34m',
    memory: 256,
    connections: 127,
    crewMembers: 9
  })

  const [logs, setLogs] = useState([
    { timestamp: '15:42:31', level: 'INFO', message: 'System health check completed successfully' },
    { timestamp: '15:41:15', level: 'INFO', message: 'Crew member Data completed task: analytics processing' },
    { timestamp: '15:40:03', level: 'WARN', message: 'High memory usage detected, cleanup initiated' },
    { timestamp: '15:39:22', level: 'INFO', message: 'New WebSocket connection established' },
    { timestamp: '15:38:45', level: 'INFO', message: 'Theme configuration updated to Star Trek' }
  ])

  const performAdminAction = (action: string) => {
    console.log(`Admin action: ${action}`)
    // Simulate admin action
    alert(`Admin action "${action}" executed! (This is a demo)`)
  }

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-red-800 to-red-600 border-2 border-red-400 rounded-xl p-6">
        <div className="text-center">
          <div className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
            🔐 ADMINISTRATOR ACCESS
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            🖖 Alex AI Administrator Dashboard
          </h1>
          <p className="text-xl text-red-100">
            Full system control and monitoring capabilities
          </p>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ContrastCard variant="elevated" className="text-center">
          <div className="text-2xl font-bold text-theme-role">{systemMetrics.uptime}</div>
          <div className="text-theme-enhancements">Uptime</div>
        </ContrastCard>
        <ContrastCard variant="elevated" className="text-center">
          <div className="text-2xl font-bold text-theme-component">{systemMetrics.connections}</div>
          <div className="text-theme-enhancements">Connections</div>
        </ContrastCard>
        <ContrastCard variant="elevated" className="text-center">
          <div className="text-2xl font-bold text-theme-accent">{systemMetrics.memory}MB</div>
          <div className="text-theme-enhancements">Memory</div>
        </ContrastCard>
        <ContrastCard variant="elevated" className="text-center">
          <div className="text-2xl font-bold text-theme-component">{systemMetrics.crewMembers}</div>
          <div className="text-theme-enhancements">Crew Members</div>
        </ContrastCard>
      </div>

      {/* Admin Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Controls */}
        <ContrastCard variant="elevated">
          <h2 className="text-2xl font-bold text-theme-accent mb-6">🎛️ System Controls</h2>
          <div className="space-y-4">
            <ContrastButton
              onClick={() => performAdminAction('Restart Server')}
              variant="component"
              className="w-full px-4 py-3"
            >
              🔄 Restart Server
            </ContrastButton>
            <ContrastButton
              onClick={() => performAdminAction('Clear Logs')}
              variant="enhancements"
              className="w-full px-4 py-3"
            >
              🗑️ Clear Logs
            </ContrastButton>
            <ContrastButton
              onClick={() => performAdminAction('Backup Configuration')}
              variant="role"
              className="w-full px-4 py-3"
            >
              💾 Backup Configuration
            </ContrastButton>
            <ContrastButton
              onClick={() => performAdminAction('Update System')}
              variant="accent"
              className="w-full px-4 py-3"
            >
              📦 Update System
            </ContrastButton>
          </div>

        {/* Security Controls */}
        <ContrastCard variant="elevated">
          <h2 className="text-2xl font-bold text-theme-accent mb-6">🔒 Security Controls</h2>
          <div className="space-y-4">
            <ContrastButton
              onClick={() => performAdminAction('Security Scan')}
              variant="component"
              className="w-full px-4 py-3"
            >
              🔍 Security Scan
            </ContrastButton>
            <ContrastButton
              onClick={() => performAdminAction('Audit Access')}
              variant="component"
              className="w-full px-4 py-3"
            >
              📋 Audit Access
            </ContrastButton>
            <ContrastButton
              onClick={() => performAdminAction('Emergency Stop')}
              variant="enhancements"
              className="w-full px-4 py-3"
              style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
            >
              🛑 Emergency Stop
            </ContrastButton>
            <ContrastButton
              onClick={() => performAdminAction('Reset Security')}
              variant="accent"
              className="w-full px-4 py-3"
            >
              🔐 Reset Security
            </ContrastButton>
          </div>

      {/* Advanced Configuration */}
      <ContrastCard variant="elevated">
        <h2 className="text-2xl font-bold text-theme-accent mb-6">🔧 Advanced Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-theme-accent">Theme Management</h3>
            <ContrastButton
              onClick={() => performAdminAction('Reset Theme')}
              variant="accent"
              className="w-full px-4 py-2"
            >
              🎨 Reset Theme
            </ContrastButton>
            <ContrastButton
              onClick={() => performAdminAction('Export Theme')}
              variant="accent"
              className="w-full px-4 py-2"
            >
              📤 Export Theme
            </ContrastButton>
            <ContrastButton
              onClick={() => performAdminAction('Import Theme')}
              variant="accent"
              className="w-full px-4 py-2"
            >
              📥 Import Theme
            </ContrastButton>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Crew Management</h3>
            <button
              onClick={() => performAdminAction('Deploy Crew')}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              👥 Deploy Crew
            </button>
            <button
              onClick={() => performAdminAction('Update Crew')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              🔄 Update Crew
            </button>
            <button
              onClick={() => performAdminAction('Crew Diagnostics')}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              🩺 Crew Diagnostics
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Database Operations</h3>
            <button
              onClick={() => performAdminAction('Database Backup')}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              💾 Database Backup
            </button>
            <button
              onClick={() => performAdminAction('Optimize Database')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              ⚡ Optimize Database
            </button>
            <button
              onClick={() => performAdminAction('Clear Cache')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              🗑️ Clear Cache
            </button>
          </div>
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">📋 System Logs</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg text-sm ${
                log.level === 'WARN' 
                  ? 'bg-yellow-500/20 border border-yellow-500/30' 
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 font-mono">{log.timestamp}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  log.level === 'WARN' 
                    ? 'bg-yellow-500 text-yellow-900' 
                    : 'bg-green-500 text-green-900'
                }`}>
                  {log.level}
                </span>
                <span className="text-white">{log.message}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => performAdminAction('Refresh Logs')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
          >
            🔄 Refresh Logs
          </button>
          <button
            onClick={() => performAdminAction('Export Logs')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
          >
            📤 Export Logs
          </button>
          <button
            onClick={() => performAdminAction('Clear Logs')}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
          >
            🗑️ Clear Logs
          </button>
        </div>
      </div>

      {/* Admin Status */}
      <div className="bg-gradient-to-r from-red-800/20 to-red-600/20 border border-red-400/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">🔐 Administrator Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Access Level</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">System Control:</span>
                <span className="text-green-400 font-bold">Full Access</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Security Protocols:</span>
                <span className="text-green-400 font-bold">Full Access</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Crew Management:</span>
                <span className="text-green-400 font-bold">Full Access</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Database Operations:</span>
                <span className="text-green-400 font-bold">Full Access</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Session Info</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Login Time:</span>
                <span className="text-white">15:30:00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Session Duration:</span>
                <span className="text-white">12m 31s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Actions Performed:</span>
                <span className="text-white">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Security Level:</span>
                <span className="text-red-400 font-bold">MAXIMUM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
