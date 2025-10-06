'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface HealthMetrics {
  systemStatus: 'healthy' | 'warning' | 'critical'
  uptime: number
  memoryUsage: number
  cpuUsage: number
  diskUsage: number
  networkLatency: number
  activeConnections: number
  lastUpdate: Date
}

export interface HealthAlert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: Date
  resolved: boolean
}

const initialHealthMetrics: HealthMetrics = {
  systemStatus: 'healthy',
  uptime: 0,
  memoryUsage: 0,
  cpuUsage: 0,
  diskUsage: 0,
  networkLatency: 0,
  activeConnections: 0,
  lastUpdate: new Date()
}

interface HealthContextType {
  metrics: HealthMetrics
  alerts: HealthAlert[]
  isMonitoring: boolean
  startMonitoring: () => void
  stopMonitoring: () => void
  dismissAlert: (alertId: string) => void
  clearAllAlerts: () => void
}

const HealthContext = createContext<HealthContextType | undefined>(undefined)

export function HealthProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<HealthMetrics>(initialHealthMetrics)
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  const generateMockMetrics = (): HealthMetrics => {
    const now = new Date()
    return {
      systemStatus: Math.random() > 0.9 ? 'warning' : 'healthy',
      uptime: Math.floor(Math.random() * 86400) + 3600, // 1-24 hours
      memoryUsage: Math.random() * 100,
      cpuUsage: Math.random() * 100,
      diskUsage: Math.random() * 100,
      networkLatency: Math.random() * 100,
      activeConnections: Math.floor(Math.random() * 50) + 1,
      lastUpdate: now
    }
  }

  const checkHealthThresholds = (newMetrics: HealthMetrics) => {
    const newAlerts: HealthAlert[] = []

    // Memory usage warning
    if (newMetrics.memoryUsage > 80) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: newMetrics.memoryUsage > 90 ? 'error' : 'warning',
        message: `High memory usage: ${newMetrics.memoryUsage.toFixed(1)}%`,
        timestamp: new Date(),
        resolved: false
      })
    }

    // CPU usage warning
    if (newMetrics.cpuUsage > 80) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: newMetrics.cpuUsage > 90 ? 'error' : 'warning',
        message: `High CPU usage: ${newMetrics.cpuUsage.toFixed(1)}%`,
        timestamp: new Date(),
        resolved: false
      })
    }

    // Network latency warning
    if (newMetrics.networkLatency > 200) {
      newAlerts.push({
        id: `network-${Date.now()}`,
        type: newMetrics.networkLatency > 500 ? 'error' : 'warning',
        message: `High network latency: ${newMetrics.networkLatency.toFixed(1)}ms`,
        timestamp: new Date(),
        resolved: false
      })
    }

    // System status alerts
    if (newMetrics.systemStatus === 'critical') {
      newAlerts.push({
        id: `system-${Date.now()}`,
        type: 'error',
        message: 'System status is critical - immediate attention required',
        timestamp: new Date(),
        resolved: false
      })
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts].slice(-10)) // Keep last 10 alerts
    }
  }

  const startMonitoring = () => {
    if (isMonitoring) return

    setIsMonitoring(true)
    const id = setInterval(() => {
      const newMetrics = generateMockMetrics()
      setMetrics(newMetrics)
      checkHealthThresholds(newMetrics)
    }, 5000) // Update every 5 seconds

    setIntervalId(id)
  }

  const stopMonitoring = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    setIsMonitoring(false)
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ))
  }

  const clearAllAlerts = () => {
    setAlerts([])
  }

  // Auto-start monitoring on mount
  useEffect(() => {
    startMonitoring()
    return () => stopMonitoring()
  }, [])

  return (
    <HealthContext.Provider value={{ 
      metrics, 
      alerts, 
      isMonitoring, 
      startMonitoring, 
      stopMonitoring, 
      dismissAlert, 
      clearAllAlerts 
    }}>
      {children}
    </HealthContext.Provider>
  )
}

export function useHealth() {
  const context = useContext(HealthContext)
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider')
  }
  return context
}
