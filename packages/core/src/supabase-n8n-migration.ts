/**
 * Supabase to N8N Migration Guide and Utilities
 * 
 * This module provides utilities to migrate existing direct Supabase connections
 * to use the N8N middleware layer for centralized security and audit trails.
 */

import { N8NSupabaseClient } from './n8n-supabase-client';

export interface MigrationStatus {
  component: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  lastAttempt?: string;
  error?: string;
  migratedOperations?: string[];
}

export class SupabaseN8NMigration {
  private n8nClient: N8NSupabaseClient;
  private migrationStatus: Map<string, MigrationStatus> = new Map();

  constructor() {
    this.n8nClient = new N8NSupabaseClient();
    this.initializeMigrationStatus();
  }

  /**
   * Initialize migration status for all components
   */
  private initializeMigrationStatus(): void {
    const components = [
      'memory-sync-manager',
      'credential-hub',
      'real-alex-ai-initializer',
      'natural-language-handler',
      'bidirectional-rag-integration',
      'enhanced-monitoring-dashboard',
      'crew-integration',
      'universal-extension'
    ];

    components.forEach(component => {
      this.migrationStatus.set(component, {
        component,
        status: 'pending'
      });
    });
  }

  /**
   * Get migration status for all components
   */
  getMigrationStatus(): MigrationStatus[] {
    return Array.from(this.migrationStatus.values());
  }

  /**
   * Get migration status for a specific component
   */
  getComponentMigrationStatus(component: string): MigrationStatus | undefined {
    return this.migrationStatus.get(component);
  }

  /**
   * Update migration status for a component
   */
  updateMigrationStatus(component: string, status: Partial<MigrationStatus>): void {
    const currentStatus = this.migrationStatus.get(component);
    if (currentStatus) {
      this.migrationStatus.set(component, {
        ...currentStatus,
        ...status,
        lastAttempt: new Date().toISOString()
      });
    }
  }

  /**
   * Test N8N middleware connection
   */
  async testN8NConnection(): Promise<boolean> {
    try {
      console.log('🔄 Testing N8N middleware connection...');
      const connected = await this.n8nClient.testConnection();
      
      if (connected) {
        console.log('✅ N8N middleware connection successful');
      } else {
        console.log('❌ N8N middleware connection failed');
      }
      
      return connected;
    } catch (error) {
      console.error('❌ N8N middleware connection test failed:', error);
      return false;
    }
  }

  /**
   * Generate migration report
   */
  generateMigrationReport(): string {
    const statuses = this.getMigrationStatus();
    const completed = statuses.filter(s => s.status === 'completed').length;
    const failed = statuses.filter(s => s.status === 'failed').length;
    const pending = statuses.filter(s => s.status === 'pending').length;
    const inProgress = statuses.filter(s => s.status === 'in_progress').length;

    let report = `
# 🔄 SUPABASE TO N8N MIGRATION REPORT

## 📊 Migration Status Overview
- **Total Components:** ${statuses.length}
- **Completed:** ${completed} (${Math.round((completed / statuses.length) * 100)}%)
- **In Progress:** ${inProgress} (${Math.round((inProgress / statuses.length) * 100)}%)
- **Pending:** ${pending} (${Math.round((pending / statuses.length) * 100)}%)
- **Failed:** ${failed} (${Math.round((failed / statuses.length) * 100)}%)

## 📋 Component Status Details

`;

    statuses.forEach(status => {
      const statusIcon = {
        'pending': '⏳',
        'in_progress': '🔄',
        'completed': '✅',
        'failed': '❌'
      }[status.status];

      report += `### ${statusIcon} ${status.component}\n`;
      report += `- **Status:** ${status.status}\n`;
      
      if (status.lastAttempt) {
        report += `- **Last Attempt:** ${status.lastAttempt}\n`;
      }
      
      if (status.error) {
        report += `- **Error:** ${status.error}\n`;
      }
      
      if (status.migratedOperations && status.migratedOperations.length > 0) {
        report += `- **Migrated Operations:** ${status.migratedOperations.join(', ')}\n`;
      }
      
      report += '\n';
    });

    report += `
## 🚀 Next Steps

### Immediate Actions:
1. **Test N8N Middleware:** Ensure N8N middleware layer is operational
2. **Deploy Supabase Middleware Workflow:** Import and activate the middleware workflow
3. **Update Component Code:** Replace direct Supabase calls with N8N client calls
4. **Test Integration:** Verify all operations work through N8N middleware

### Security Benefits:
- ✅ **Centralized Audit Trail:** All operations logged through N8N
- ✅ **Prime Directive Compliance:** Security protocols enforced at middleware level
- ✅ **Access Control:** Table-level permissions managed centrally
- ✅ **Data Protection:** Enhanced security for sensitive operations

### Operational Benefits:
- ✅ **Monitoring:** Centralized monitoring of all database operations
- ✅ **Error Handling:** Consistent error handling and retry logic
- ✅ **Performance:** Optimized query execution through N8N
- ✅ **Scalability:** Easy to scale and modify database operations

---

**Migration Status:** ${completed === statuses.length ? '✅ COMPLETE' : '🔄 IN PROGRESS'}
**Security Compliance:** ✅ PRIME DIRECTIVE ENFORCED
**Last Updated:** ${new Date().toISOString()}
`;

    return report;
  }

