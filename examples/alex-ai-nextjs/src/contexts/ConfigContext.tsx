'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface ConfigSettings {
  siteTitle: string
  siteDescription: string
  maintenanceMode: boolean
  analyticsEnabled: boolean
  notificationsEnabled: boolean
  autoSave: boolean
  themeAutoApply: boolean
  realTimeUpdates: boolean
  crewNotifications: boolean
  systemMonitoring: boolean
}

const defaultConfig: ConfigSettings = {
  siteTitle: 'Alex AI Universal',
  siteDescription: 'Advanced AI-powered development platform with crew integration',
  maintenanceMode: false,
  analyticsEnabled: true,
  notificationsEnabled: true,
  autoSave: true,
  themeAutoApply: true,
  realTimeUpdates: true,
  crewNotifications: true,
  systemMonitoring: true
}

interface ConfigContextType {
  config: ConfigSettings
  updateConfig: (updates: Partial<ConfigSettings>) => void
  saveConfig: () => Promise<void>
  resetConfig: () => void
  isDirty: boolean
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfigSettings>(defaultConfig)
  const [isDirty, setIsDirty] = useState(false)

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('alex-ai-config')
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig({ ...defaultConfig, ...parsedConfig })
      } catch (error) {
        console.warn('Failed to parse saved config, using defaults:', error)
        setConfig(defaultConfig)
      }
    }
  }, [])

  const updateConfig = (updates: Partial<ConfigSettings>) => {
    setConfig(prev => ({ ...prev, ...updates }))
    setIsDirty(true)
    
    // Auto-save if enabled
    if (config.autoSave) {
      setTimeout(() => {
        const newConfig = { ...config, ...updates }
        localStorage.setItem('alex-ai-config', JSON.stringify(newConfig))
        setIsDirty(false)
      }, 500) // Debounce auto-save
    }
  }

  const saveConfig = async (): Promise<void> => {
    try {
      // In a real application, this would send to a backend API
      localStorage.setItem('alex-ai-config', JSON.stringify(config))
      setIsDirty(false)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('Configuration saved successfully')
    } catch (error) {
      console.error('Failed to save configuration:', error)
      throw error
    }
  }

  const resetConfig = () => {
    setConfig(defaultConfig)
    setIsDirty(false)
    localStorage.removeItem('alex-ai-config')
  }

  return (
    <ConfigContext.Provider value={{ config, updateConfig, saveConfig, resetConfig, isDirty }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}




