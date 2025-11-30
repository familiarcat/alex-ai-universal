/**
 * Alex AI Manager - Central Integration Hub
 * 
 * This is the central manager that all sub-projects in the monorepo can use
 * to integrate with the Alex AI system, N8N Federation Crew, and universal
 * credential management.
 */

import { N8NCredentialsManager } from './n8n-credentials-manager'
import { UnifiedDataService } from './unified-data-service'
import { StealthScrapingService } from './stealth-scraping-service'
import { AlexAICrewManager } from './crew-manager'

export interface AlexAIConfig {
  environment: 'development' | 'staging' | 'production'
  enableN8NIntegration: boolean
  enableStealthScraping: boolean
  enableCrewManagement: boolean
  enableTesting: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

export interface AlexAIStatus {
  isInitialized: boolean
  n8nConnection: boolean
  supabaseConnection: boolean
  crewStatus: Record<string, boolean>
  lastHealthCheck: Date
  version: string
}

export class AlexAIManager {
  private static instance: AlexAIManager
  private config: AlexAIConfig
  private credentialsManager: N8NCredentialsManager
  private dataService: UnifiedDataService
  private stealthService: StealthScrapingService
  private crewManager: AlexAICrewManager
  private isInitialized = false

  private constructor(config: Partial<AlexAIConfig> = {}) {
    this.config = {
      environment: 'development',
      enableN8NIntegration: true,
      enableStealthScraping: true,
      enableCrewManagement: true,
      enableTesting: true,
      logLevel: 'info',
      ...config
    }

    this.credentialsManager = new N8NCredentialsManager()
    this.dataService = new UnifiedDataService()
    this.stealthService = new StealthScrapingService()
    this.crewManager = new AlexAICrewManager()
  }

  /**
   * Get singleton instance of Alex AI Manager
   */
  public static getInstance(config?: Partial<AlexAIConfig>): AlexAIManager {
    if (!AlexAIManager.instance) {
      AlexAIManager.instance = new AlexAIManager(config)
    }
    return AlexAIManager.instance
  }

  /**
   * Initialize Alex AI system
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🔄 Alex AI Manager already initialized')
      return
    }

    console.log('🚀 Initializing Alex AI Manager...')

    try {
      // Initialize credentials manager
      if (this.config.enableN8NIntegration) {
        await this.credentialsManager.getCredentials()
        console.log('✅ N8N Federation Crew credentials loaded')
      }

      // Initialize data service
      await this.dataService.initialize()
      console.log('✅ Unified data service initialized')

      // Initialize stealth service
      if (this.config.enableStealthScraping) {
        await this.stealthService.initialize()
        console.log('✅ Stealth scraping service initialized')
      }

      // Initialize crew manager
      if (this.config.enableCrewManagement) {
        await this.crewManager.initialize()
        console.log('✅ Alex AI crew manager initialized')
      }

      this.isInitialized = true
      console.log('🎉 Alex AI Manager initialization complete!')

    } catch (error) {
      console.error('❌ Alex AI Manager initialization failed:', error)
      throw error
    }
  }

  /**
   * Get system status
   */
  public async getStatus(): Promise<AlexAIStatus> {
    const status: AlexAIStatus = {
      isInitialized: this.isInitialized,
      n8nConnection: false,
      supabaseConnection: false,
      crewStatus: {},
      lastHealthCheck: new Date(),
      version: '2.0.0'
    }

    try {
      // Check N8N connection
      if (this.config.enableN8NIntegration) {
        status.n8nConnection = await this.credentialsManager.testConnection()
      }

      // Check Supabase connection
      status.supabaseConnection = await this.dataService.testConnection()

      // Check crew status
      if (this.config.enableCrewManagement) {
        status.crewStatus = await this.crewManager.getCrewStatus()
      }

    } catch (error) {
      console.error('Error checking Alex AI status:', error)
    }

    return status
  }

  /**
   * Get credentials manager
   */
  public getCredentialsManager(): N8NCredentialsManager {
    return this.credentialsManager
  }

  /**
   * Get data service
   */
  public getDataService(): UnifiedDataService {
    return this.dataService
  }

  /**
   * Get stealth scraping service
   */
  public getStealthService(): StealthScrapingService {
    return this.stealthService
  }

  /**
   * Get crew manager
   */
  public getCrewManager(): AlexAICrewManager {
    return this.crewManager
  }

  /**
   * Run end-to-end tests
   */
  public async runTests(): Promise<any> {
    if (!this.config.enableTesting) {
      throw new Error('Testing is disabled in configuration')
    }

    console.log('🧪 Running Alex AI end-to-end tests...')
    
    const results = {
      credentials: await this.credentialsManager.testConnection(),
      dataService: await this.dataService.testConnection(),
      stealthService: await this.stealthService.testConnection(),
      crewManager: await this.crewManager.testConnection(),
      timestamp: new Date().toISOString()
    }

    console.log('✅ Alex AI tests completed:', results)
    return results
  }

  /**
   * Get configuration
   */
  public getConfig(): AlexAIConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<AlexAIConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('🔧 Alex AI configuration updated:', this.config)
  }

  /**
   * Shutdown Alex AI system
   */
  public async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Alex AI Manager...')
    
    try {
      await this.stealthService.cleanup()
      await this.dataService.cleanup()
      await this.crewManager.cleanup()
      
      this.isInitialized = false
      console.log('✅ Alex AI Manager shutdown complete')
    } catch (error) {
      console.error('❌ Error during Alex AI shutdown:', error)
    }
  }
}

// Export convenience functions for easy integration
export const initializeAlexAI = async (config?: Partial<AlexAIConfig>) => {
  const manager = AlexAIManager.getInstance(config)
  await manager.initialize()
  return manager
}

export const getAlexAI = () => AlexAIManager.getInstance()

export const getAlexAIStatus = async () => {
  const manager = AlexAIManager.getInstance()
  return await manager.getStatus()
}

// Default export
export default AlexAIManager