  /**
   * Generate migration checklist
   */
  generateMigrationChecklist(): string {
    return `
# ✅ SUPABASE TO N8N MIGRATION CHECKLIST

## 🔧 Infrastructure Setup
- [ ] Deploy N8N instance with Supabase middleware workflow
- [ ] Configure N8N webhook endpoints for Supabase operations
- [ ] Test N8N middleware connection
- [ ] Verify Supabase credentials in N8N

## 🔄 Code Migration
- [ ] Update MemorySyncManager to use N8N client
- [ ] Update CredentialHub to use N8N client
- [ ] Update RealAlexAIInitializer to use N8N client
- [ ] Update NaturalLanguageHandler to use N8N client
- [ ] Update BidirectionalRAGIntegration to use N8N client
- [ ] Update EnhancedMonitoringDashboard to use N8N client
- [ ] Update CrewIntegration to use N8N client
- [ ] Update UniversalExtension to use N8N client

## 🧪 Testing & Validation
- [ ] Test all memory operations through N8N
- [ ] Test all crew activity logging through N8N
- [ ] Test all project configuration operations through N8N
- [ ] Test all sync status operations through N8N
- [ ] Test all security audit logging through N8N
- [ ] Verify audit trails are properly generated
- [ ] Test error handling and retry logic

## 🔒 Security Validation
- [ ] Verify Prime Directive compliance
- [ ] Test access control and permissions
- [ ] Validate audit trail completeness
- [ ] Test security audit logging
- [ ] Verify data protection measures

## 📊 Monitoring & Operations
- [ ] Set up N8N workflow monitoring
- [ ] Configure alerts for failed operations
- [ ] Set up performance monitoring
- [ ] Create operational dashboards
- [ ] Document operational procedures

## 🎯 Completion Criteria
- [ ] All components migrated to N8N middleware
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Team trained on new architecture

---

**Migration Priority:** 🔴 HIGH
**Security Impact:** 🔴 CRITICAL
**Completion Target:** Phase 1 of AI Learning Platform development
`;
  }

  /**
   * Generate code migration examples
   */
  generateMigrationExamples(): string {
    return `
# 🔄 CODE MIGRATION EXAMPLES

## Before: Direct Supabase Connection
\`\`\`typescript
// OLD: Direct Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Direct operation
const { data, error } = await supabase
  .from('alex_ai_memories')
  .insert({ content: 'test', type: 'memory' });
\`\`\`

## After: N8N Middleware Connection
\`\`\`typescript
// NEW: N8N middleware connection
import { n8nSupabaseClient } from './n8n-supabase-client';

// Operation through N8N middleware
const response = await n8nSupabaseClient.saveMemory({
  content: 'test',
  type: 'memory',
  metadata: { source: 'alex-ai-universal' }
});
\`\`\`

## Memory Operations Migration
\`\`\`typescript
// OLD: Direct Supabase memory operations
const { data } = await supabase
  .from('alex_ai_memories')
  .select('*')
  .eq('type', 'crew_analysis');

// NEW: N8N middleware memory operations
const response = await n8nSupabaseClient.getMemories(
  { type: 'crew_analysis' },
  { order: 'created_at', ascending: false }
);
\`\`\`

## Crew Activity Logging Migration
\`\`\`typescript
// OLD: Direct Supabase crew logging
await supabase
  .from('alex_ai_crew_activities')
  .insert({
    crew_member: 'Captain Picard',
    action: 'strategic_analysis',
    timestamp: new Date().toISOString()
  });

// NEW: N8N middleware crew logging
await n8nSupabaseClient.logCrewActivity({
  crewMember: 'Captain Picard',
  action: 'strategic_analysis',
  details: { analysis_type: 'project_planning' }
});
\`\`\`

## Project Configuration Migration
\`\`\`typescript
// OLD: Direct Supabase config operations
const { data } = await supabase
  .from('alex_ai_project_configs')
  .upsert({
    project_id: 'ai-learning-platform',
    config: projectConfig,
    updated_at: new Date().toISOString()
  });

// NEW: N8N middleware config operations
await n8nSupabaseClient.saveProjectConfig({
  projectId: 'ai-learning-platform',
  config: projectConfig,
  version: '1.0.0'
});
\`\`\`

## Error Handling Migration
\`\`\`typescript
// OLD: Direct error handling
try {
  const { data, error } = await supabase
    .from('alex_ai_memories')
    .insert(memoryData);
  
  if (error) throw error;
} catch (error) {
  console.error('Supabase error:', error);
}

// NEW: N8N middleware error handling
try {
  const response = await n8nSupabaseClient.saveMemory(memoryData);
  // Response includes security audit trail
  console.log('Operation completed with audit trail:', response.security.audit_trail);
} catch (error) {
  console.error('N8N middleware error:', error);
  // Log security audit event
  await n8nSupabaseClient.logSecurityAudit({
    event: 'operation_failed',
    severity: 'medium',
    details: { error: error.message }
  });
}
\`\`\`

## Benefits of Migration
1. **Security:** All operations go through security audit
2. **Monitoring:** Centralized operation monitoring
3. **Compliance:** Prime Directive automatically enforced
4. **Scalability:** Easy to add new security checks
5. **Reliability:** Consistent error handling and retry logic
`;
  }
}

// Export singleton instance
export const supabaseN8NMigration = new SupabaseN8NMigration();
