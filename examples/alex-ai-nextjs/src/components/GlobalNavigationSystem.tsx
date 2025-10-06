'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface GlobalConfig {
  openaiApiKey: string
  anthropicApiKey: string
  openrouterApiKey: string
  supabaseAnonKey: string
  n8nApiUrl: string
  n8nApiKey: string
  alexAiEnabled: boolean
  ragEnabled: boolean
  bilateralSync: boolean
}

interface GlobalNavigationSystemProps {
  children: React.ReactNode
}

export default function GlobalNavigationSystem({ children }: GlobalNavigationSystemProps) {
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const pathname = usePathname()

  // Load global configuration from environment/secrets
  useEffect(() => {
    const loadGlobalConfig = async () => {
      try {
        // Check if we're in development mode and can access environment variables
        const config: GlobalConfig = {
          openaiApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
          anthropicApiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
          openrouterApiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
          supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          n8nApiUrl: process.env.NEXT_PUBLIC_N8N_API_URL || 'https://n8n.pbradygeorgen.com/api/v1',
          n8nApiKey: process.env.NEXT_PUBLIC_N8N_API_KEY || '',
          alexAiEnabled: true, // Always enabled by default
          ragEnabled: process.env.NEXT_PUBLIC_ALEX_AI_ENABLE_RAG === 'true',
          bilateralSync: process.env.NEXT_PUBLIC_ALEX_AI_ENABLE_BILATERAL_SYNC === 'true'
        }

        // Verify we have the essential keys
        if (config.openaiApiKey || config.anthropicApiKey || config.openrouterApiKey) {
          setGlobalConfig(config)
          setIsConnected(true)
          setConnectionStatus('connected')
          console.log('🖖 Global Navigation System: Connected to Alex AI secrets')
        } else {
          // Fallback: Try to connect to global Alex AI system
          const response = await fetch('/api/global-config')
          if (response.ok) {
            const globalData = await response.json()
            setGlobalConfig(globalData)
            setIsConnected(true)
            setConnectionStatus('connected')
            console.log('🖖 Global Navigation System: Connected via API')
          } else {
            setConnectionStatus('disconnected')
            console.warn('⚠️ Global Navigation System: Using fallback mode')
          }
        }
      } catch (error) {
        console.error('❌ Global Navigation System: Connection failed', error)
        setConnectionStatus('disconnected')
        setIsConnected(false)
      }
    }

    loadGlobalConfig()
  }, [])

  // Global navigation should always be available unless explicitly disabled
  const shouldShowNavigation = globalConfig?.alexAiEnabled !== false

  if (!shouldShowNavigation) {
    return <>{children}</>
  }

  return (
    <div className="global-navigation-system">
      {/* Global Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-[10001] bg-black/90 backdrop-blur-sm border-b border-blue-600/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🖖</span>
                <span className="text-sm font-bold text-white">Alex AI Universal</span>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 
                  'bg-red-400'
                }`}></div>
                <span className="text-xs text-gray-300 capitalize">
                  {connectionStatus === 'connected' ? 'Global System Connected' : connectionStatus}
                </span>
              </div>

              {/* Global Features Status */}
              {globalConfig && (
                <div className="flex items-center space-x-3 text-xs">
                  {globalConfig.ragEnabled && (
                    <span className="text-green-400">🧠 RAG</span>
                  )}
                  {globalConfig.bilateralSync && (
                    <span className="text-blue-400">🔄 Sync</span>
                  )}
                  {globalConfig.n8nApiUrl && (
                    <span className="text-purple-400">🖖 N8N</span>
                  )}
                </div>
              )}
            </div>

            {/* Global Navigation Links */}
            <div className="flex items-center space-x-4">
              <a 
                href="/" 
                className={`text-xs px-2 py-1 rounded transition-all ${
                  pathname === '/' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Dashboard
              </a>
              <a 
                href="/unified" 
                className={`text-xs px-2 py-1 rounded transition-all ${
                  pathname === '/unified' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Unified
              </a>
              <a 
                href="/live" 
                className={`text-xs px-2 py-1 rounded transition-all ${
                  pathname === '/live' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Live
              </a>
              <a 
                href="/crew-responsibilities" 
                className={`text-xs px-2 py-1 rounded transition-all ${
                  pathname === '/crew-responsibilities' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Crew
              </a>
              <a 
                href="/crew-rag-query" 
                className={`text-xs px-2 py-1 rounded transition-all ${
                  pathname === '/crew-rag-query' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                RAG Query
              </a>
              <a 
                href="/crew-response" 
                className={`text-xs px-2 py-1 rounded transition-all ${
                  pathname === '/crew-response' ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Crew Response
              </a>
              <a 
                href="/emergency-protocols" 
                className={`text-xs px-2 py-1 rounded transition-all ${
                  pathname === '/emergency-protocols' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Emergency
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Global Navigation Offset */}
      <div className="pt-12">
        {children}
      </div>

      {/* Global System Info (Development Mode) */}
      {process.env.NODE_ENV === 'development' && globalConfig && (
        <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm border border-blue-600/30 rounded-lg p-3 max-w-sm text-xs">
          <div className="text-blue-400 font-bold mb-2">🖖 Global System Status</div>
          <div className="space-y-1 text-gray-300">
            <div>OpenAI: {globalConfig.openaiApiKey ? '✅' : '❌'}</div>
            <div>Anthropic: {globalConfig.anthropicApiKey ? '✅' : '❌'}</div>
            <div>OpenRouter: {globalConfig.openrouterApiKey ? '✅' : '❌'}</div>
            <div>Supabase: {globalConfig.supabaseAnonKey ? '✅' : '❌'}</div>
            <div>N8N: {globalConfig.n8nApiUrl ? '✅' : '❌'}</div>
            <div>RAG: {globalConfig.ragEnabled ? '✅' : '❌'}</div>
            <div>Sync: {globalConfig.bilateralSync ? '✅' : '❌'}</div>
          </div>
        </div>
      )}
    </div>
  )
}
