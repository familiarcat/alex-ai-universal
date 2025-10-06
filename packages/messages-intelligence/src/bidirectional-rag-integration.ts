/**
 * Alex AI Bidirectional RAG Integration
 * 
 * This module provides controlled Supabase integration for bidirectional
 * RAG functionality with N8N workflow synchronization.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AlexAIMessagesIntelligence } from './index';
import { AnalysisResult, Conversation } from './types';

export interface RAGMemory {
  id?: string;
  projectId: string;
  conversationId: string;
  memoryType: 'constructive' | 'analytical' | 'procedural' | 'contextual';
  content: string;
  metadata: {
    timestamp: Date;
    crewMember?: string;
    confidence: number;
    tags: string[];
    source: string;
  };
  embedding?: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface N8NWorkflowConfig {
  id: string;
  name: string;
  version: string;
  nodes: any[];
  connections: any[];
  settings: any;
  lastModified: Date;
  workspaceId: string;
}

export interface BidirectionalConfig {
  supabaseUrl: string;
  supabaseKey: string;
  n8nWebhookUrl: string;
  n8nApiKey?: string;
  projectId: string;
  workspaceId: string;
  enableMemorySync: boolean;
  enableWorkflowSync: boolean;
  enableRealTimeSync: boolean;
}

export class BidirectionalRAGIntegration {
  private supabase: SupabaseClient;
  private messagesIntelligence: AlexAIMessagesIntelligence;
  private config: BidirectionalConfig;
  private syncQueue: any[] = [];
  private isOnline: boolean = false;

  constructor(config: BidirectionalConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.messagesIntelligence = new AlexAIMessagesIntelligence();
    this.initializeIntegration();
  }

  /**
   * Initialize bidirectional integration
   */
  private async initializeIntegration(): Promise<void> {
    try {
      console.log('🖖 Initializing Alex AI Bidirectional RAG Integration...');
      
      // Test Supabase connection
      const { data, error } = await this.supabase
        .from('rag_memories')
        .select('count')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Supabase connection failed: ${error.message}`);
      }

      this.isOnline = true;
      console.log('✅ Supabase connection established');

      // Initialize real-time subscriptions if enabled
      if (this.config.enableRealTimeSync) {
        await this.initializeRealTimeSync();
      }

      // Process any queued items
      await this.processSyncQueue();

      console.log('🚀 Bidirectional RAG Integration ready');
    } catch (error) {
      console.error('❌ Integration initialization failed:', error);
      this.isOnline = false;
    }
  }

  /**
   * Initialize real-time synchronization
   */
  private async initializeRealTimeSync(): Promise<void> {
    // Subscribe to memory updates
    this.supabase
      .channel('rag_memories_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'rag_memories',
          filter: `project_id=eq.${this.config.projectId}`
        }, 
        (payload) => {
          console.log('📡 Real-time memory update received:', payload);
          this.handleMemoryUpdate(payload);
        }
      )
      .subscribe();

    // Subscribe to N8N workflow changes
    this.supabase
      .channel('n8n_workflows_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'n8n_workflows',
          filter: `workspace_id=eq.${this.config.workspaceId}`
        },
        (payload) => {
          console.log('📡 Real-time workflow update received:', payload);
          this.handleWorkflowUpdate(payload);
        }
      )
      .subscribe();
  }

  /**
   * Store constructive memory in RAG system
   */
  async storeConstructiveMemory(
    conversationId: string,
    analysis: AnalysisResult,
    crewMember?: string
  ): Promise<RAGMemory | null> {
    try {
      const memory: Omit<RAGMemory, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId: this.config.projectId,
        conversationId,
        memoryType: 'constructive',
        content: this.extractConstructiveContent(analysis),
        metadata: {
          timestamp: new Date(),
          crewMember,
          confidence: analysis.confidence || 0.8,
          tags: this.generateMemoryTags(analysis),
          source: 'messages-intelligence'
        }
      };

      if (!this.isOnline) {
        this.syncQueue.push({ type: 'store_memory', data: memory });
        return null;
      }

      const { data, error } = await this.supabase
        .from('rag_memories')
        .insert([memory])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to store memory: ${error.message}`);
      }

      console.log('✅ Constructive memory stored:', data.id);
      
      // Trigger N8N workflow update
      if (this.config.enableWorkflowSync) {
        await this.updateN8NWorkflow('memory_stored', { memory: data });
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to store constructive memory:', error);
      return null;
    }
  }

  /**
   * Retrieve relevant memories for context
   */
  async retrieveRelevantMemories(
    query: string,
    limit: number = 10,
    memoryTypes?: string[]
  ): Promise<RAGMemory[]> {
    try {
      let queryBuilder = this.supabase
        .from('rag_memories')
        .select('*')
        .eq('project_id', this.config.projectId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (memoryTypes && memoryTypes.length > 0) {
        queryBuilder = queryBuilder.in('memory_type', memoryTypes);
      }

      // For now, use text search - can be enhanced with vector similarity
      if (query) {
        queryBuilder = queryBuilder.or(`content.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        throw new Error(`Failed to retrieve memories: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Failed to retrieve memories:', error);
      return [];
    }
  }

  /**
   * Sync N8N workflow configuration
   */
  async syncN8NWorkflow(workflowConfig: N8NWorkflowConfig): Promise<boolean> {
    try {
      if (!this.config.enableWorkflowSync) {
        return false;
      }

      // Store workflow in Supabase
      const { data, error } = await this.supabase
        .from('n8n_workflows')
        .upsert([{
          id: workflowConfig.id,
          name: workflowConfig.name,
          version: workflowConfig.version,
          config: workflowConfig,
          workspace_id: this.config.workspaceId,
          last_modified: workflowConfig.lastModified,
          project_id: this.config.projectId
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to sync workflow: ${error.message}`);
      }

      // Update remote N8N instance
      await this.updateRemoteN8NWorkflow(workflowConfig);

      console.log('✅ N8N workflow synced:', workflowConfig.id);
      return true;
    } catch (error) {
      console.error('❌ Failed to sync N8N workflow:', error);
      return false;
    }
  }

  /**
   * Update remote N8N workflow
   */
  private async updateRemoteN8NWorkflow(workflowConfig: N8NWorkflowConfig): Promise<void> {
    try {
      const response = await fetch(`${this.config.n8nWebhookUrl}/workflows/${workflowConfig.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.n8nApiKey || ''}`
        },
        body: JSON.stringify(workflowConfig)
      });

      if (!response.ok) {
        throw new Error(`N8N update failed: ${response.statusText}`);
      }

      console.log('✅ Remote N8N workflow updated');
    } catch (error) {
      console.error('❌ Failed to update remote N8N workflow:', error);
    }
  }

  /**
   * Extract constructive content from analysis
   */
  private extractConstructiveContent(analysis: AnalysisResult): string {
    const constructiveElements = [
      analysis.keyInsights?.join('; '),
      analysis.actionItems?.join('; '),
      analysis.decisions?.join('; '),
      analysis.lessonsLearned?.join('; ')
    ].filter(Boolean);

    return constructiveElements.join('\n\n');
  }

  /**
   * Generate memory tags from analysis
   */
  private generateMemoryTags(analysis: AnalysisResult): string[] {
    const tags = ['messages-intelligence', 'conversation-analysis'];
    
    if (analysis.sentiment) {
      tags.push(`sentiment-${analysis.sentiment}`);
    }
    
    if (analysis.keyTopics) {
      tags.push(...analysis.keyTopics.map(topic => `topic-${topic.toLowerCase()}`));
    }
    
    if (analysis.crewMember) {
      tags.push(`crew-${analysis.crewMember}`);
    }

    return tags;
  }

  /**
   * Handle real-time memory updates
   */
  private handleMemoryUpdate(payload: any): void {
    console.log('📡 Processing memory update:', payload);
    
    // Trigger local cache update or other actions
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      // Update local memory cache
      this.updateLocalMemoryCache(payload.new);
    }
  }

  /**
   * Handle real-time workflow updates
   */
  private handleWorkflowUpdate(payload: any): void {
    console.log('📡 Processing workflow update:', payload);
    
    // Sync workflow changes to local workspace
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      this.syncWorkflowToLocal(payload.new);
    }
  }

  /**
   * Update local memory cache
   */
  private updateLocalMemoryCache(memory: RAGMemory): void {
    // Implement local memory cache update
    console.log('🔄 Updating local memory cache:', memory.id);
  }

  /**
   * Sync workflow to local workspace
   */
  private syncWorkflowToLocal(workflowData: any): void {
    // Implement local workflow sync
    console.log('🔄 Syncing workflow to local workspace:', workflowData.id);
  }

  /**
   * Process queued sync operations
   */
  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    console.log(`📦 Processing ${this.syncQueue.length} queued operations...`);

    for (const operation of this.syncQueue) {
      try {
        if (operation.type === 'store_memory') {
          await this.storeConstructiveMemory(
            operation.data.conversationId,
            operation.data.analysis,
            operation.data.crewMember
          );
        }
        // Add other operation types as needed
      } catch (error) {
        console.error('❌ Failed to process queued operation:', error);
      }
    }

    this.syncQueue = [];
    console.log('✅ Sync queue processed');
  }

  /**
   * Get integration status
   */
  getStatus(): {
    isOnline: boolean;
    queuedOperations: number;
    lastSync: Date | null;
  } {
    return {
      isOnline: this.isOnline,
      queuedOperations: this.syncQueue.length,
      lastSync: this.isOnline ? new Date() : null
    };
  }
}

