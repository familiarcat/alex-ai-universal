/**
 * N8N Supabase Client - Routes all Supabase operations through N8N middleware
 * 
 * This client ensures all Supabase interactions are managed by the N8N middleware layer,
 * providing centralized security, audit trails, and compliance with the Prime Directive.
 */

export interface SupabaseOperationRequest {
  operation: 'insert' | 'update' | 'delete' | 'select' | 'upsert' | 'batch_insert' | 'batch_update' | 'batch_delete';
  table: string;
  data?: any;
  filters?: Record<string, any>;
  options?: Record<string, any>;
  source?: string;
  userId?: string;
  sessionId?: string;
}

export interface SupabaseOperationResponse {
  success: boolean;
  operation: string;
  table: string;
  result?: any;
  metadata: {
    affected_rows: number;
    timestamp: string;
    requestId: string;
    source: string;
  };
  security: {
    audit_trail: any;
    compliance: string;
    data_protection: string;
  };
  n8n_workflow: {
    name: string;
    version: string;
    execution_id: string;
  };
}

export class N8NSupabaseClient {
  private n8nBaseUrl: string;
  private webhookPath: string;
  private defaultSource: string;

  constructor(n8nBaseUrl: string = 'http://localhost:5678', webhookPath: string = 'webhook/supabase-operation') {
    this.n8nBaseUrl = n8nBaseUrl;
    this.webhookPath = webhookPath;
    this.defaultSource = 'alex-ai-universal';
  }

