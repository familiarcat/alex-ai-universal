'use client'

import { useState } from 'react'

interface Configuration {
  title: string
  subtitle: string
  description: string
  heading: string
  theme: string
  server: {
    port: number
    host: string
    environment: string
  }
  crew: {
    autoEngage: boolean
    maxConcurrentTasks: number
    responseTimeout: number
  }
  rag: {
    enabled: boolean
    memoryLimit: number
    autoCleanup: boolean
  }
  security: {
    enabled: boolean
    auditLogging: boolean
    encryptionLevel: string
  }
}

export default function Configuration() {
  const [config, setConfig] = useState<Configuration>({
    title: 'Alex AI Universal Demo',
    subtitle: 'Enhanced Interactive Dashboard',
    description: 'Advanced control panel with crew intelligence monitoring and real-time updates',
    heading: 'DEVELOPMENT MODE - ENHANCED DASHBOARD READY! 🚀',
    theme: 'star-trek',
    server: {
      port: 3000,
      host: 'localhost',
      environment: 'development'
    },
    crew: {
      autoEngage: true,
      maxConcurrentTasks: 5,
      responseTimeout: 30000
    },
    rag: {
      enabled: true,
      memoryLimit: 1024,
      autoCleanup: true
    },
    security: {
      enabled: true,
      auditLogging: true,
      encryptionLevel: 'high'
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string>('')

  const saveConfiguration = async () => {
    setIsSaving(true)
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLastSaved(new Date().toLocaleTimeString())
    setIsSaving(false)
    console.log('Configuration saved:', config)
  }

  const resetConfiguration = () => {
    if (confirm('Are you sure you want to reset all configuration to defaults?')) {
      setConfig({
        title: 'Alex AI Universal Demo',
        subtitle: 'Enhanced Interactive Dashboard',
        description: 'Advanced control panel with crew intelligence monitoring and real-time updates',
        heading: 'DEVELOPMENT MODE - ENHANCED DASHBOARD READY! 🚀',
        theme: 'star-trek',
        server: {
          port: 3000,
          host: 'localhost',
          environment: 'development'
        },
        crew: {
          autoEngage: true,
          maxConcurrentTasks: 5,
          responseTimeout: 30000
        },
        rag: {
          enabled: true,
          memoryLimit: 1024,
          autoCleanup: true
        },
        security: {
          enabled: true,
          auditLogging: true,
          encryptionLevel: 'high'
        }
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          ⚙️ Configuration Center
        </h1>
        <p className="text-xl text-gray-300">
          Manage system configuration and application settings
        </p>
      </div>

      {/* Save Controls */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Configuration Management</h3>
            {lastSaved && (
              <p className="text-gray-300">Last saved: {lastSaved}</p>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={resetConfiguration}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              🔄 Reset
            </button>
            <button
              onClick={saveConfiguration}
              disabled={isSaving}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-all"
            >
              {isSaving ? '💾 Saving...' : '💾 Save Configuration'}
            </button>
          </div>
        </div>
      </div>

      {/* Application Settings */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Application Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-medium mb-2">Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({...config, title: e.target.value})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              placeholder="Application title"
            />
          </div>
          
          <div>
            <label className="block text-white font-medium mb-2">Subtitle</label>
            <input
              type="text"
              value={config.subtitle}
              onChange={(e) => setConfig({...config, subtitle: e.target.value})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              placeholder="Application subtitle"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-white font-medium mb-2">Description</label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig({...config, description: e.target.value})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              rows={3}
              placeholder="Application description"
            />
          </div>
          
          <div>
            <label className="block text-white font-medium mb-2">Heading</label>
            <input
              type="text"
              value={config.heading}
              onChange={(e) => setConfig({...config, heading: e.target.value})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              placeholder="Main heading text"
            />
          </div>
          
          <div>
            <label className="block text-white font-medium mb-2">Theme</label>
            <select
              value={config.theme}
              onChange={(e) => setConfig({...config, theme: e.target.value})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
              <option value="star-trek">Star Trek</option>
              <option value="neon">Neon Cyber</option>
              <option value="ocean">Ocean Blue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Server Configuration */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Server Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-white font-medium mb-2">Port</label>
            <input
              type="number"
              value={config.server.port}
              onChange={(e) => setConfig({
                ...config, 
                server: {...config.server, port: parseInt(e.target.value)}
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>
          
          <div>
            <label className="block text-white font-medium mb-2">Host</label>
            <input
              type="text"
              value={config.server.host}
              onChange={(e) => setConfig({
                ...config, 
                server: {...config.server, host: e.target.value}
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>
          
          <div>
            <label className="block text-white font-medium mb-2">Environment</label>
            <select
              value={config.server.environment}
              onChange={(e) => setConfig({
                ...config, 
                server: {...config.server, environment: e.target.value}
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>
      </div>

      {/* Crew Configuration */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Crew Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoEngage"
              checked={config.crew.autoEngage}
              onChange={(e) => setConfig({
                ...config, 
                crew: {...config.crew, autoEngage: e.target.checked}
              })}
              className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoEngage" className="text-white font-medium">
              Auto Engage Crew
            </label>
          </div>
          
          <div>
            <label className="block text-white font-medium mb-2">Max Concurrent Tasks</label>
            <input
              type="number"
              value={config.crew.maxConcurrentTasks}
              onChange={(e) => setConfig({
                ...config, 
                crew: {...config.crew, maxConcurrentTasks: parseInt(e.target.value)}
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>
          
          <div>
            <label className="block text-white font-medium mb-2">Response Timeout (ms)</label>
            <input
              type="number"
              value={config.crew.responseTimeout}
              onChange={(e) => setConfig({
                ...config, 
                crew: {...config.crew, responseTimeout: parseInt(e.target.value)}
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {/* RAG Configuration */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">RAG Memory Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="ragEnabled"
              checked={config.rag.enabled}
              onChange={(e) => setConfig({
                ...config, 
                rag: {...config.rag, enabled: e.target.checked}
              })}
              className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
            <label htmlFor="ragEnabled" className="text-white font-medium">
              Enable RAG System
            </label>
          </div>
          
          <div>
            <label className="block text-white font-medium mb-2">Memory Limit (MB)</label>
            <input
              type="number"
              value={config.rag.memoryLimit}
              onChange={(e) => setConfig({
                ...config, 
                rag: {...config.rag, memoryLimit: parseInt(e.target.value)}
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoCleanup"
              checked={config.rag.autoCleanup}
              onChange={(e) => setConfig({
                ...config, 
                rag: {...config.rag, autoCleanup: e.target.checked}
              })}
              className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoCleanup" className="text-white font-medium">
              Auto Cleanup
            </label>
          </div>
        </div>
      </div>

      {/* Security Configuration */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Security Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="securityEnabled"
              checked={config.security.enabled}
              onChange={(e) => setConfig({
                ...config, 
                security: {...config.security, enabled: e.target.checked}
              })}
              className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
            <label htmlFor="securityEnabled" className="text-white font-medium">
              Enable Security Protocol
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="auditLogging"
              checked={config.security.auditLogging}
              onChange={(e) => setConfig({
                ...config, 
                security: {...config.security, auditLogging: e.target.checked}
              })}
              className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
            <label htmlFor="auditLogging" className="text-white font-medium">
              Audit Logging
            </label>
          </div>
          
          <div>
            <label className="block text-white font-medium mb-2">Encryption Level</label>
            <select
              value={config.security.encryptionLevel}
              onChange={(e) => setConfig({
                ...config, 
                security: {...config.security, encryptionLevel: e.target.value}
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="maximum">Maximum</option>
            </select>
          </div>
        </div>
      </div>

      {/* Configuration Preview */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Configuration Preview</h2>
        <pre className="bg-black/20 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </div>
  )
}
