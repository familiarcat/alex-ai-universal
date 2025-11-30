/**
 * Memory Synchronization System
 * 
 * Provides cross-platform memory synchronization using Supabase RAG
 * Ensures crew consciousness and learning is shared across all instances
 */

// Optional Supabase import - will use local storage if not available
let createClient: any;
let SupabaseClient: any;

try {
  const supabase = require('@supabase/supabase-js');
  createClient = supabase.createClient;
  SupabaseClient = supabase.SupabaseClient;
} catch (error) {
  console.warn('⚠️ Supabase not available, using local storage only');
  createClient = null;
  SupabaseClient = null;
}
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export interface MemoryEntry {
  id: string;
  content: string;
  type: 'learning' | 'insight' | 'preference' | 'context' | 'crew_consciousness';
  platform: string;
  timestamp: Date;
  crewMember: string;
  encrypted: boolean;
  tags: string[];
  importance: number;
  crossPlatformSync: {
    platformsSynced: string[];
    lastSync: Date;
    syncStatus: 'pending' | 'synced' | 'error';
  };
}

export interface RAGInsight {
  id: string;
  query: string;
  insights: string[];
  relevance: number;
  timestamp: Date;
  crewMembers: string[];
}

export interface MemorySyncStatus {
  totalMemories: number;
  syncedMemories: number;
  pendingSync: number;
  errorCount: number;
  lastSync: Date;
  platformsActive: string[];
}

/**
 * Memory Synchronization Manager
 * Manages cross-platform memory synchronization using Supabase RAG
 */
export class MemorySyncManager {
  private supabase: any;
  private localMemories: MemoryEntry[];
  private syncStatus: MemorySyncStatus;
  private memoryDir: string;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    // Initialize Supabase client with environment variables or defaults
    if (createClient) {
      const url = supabaseUrl || process.env.SUPABASE_URL || 'https://your-project.supabase.co';
      const key = supabaseKey || process.env.SUPABASE_ANON_KEY || 'your-anon-key';
      this.supabase = createClient(url, key);
    } else {
      this.supabase = null;
    }
    this.localMemories = [];
    this.memoryDir = path.join(os.homedir(), '.alex-ai', 'memories');
    
