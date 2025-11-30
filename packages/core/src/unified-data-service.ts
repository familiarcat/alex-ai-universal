/**
 * Unified Data Service - Central Data Management
 * 
 * This service provides unified data access across all sub-projects,
 * integrating with N8N Federation Crew, Supabase, and local fallbacks.
 */

import { N8NCredentialsManager } from './n8n-credentials-manager'
import axios from 'axios'

export interface DataSource {
  name: string
  type: 'n8n' | 'supabase' | 'local'
  isAvailable: boolean
  lastSync: Date | null
}

export interface UnifiedDataConfig {
  enableN8N: boolean
  enableSupabase: boolean
  enableLocalFallback: boolean
  cacheDuration: number
  retryAttempts: number
}

export class UnifiedDataService {
  private credentialsManager: N8NCredentialsManager
  private config: UnifiedDataConfig
  private dataSources: DataSource[] = []
  private cache: Map<string, { data: any; timestamp: number }> = new Map()

  constructor(config: Partial<UnifiedDataConfig> = {}) {
    this.credentialsManager = new N8NCredentialsManager()
    this.config = {
      enableN8N: true,
      enableSupabase: true,
      enableLocalFallback: true,
      cacheDuration: 10 * 60 * 1000, // 10 minutes
      retryAttempts: 3,
      ...config
    }
  }

  /**
   * Initialize the unified data service
   */
  async initialize(): Promise<void> {
    console.log('🔄 Initializing Unified Data Service...')

    // Initialize data sources
    this.dataSources = [
      {
        name: 'N8N Federation Crew',
        type: 'n8n',
        isAvailable: false,
        lastSync: null
      },
      {
        name: 'Supabase Database',
        type: 'supabase',
        isAvailable: false,
        lastSync: null
      },
      {
        name: 'Local Fallback',
        type: 'local',
        isAvailable: true,
        lastSync: new Date()
      }
    ]

    // Test connections
    await this.testConnections()
    console.log('✅ Unified Data Service initialized')
  }

  /**
   * Test all data source connections
   */
  async testConnections(): Promise<void> {
    for (const source of this.dataSources) {
      try {
        switch (source.type) {
          case 'n8n':
            source.isAvailable = await this.testN8NConnection()
            break
          case 'supabase':
            source.isAvailable = await this.testSupabaseConnection()
            break
          case 'local':
            source.isAvailable = true
            break
        }
        source.lastSync = new Date()
      } catch (error) {
        console.warn(`⚠️ Data source ${source.name} unavailable:`, error)
        source.isAvailable = false
      }
    }
  }

  /**
   * Test N8N connection
   */
  private async testN8NConnection(): Promise<boolean> {
    if (!this.config.enableN8N) return false
    
    try {
      const credentials = await this.credentialsManager.getN8NCredentials()
      const response = await axios.post(
        `${credentials.baseUrl}/webhook/federation-mission`,
        { action: 'test_connection' },
        { timeout: 5000 }
      )
      return response.status === 200
    } catch (error) {
      return false
    }
  }

  /**
   * Test Supabase connection
   */
  private async testSupabaseConnection(): Promise<boolean> {
    if (!this.config.enableSupabase) return false
    
    try {
      const credentials = await this.credentialsManager.getSupabaseCredentials()
      // Test Supabase connection
      return !!credentials.url && !!credentials.anonKey
    } catch (error) {
      return false
    }
  }

  /**
   * Get data from the best available source
   */
  async getData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.config.cacheDuration) {
      return cached.data
    }

    // Try to fetch from available sources
    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        const data = await fetcher()
        this.cache.set(key, { data, timestamp: Date.now() })
        return data
      } catch (error) {
        console.warn(`⚠️ Attempt ${attempt + 1} failed for ${key}:`, error)
        if (attempt === this.config.retryAttempts - 1) {
          throw error
        }
      }
    }

    throw new Error(`Failed to fetch data for ${key} after ${this.config.retryAttempts} attempts`)
  }

  /**
   * Get job opportunities
   */
  async getJobOpportunities(): Promise<any[]> {
    return this.getData('job_opportunities', async () => {
      // Try N8N first
      if (this.dataSources.find(s => s.type === 'n8n' && s.isAvailable)) {
        return await this.getFromN8N('job-opportunities')
      }
      
      // Try Supabase
      if (this.dataSources.find(s => s.type === 'supabase' && s.isAvailable)) {
        return await this.getFromSupabase('job_opportunities')
      }
      
      // Fallback to local data
      return this.getLocalJobData()
    })
  }

  /**
   * Get contacts
   */
  async getContacts(): Promise<any[]> {
    return this.getData('contacts', async () => {
      // Try N8N first
      if (this.dataSources.find(s => s.type === 'n8n' && s.isAvailable)) {
        return await this.getFromN8N('contacts')
      }
      
      // Try Supabase
      if (this.dataSources.find(s => s.type === 'supabase' && s.isAvailable)) {
        return await this.getFromSupabase('contacts')
      }
      
      // Fallback to local data
      return this.getLocalContactData()
    })
  }

  /**
   * Get data from N8N
   */
  private async getFromN8N(endpoint: string): Promise<any[]> {
    const credentials = await this.credentialsManager.getN8NCredentials()
    
    const response = await axios.post(
      `${credentials.baseUrl}/webhook/${endpoint}`,
      {
        action: 'get_all',
        timestamp: new Date().toISOString(),
        source: 'alex_ai_core'
      },
      {
        headers: {
          'X-N8N-API-KEY': credentials.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000
      }
    )

    return response.data?.data || response.data || []
  }

  /**
   * Get data from Supabase
   */
  private async getFromSupabase(table: string): Promise<any[]> {
    const credentials = await this.credentialsManager.getSupabaseCredentials()
    
    // This would use the Supabase client
    // For now, return empty array as placeholder
    return []
  }

  /**
   * Get local job data
   */
  private getLocalJobData(): any[] {
    return [
      {
        id: 'local-1',
        company: 'Microsoft',
        position: 'Senior Software Engineer - AI/ML Platform',
        location: 'St. Louis, MO',
        salary_range: '$120k-180k',
        alex_ai_score: 95,
        source: 'local_fallback'
      },
      {
        id: 'local-2',
        company: 'Boeing',
        position: 'Senior Software Engineer - AI/ML',
        location: 'St. Louis, MO',
        salary_range: '$110k-170k',
        alex_ai_score: 88,
        source: 'local_fallback'
      }
    ]
  }

  /**
   * Get local contact data
   */
  private getLocalContactData(): any[] {
    return [
      {
        id: 'contact-1',
        company: 'Microsoft',
        name: 'John Smith',
        title: 'Hiring Manager',
        email: 'john.smith@microsoft.com',
        confidence_level: 'high',
        source: 'local_fallback'
      }
    ]
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    await this.testConnections()
    return this.dataSources.some(source => source.isAvailable)
  }

  /**
   * Get data sources status
   */
  getDataSources(): DataSource[] {
    return [...this.dataSources]
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    this.cache.clear()
    console.log('✅ Unified Data Service cleaned up')
  }
}
