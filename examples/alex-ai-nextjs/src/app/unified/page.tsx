'use client'

import { useState, useEffect } from 'react'
import UnifiedDashboard from '@/components/UnifiedDashboard'

interface SystemStatus {
  nextjs: boolean
  demoProject: boolean
  unified: boolean
}

export default function UnifiedPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    nextjs: false,
    demoProject: false,
    unified: false
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Check Next.js app status
        const nextjsStatus = await fetch('/api/unified?action=dashboard')
          .then(res => res.ok)
          .catch(() => false)

        // Check demo project status
        const demoStatus = await fetch('http://localhost:3001/api/dashboard')
          .then(res => res.ok)
          .catch(() => false)

        setSystemStatus({
          nextjs: nextjsStatus,
          demoProject: demoStatus,
          unified: nextjsStatus && demoStatus
        })
      } catch (error) {
        console.error('Error checking system status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSystemStatus()
    
    // Check status every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen theme-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🖖</div>
          <h2 className="text-2xl font-bold text-white mb-2">Initializing Unified System</h2>
          <p className="text-gray-300">Checking system connectivity...</p>
          <div className="mt-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen theme-background">
      {/* System Status Banner */}
      <div className={`p-4 text-center ${
        systemStatus.unified 
          ? 'bg-green-500/20 border-b-2 border-green-500' 
          : 'bg-yellow-500/20 border-b-2 border-yellow-500'
      }`}>
        <div className="container mx-auto flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              systemStatus.nextjs ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className="text-white font-medium">Next.js App</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              systemStatus.demoProject ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className="text-white font-medium">Demo Project</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              systemStatus.unified ? 'bg-green-400' : 'bg-yellow-400'
            }`}></div>
            <span className="text-white font-medium">Unified System</span>
          </div>
        </div>
      </div>

      {/* Main Unified Dashboard */}
      <UnifiedDashboard 
        demoProjectUrl={systemStatus.demoProject ? 'http://localhost:3001' : undefined}
      />

      {/* System Integration Info */}
      {!systemStatus.unified && (
        <div className="fixed bottom-4 right-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-4 max-w-md">
          <h4 className="text-red-300 font-bold mb-2">🚨 System Integration Status</h4>
          <div className="text-sm text-red-200 space-y-1">
            {!systemStatus.nextjs && <div>• Next.js app not responding</div>}
            {!systemStatus.demoProject && <div>• Demo project not running</div>}
            <div className="mt-2 text-xs">
              Start the demo project with: <code className="bg-black/20 px-1 rounded">npm run clean-dashboard</code>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