  /**
   * Execute a Supabase operation through N8N middleware
   */
  async executeOperation(request: SupabaseOperationRequest): Promise<SupabaseOperationResponse> {
    const fullRequest = {
      ...request,
      source: request.source || this.defaultSource,
      userId: request.userId || 'system',
      sessionId: request.sessionId || 'default'
    };

    try {
      const response = await fetch(`${this.n8nBaseUrl}/${this.webhookPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'alex-ai-universal',
          'X-Security-Compliance': 'PRIME_DIRECTIVE_ENFORCED'
        },
        body: JSON.stringify(fullRequest)
      });

      if (!response.ok) {
        throw new Error(`N8N middleware request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Supabase operation failed: ${result.message || 'Unknown error'}`);
      }

      return result;
    } catch (error) {
      console.error('❌ N8N Supabase operation failed:', error);
      throw error;
    }
  }

  /**
   * Insert data into a Supabase table
   */
  async insert(table: string, data: any, options?: Record<string, any>): Promise<SupabaseOperationResponse> {
    return this.executeOperation({
      operation: 'insert',
      table,
      data,
      options
    });
  }

  /**
   * Upsert data into a Supabase table
   */
  async upsert(table: string, data: any, options?: Record<string, any>): Promise<SupabaseOperationResponse> {
    return this.executeOperation({
      operation: 'upsert',
      table,
      data,
      options
    });
  }

  /**
   * Update data in a Supabase table
   */
  async update(table: string, data: any, filters: Record<string, any>, options?: Record<string, any>): Promise<SupabaseOperationResponse> {
    return this.executeOperation({
      operation: 'update',
      table,
      data,
      filters,
      options
    });
  }

  /**
   * Delete data from a Supabase table
   */
  async delete(table: string, filters: Record<string, any>, options?: Record<string, any>): Promise<SupabaseOperationResponse> {
    return this.executeOperation({
      operation: 'delete',
      table,
      filters,
      options
    });
  }

  /**
   * Select data from a Supabase table
   */
  async select(table: string, filters?: Record<string, any>, options?: Record<string, any>): Promise<SupabaseOperationResponse> {
    return this.executeOperation({
      operation: 'select',
      table,
      filters,
      options
    });
  }

  /**
   * Batch insert data into a Supabase table
   */
  async batchInsert(table: string, data: any[], options?: Record<string, any>): Promise<SupabaseOperationResponse> {
    return this.executeOperation({
      operation: 'batch_insert',
      table,
      data,
      options
    });
  }

  /**
   * Batch update data in a Supabase table
   */
  async batchUpdate(table: string, data: any[], filters: Record<string, any>, options?: Record<string, any>): Promise<SupabaseOperationResponse> {
    return this.executeOperation({
      operation: 'batch_update',
      table,
      data,
      filters,
      options
    });
  }

  /**
   * Batch delete data from a Supabase table
   */
  async batchDelete(table: string, filters: Record<string, any>, options?: Record<string, any>): Promise<SupabaseOperationResponse> {
    return this.executeOperation({
      operation: 'batch_delete',
      table,
      filters,
      options
    });
  }

  /**
   * Save Alex AI memory through N8N middleware
   */
  async saveMemory(memory: {
    content: string;
    type: string;
    metadata?: Record<string, any>;
    embeddings?: number[];
    relationships?: string[];
  }): Promise<SupabaseOperationResponse> {
    const memoryData = {
      content: memory.content,
      type: memory.type,
      metadata: memory.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source: this.defaultSource
    };

    const response = await this.insert('alex_ai_memories', memoryData);
    
    // If embeddings are provided, save them separately
    if (memory.embeddings && memory.embeddings.length > 0) {
      await this.insert('alex_ai_memory_embeddings', {
        memory_id: response.result?.id,
        embeddings: memory.embeddings,
        created_at: new Date().toISOString()
      });
    }

    // If relationships are provided, save them separately
    if (memory.relationships && memory.relationships.length > 0) {
      const relationshipData = memory.relationships.map(relatedId => ({
        source_memory_id: response.result?.id,
        target_memory_id: relatedId,
        relationship_type: 'related',
        created_at: new Date().toISOString()
      }));

      await this.batchInsert('alex_ai_memory_relationships', relationshipData);
    }

    return response;
  }

  /**
   * Retrieve Alex AI memories through N8N middleware
   */
  async getMemories(filters?: Record<string, any>, options?: Record<string, any>): Promise<SupabaseOperationResponse> {
    return this.select('alex_ai_memories', filters, options);
  }

  /**
   * Update Alex AI memory through N8N middleware
   */
  async updateMemory(id: string, updates: Record<string, any>): Promise<SupabaseOperationResponse> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.update('alex_ai_memories', updateData, { id });
  }

  /**
   * Delete Alex AI memory through N8N middleware
   */
  async deleteMemory(id: string): Promise<SupabaseOperationResponse> {
    // First delete related embeddings and relationships
    await this.delete('alex_ai_memory_embeddings', { memory_id: id });
    await this.delete('alex_ai_memory_relationships', { source_memory_id: id });
    
    // Then delete the memory itself
    return this.delete('alex_ai_memories', { id });
  }

  /**
   * Log crew activity through N8N middleware
   */
  async logCrewActivity(activity: {
    crewMember: string;
    action: string;
    details?: Record<string, any>;
    projectId?: string;
  }): Promise<SupabaseOperationResponse> {
    const activityData = {
      crew_member: activity.crewMember,
      action: activity.action,
      details: activity.details || {},
      project_id: activity.projectId || null,
      timestamp: new Date().toISOString(),
      source: this.defaultSource
    };

    return this.insert('alex_ai_crew_activities', activityData);
  }

  /**
   * Get crew activities through N8N middleware
   */
  async getCrewActivities(filters?: Record<string, any>, options?: Record<string, any>): Promise<SupabaseOperationResponse> {
    return this.select('alex_ai_crew_activities', filters, options);
  }

  /**
   * Save project configuration through N8N middleware
   */
  async saveProjectConfig(config: {
    projectId: string;
    config: Record<string, any>;
    version?: string;
  }): Promise<SupabaseOperationResponse> {
    const configData = {
      project_id: config.projectId,
      config: config.config,
      version: config.version || '1.0.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source: this.defaultSource
    };

    return this.upsert('alex_ai_project_configs', configData, { 
      onConflict: 'project_id',
      ignoreDuplicates: false 
    });
  }

  /**
   * Get project configuration through N8N middleware
   */
  async getProjectConfig(projectId: string): Promise<SupabaseOperationResponse> {
    return this.select('alex_ai_project_configs', { project_id: projectId });
  }

  /**
   * Update sync status through N8N middleware
   */
  async updateSyncStatus(status: {
    component: string;
    status: string;
    details?: Record<string, any>;
    lastSync?: string;
  }): Promise<SupabaseOperationResponse> {
    const statusData = {
      component: status.component,
      status: status.status,
      details: status.details || {},
      last_sync: status.lastSync || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source: this.defaultSource
    };

    return this.upsert('alex_ai_sync_status', statusData, {
      onConflict: 'component',
      ignoreDuplicates: false
    });
  }

  /**
   * Get sync status through N8N middleware
   */
  async getSyncStatus(component?: string): Promise<SupabaseOperationResponse> {
    const filters = component ? { component } : {};
    return this.select('alex_ai_sync_status', filters);
  }

  /**
   * Log security audit event through N8N middleware
   */
  async logSecurityAudit(audit: {
    event: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details?: Record<string, any>;
    source?: string;
  }): Promise<SupabaseOperationResponse> {
    const auditData = {
      event: audit.event,
      severity: audit.severity,
      details: audit.details || {},
      source: audit.source || this.defaultSource,
      timestamp: new Date().toISOString(),
      compliance: 'PRIME_DIRECTIVE_ENFORCED'
    };

    return this.insert('alex_ai_security_audits', auditData);
  }

  /**
   * Get security audit logs through N8N middleware
   */
  async getSecurityAudits(filters?: Record<string, any>, options?: Record<string, any>): Promise<SupabaseOperationResponse> {
    return this.select('alex_ai_security_audits', filters, options);
  }

  /**
   * Test N8N middleware connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test with a simple select operation
      const response = await this.select('alex_ai_sync_status', {}, { limit: 1 });
      return response.success;
    } catch (error) {
      console.error('❌ N8N middleware connection test failed:', error);
      return false;
    }
  }

  /**
   * Get connection status and health
   */
  async getConnectionStatus(): Promise<{
    connected: boolean;
    n8nUrl: string;
    lastTest: string;
    error?: string;
  }> {
    const lastTest = new Date().toISOString();
    
    try {
      const connected = await this.testConnection();
      return {
        connected,
        n8nUrl: this.n8nBaseUrl,
        lastTest,
        error: connected ? undefined : 'Connection test failed'
      };
    } catch (error) {
      return {
        connected: false,
        n8nUrl: this.n8nBaseUrl,
        lastTest,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Export singleton instance
export const n8nSupabaseClient = new N8NSupabaseClient();