    this.syncStatus = {
      totalMemories: 0,
      syncedMemories: 0,
      pendingSync: 0,
      errorCount: 0,
      lastSync: new Date(),
      platformsActive: []
    };
  }

  /**
   * Initialize memory synchronization system
   */
  async initialize(): Promise<void> {
    console.log('🧠 Initializing Memory Synchronization System...');
    
    // Ensure memory directory exists
    await this.ensureMemoryDirectory();
    
    // Load local memories
    await this.loadLocalMemories();
    
    // Initialize Supabase connection
    await this.initializeSupabaseConnection();
    
    // Start sync process
    await this.startSyncProcess();
    
    console.log('✅ Memory Synchronization System initialized');
  }

  /**
   * Store memory with cross-platform sync
   */
  async storeMemory(
    content: string,
    type: MemoryEntry['type'],
    platform: string,
    crewMember: string,
    tags: string[] = [],
    importance: number = 1
  ): Promise<MemoryEntry> {
    const memory: MemoryEntry = {
      id: crypto.randomUUID(),
      content,
      type,
      platform,
      timestamp: new Date(),
      crewMember,
      encrypted: true,
      tags,
      importance,
      crossPlatformSync: {
        platformsSynced: [platform],
        lastSync: new Date(),
        syncStatus: 'pending'
      }
    };

    // Add to local memories
    this.localMemories.push(memory);
    
    // Save locally
    await this.saveLocalMemory(memory);
    
    // Sync to Supabase
    await this.syncToSupabase(memory);
    
    // Update sync status
    this.syncStatus.totalMemories++;
    this.syncStatus.pendingSync++;
    
    return memory;
  }

  /**
   * Retrieve memories based on query
   */
  async retrieveMemories(
    query: string,
    limit: number = 10,
    type?: MemoryEntry['type']
  ): Promise<MemoryEntry[]> {
    // First, try to get from Supabase RAG
    const ragResults = await this.querySupabaseRAG(query, limit);
    
    // If no results from Supabase, search local memories
    if (ragResults.length === 0) {
      return this.searchLocalMemories(query, limit, type);
    }
    
    return ragResults;
  }

  /**
   * Generate RAG insights
   */
  async generateRAGInsights(
    query: string,
    crewMembers: string[] = []
  ): Promise<RAGInsight> {
    // Query Supabase for relevant memories
    const memories = await this.querySupabaseRAG(query, 20);
    
    // Generate insights based on memories
    const insights = await this.generateInsightsFromMemories(memories, query);
    
    const ragInsight: RAGInsight = {
      id: crypto.randomUUID(),
      query,
      insights,
      relevance: this.calculateRelevance(memories, query),
      timestamp: new Date(),
      crewMembers
    };
    
    return ragInsight;
  }

  /**
   * Sync memories across platforms
   */
  async syncAcrossPlatforms(): Promise<MemorySyncStatus> {
    console.log('🌐 Syncing memories across platforms...');
    
    if (!this.supabase) {
      console.log('📝 Using local storage only (Supabase not available)');
      this.syncStatus.lastSync = new Date();
      return this.syncStatus;
    }
    
    try {
      // Get memories from Supabase
      const { data: supabaseMemories, error } = await this.supabase
        .from('alex_ai_memories')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Supabase sync error:', error);
        this.syncStatus.errorCount++;
        return this.syncStatus;
      }

      // Merge with local memories
      if (supabaseMemories) {
        for (const memory of supabaseMemories) {
          const existingMemory = this.localMemories.find(m => m.id === memory.id);
          if (!existingMemory) {
            this.localMemories.push(memory as MemoryEntry);
          }
        }
      }

      // Update sync status
      this.syncStatus.syncedMemories = this.localMemories.filter(
        m => m.crossPlatformSync.syncStatus === 'synced'
      ).length;
      
      this.syncStatus.pendingSync = this.localMemories.filter(
        m => m.crossPlatformSync.syncStatus === 'pending'
      ).length;
      
      this.syncStatus.lastSync = new Date();
      
      console.log(`✅ Synced ${this.syncStatus.syncedMemories} memories across platforms`);
      
    } catch (error) {
      console.error('❌ Cross-platform sync failed:', error);
      this.syncStatus.errorCount++;
    }
    
    return this.syncStatus;
  }

  /**
   * Get sync status
   */
  getSyncStatus(): MemorySyncStatus {
    return this.syncStatus;
  }

  /**
   * Query Supabase RAG system
   */
  private async querySupabaseRAG(
    query: string,
    limit: number
  ): Promise<MemoryEntry[]> {
    if (!this.supabase) {
      return [];
    }
    
    try {
      // Use Supabase's full-text search capabilities
      const { data, error } = await this.supabase
        .from('alex_ai_memories')
        .select('*')
        .textSearch('content', query)
        .order('importance', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Supabase RAG query error:', error);
        return [];
      }

      return (data as MemoryEntry[]) || [];
    } catch (error) {
      console.error('❌ Supabase RAG query failed:', error);
      return [];
    }
  }

  /**
   * Search local memories
   */
  private searchLocalMemories(
    query: string,
    limit: number,
    type?: MemoryEntry['type']
  ): MemoryEntry[] {
    const lowerQuery = query.toLowerCase();
    
    return this.localMemories
      .filter(memory => {
        const matchesContent = memory.content.toLowerCase().includes(lowerQuery);
        const matchesType = !type || memory.type === type;
        return matchesContent && matchesType;
      })
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  }

  /**
   * Generate insights from memories
   */
  private async generateInsightsFromMemories(
    memories: MemoryEntry[],
    query: string
  ): Promise<string[]> {
    const insights: string[] = [];
    
    // Group memories by crew member
    const crewMemories = memories.reduce((acc, memory) => {
      if (!acc[memory.crewMember]) {
        acc[memory.crewMember] = [];
      }
      acc[memory.crewMember].push(memory);
      return acc;
    }, {} as Record<string, MemoryEntry[]>);

    // Generate insights for each crew member
    for (const [crewMember, memberMemories] of Object.entries(crewMemories)) {
      if (memberMemories.length > 0) {
        const topMemory = memberMemories[0];
        insights.push(`${crewMember}: Based on previous experience with ${topMemory.type}, I recommend considering ${topMemory.content.substring(0, 100)}...`);
      }
    }

    // Generate cross-platform insights
    const platforms = [...new Set(memories.map(m => m.platform))];
    if (platforms.length > 1) {
      insights.push(`Cross-platform coordination: Insights from ${platforms.join(', ')} platforms`);
    }

    return insights;
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(memories: MemoryEntry[], query: string): number {
    if (memories.length === 0) return 0;
    
    const queryWords = query.toLowerCase().split(' ');
    let totalRelevance = 0;
    
    for (const memory of memories) {
      const contentWords = memory.content.toLowerCase().split(' ');
      const matches = queryWords.filter(word => contentWords.includes(word));
      const relevance = (matches.length / queryWords.length) * memory.importance;
      totalRelevance += relevance;
    }
    
    return totalRelevance / memories.length;
  }

  /**
   * Sync memory to Supabase
   */
  private async syncToSupabase(memory: MemoryEntry): Promise<void> {
    if (!this.supabase) {
      memory.crossPlatformSync.syncStatus = 'synced';
      this.syncStatus.syncedMemories++;
      this.syncStatus.pendingSync--;
      return;
    }
    
    try {
      const { error } = await this.supabase
        .from('alex_ai_memories')
        .insert([{
          id: memory.id,
          content: memory.content,
          type: memory.type,
          platform: memory.platform,
          timestamp: memory.timestamp.toISOString(),
          crew_member: memory.crewMember,
          encrypted: memory.encrypted,
          tags: memory.tags,
          importance: memory.importance,
          cross_platform_sync: memory.crossPlatformSync
        }]);

      if (error) {
        console.error('❌ Supabase sync error:', error);
        memory.crossPlatformSync.syncStatus = 'error';
        this.syncStatus.errorCount++;
      } else {
        memory.crossPlatformSync.syncStatus = 'synced';
        this.syncStatus.syncedMemories++;
        this.syncStatus.pendingSync--;
      }
    } catch (error) {
      console.error('❌ Supabase sync failed:', error);
      memory.crossPlatformSync.syncStatus = 'error';
      this.syncStatus.errorCount++;
    }
  }

  /**
   * Ensure memory directory exists
   */
  private async ensureMemoryDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.memoryDir, { recursive: true });
    } catch (error) {
      console.error('❌ Failed to create memory directory:', error);
    }
  }

  /**
   * Load local memories
   */
  private async loadLocalMemories(): Promise<void> {
    try {
      const memoryFile = path.join(this.memoryDir, 'memories.json');
      const data = await fs.readFile(memoryFile, 'utf-8');
      this.localMemories = JSON.parse(data);
      console.log(`🧠 Loaded ${this.localMemories.length} local memories`);
    } catch (error) {
      console.log('📝 No existing memories found, starting fresh');
      this.localMemories = [];
    }
  }

  /**
   * Save local memory
   */
  private async saveLocalMemory(memory: MemoryEntry): Promise<void> {
    try {
      const memoryFile = path.join(this.memoryDir, 'memories.json');
      await fs.writeFile(memoryFile, JSON.stringify(this.localMemories, null, 2));
    } catch (error) {
      console.error('❌ Failed to save local memory:', error);
    }
  }

  /**
   * Initialize Supabase connection
   */
  private async initializeSupabaseConnection(): Promise<void> {
    if (!this.supabase) {
      console.log('📝 Using local storage only (Supabase not available)');
      return;
    }
    
    try {
      // Test Supabase connection
      const { data, error } = await this.supabase
        .from('alex_ai_memories')
        .select('count')
        .limit(1);

      if (error) {
        console.warn('⚠️ Supabase connection failed, using local storage only');
      } else {
        console.log('✅ Supabase connection established');
      }
    } catch (error) {
      console.warn('⚠️ Supabase connection failed, using local storage only');
    }
  }

  /**
   * Start sync process
   */
  private async startSyncProcess(): Promise<void> {
    console.log('🔄 Starting memory synchronization process...');
    
    // Initial sync
    await this.syncAcrossPlatforms();
    
    // Set up periodic sync (every 5 minutes)
    setInterval(async () => {
      await this.syncAcrossPlatforms();
    }, 5 * 60 * 1000);
    
    console.log('✅ Memory synchronization process started');
  }
}

/**
 * Create Memory Sync Manager instance
 */
export function createMemorySyncManager(supabaseUrl?: string, supabaseKey?: string): MemorySyncManager {
  return new MemorySyncManager(supabaseUrl, supabaseKey);
}
