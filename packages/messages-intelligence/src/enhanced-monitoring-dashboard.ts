/**
 * Alex AI Enhanced Monitoring Dashboard
 * 
 * This module extends n8n.pbradygeorgen.com/dashboard with Alex AI specific
 * functionality for bidirectional RAG monitoring and crew AI management.
 */

import { BidirectionalRAGIntegration, RAGMemory } from './bidirectional-rag-integration';
import { CrewMultimodalAnalysis, CrewAnalysisResult } from './crew-multimodal-analysis';

export interface DashboardConfig {
  n8nBaseUrl: string;
  dashboardUrl: string;
  apiKey: string;
  refreshInterval: number;
  enableRealTimeUpdates: boolean;
  enableCrewAI: boolean;
  enableWorkflowSync: boolean;
}

export interface SystemMetrics {
  ragIntegration: {
    isOnline: boolean;
    queuedOperations: number;
    lastSync: Date | null;
    memoryCount: number;
    syncErrors: number;
  };
  n8nWorkflows: {
    totalWorkflows: number;
    activeWorkflows: number;
    lastModified: Date | null;
    syncStatus: 'synced' | 'pending' | 'error';
  };
  crewAI: {
    activeMembers: number;
    recentAnalyses: number;
    averageConfidence: number;
    lastEngagement: Date | null;
  };
  workspace: {
    currentProject: string;
    lastSync: Date | null;
    pendingChanges: number;
    syncStatus: 'synced' | 'syncing' | 'error';
  };
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'status' | 'crew';
  data: any;
  position: { x: number; y: number; width: number; height: number };
  refreshInterval?: number;
}

export class EnhancedMonitoringDashboard {
  private ragIntegration: BidirectionalRAGIntegration;
  private crewAnalysis: CrewMultimodalAnalysis;
  private config: DashboardConfig;
  private metrics: SystemMetrics;
  private widgets: Map<string, DashboardWidget>;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(
    ragIntegration: BidirectionalRAGIntegration,
    crewAnalysis: CrewMultimodalAnalysis,
    config: DashboardConfig
  ) {
    this.ragIntegration = ragIntegration;
    this.crewAnalysis = crewAnalysis;
    this.config = config;
    this.metrics = this.initializeMetrics();
    this.widgets = new Map();
    this.initializeDashboard();
  }

  /**
   * Initialize dashboard with default widgets
   */
  private initializeDashboard(): void {
    console.log('🖖 Initializing Alex AI Enhanced Monitoring Dashboard...');

    // Create default widgets
    this.createDefaultWidgets();

    // Start real-time updates if enabled
    if (this.config.enableRealTimeUpdates) {
      this.startRealTimeUpdates();
    }

    console.log('✅ Enhanced Monitoring Dashboard ready');
  }

  /**
   * Initialize system metrics
   */
  private initializeMetrics(): SystemMetrics {
    return {
      ragIntegration: {
        isOnline: false,
        queuedOperations: 0,
        lastSync: null,
        memoryCount: 0,
        syncErrors: 0
      },
      n8nWorkflows: {
        totalWorkflows: 0,
        activeWorkflows: 0,
        lastModified: null,
        syncStatus: 'pending'
      },
      crewAI: {
        activeMembers: 0,
        recentAnalyses: 0,
        averageConfidence: 0,
        lastEngagement: null
      },
      workspace: {
        currentProject: 'alex-ai-universal',
        lastSync: null,
        pendingChanges: 0,
        syncStatus: 'pending'
      }
    };
  }

  /**
   * Create default dashboard widgets
   */
  private createDefaultWidgets(): void {
    const defaultWidgets: DashboardWidget[] = [
      {
        id: 'rag-status',
        title: 'RAG Integration Status',
        type: 'status',
        data: {
          status: 'offline',
          message: 'Initializing...'
        },
        position: { x: 0, y: 0, width: 4, height: 2 }
      },
      {
        id: 'memory-metrics',
        title: 'Memory System Metrics',
        type: 'metric',
        data: {
          totalMemories: 0,
          recentMemories: 0,
          memoryTypes: {}
        },
        position: { x: 4, y: 0, width: 4, height: 2 }
      },
      {
        id: 'n8n-workflows',
        title: 'N8N Workflow Status',
        type: 'table',
        data: {
          headers: ['Name', 'Status', 'Last Modified', 'Sync Status'],
          rows: []
        },
        position: { x: 8, y: 0, width: 4, height: 2 }
      },
      {
        id: 'crew-ai-status',
        title: 'Crew AI Members',
        type: 'crew',
        data: {
          members: [],
          recentActivity: []
        },
        position: { x: 0, y: 2, width: 6, height: 4 }
      },
      {
        id: 'workspace-sync',
        title: 'Workspace Synchronization',
        type: 'status',
        data: {
          status: 'pending',
          message: 'Waiting for sync...'
        },
        position: { x: 6, y: 2, width: 6, height: 2 }
      },
      {
        id: 'system-health',
        title: 'System Health Overview',
        type: 'chart',
        data: {
          type: 'line',
          labels: [],
          datasets: [{
            label: 'Sync Operations',
            data: [],
            borderColor: '#00ff00'
          }]
        },
        position: { x: 0, y: 6, width: 12, height: 4 }
      }
    ];

    defaultWidgets.forEach(widget => {
      this.widgets.set(widget.id, widget);
    });
  }

  /**
   * Start real-time updates
   */
  private startRealTimeUpdates(): void {
    this.updateInterval = setInterval(async () => {
      await this.updateMetrics();
      await this.updateWidgets();
      await this.syncWithN8NDashboard();
    }, this.config.refreshInterval);

    console.log('📡 Real-time dashboard updates started');
  }

  /**
   * Update system metrics
   */
  private async updateMetrics(): Promise<void> {
    try {
      // Update RAG integration metrics
      const ragStatus = this.ragIntegration.getStatus();
      this.metrics.ragIntegration = {
        ...this.metrics.ragIntegration,
        isOnline: ragStatus.isOnline,
        queuedOperations: ragStatus.queuedOperations,
        lastSync: ragStatus.lastSync
      };

      // Update crew AI metrics
      const crewMembers = this.crewAnalysis.getAllCrewMembers();
      this.metrics.crewAI = {
        ...this.metrics.crewAI,
        activeMembers: crewMembers.length,
        lastEngagement: new Date()
      };

      // Update workspace metrics
      this.metrics.workspace = {
        ...this.metrics.workspace,
        lastSync: new Date(),
        syncStatus: ragStatus.isOnline ? 'synced' : 'error'
      };

      console.log('📊 System metrics updated');
    } catch (error) {
      console.error('❌ Failed to update metrics:', error);
    }
  }

  /**
   * Update dashboard widgets
   */
  private async updateWidgets(): Promise<void> {
    try {
      // Update RAG status widget
      const ragWidget = this.widgets.get('rag-status');
      if (ragWidget) {
        ragWidget.data = {
          status: this.metrics.ragIntegration.isOnline ? 'online' : 'offline',
          message: this.metrics.ragIntegration.isOnline 
            ? `Last sync: ${this.metrics.ragIntegration.lastSync?.toLocaleTimeString()}` 
            : 'Offline - queued operations will sync when online',
          queuedOperations: this.metrics.ragIntegration.queuedOperations
        };
      }

      // Update memory metrics widget
      const memoryWidget = this.widgets.get('memory-metrics');
      if (memoryWidget) {
        const memories = await this.ragIntegration.retrieveRelevantMemories('', 100);
        memoryWidget.data = {
          totalMemories: memories.length,
          recentMemories: memories.filter(m => 
            new Date(m.metadata.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          ).length,
          memoryTypes: memories.reduce((acc, memory) => {
            acc[memory.memoryType] = (acc[memory.memoryType] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        };
      }

      // Update crew AI widget
      const crewWidget = this.widgets.get('crew-ai-status');
      if (crewWidget) {
        const crewMembers = this.crewAnalysis.getAllCrewMembers();
        crewWidget.data = {
          members: crewMembers.map(member => ({
            name: member.name,
            role: member.role,
            status: 'active',
            lastActivity: new Date().toISOString()
          })),
          recentActivity: await this.getRecentCrewActivity()
        };
      }

      // Update workspace sync widget
      const workspaceWidget = this.widgets.get('workspace-sync');
      if (workspaceWidget) {
        workspaceWidget.data = {
          status: this.metrics.workspace.syncStatus,
          message: this.metrics.workspace.syncStatus === 'synced' 
            ? `Last sync: ${this.metrics.workspace.lastSync?.toLocaleTimeString()}`
            : 'Sync in progress...',
          pendingChanges: this.metrics.workspace.pendingChanges
        };
      }

      console.log('🔄 Dashboard widgets updated');
    } catch (error) {
      console.error('❌ Failed to update widgets:', error);
    }
  }

  /**
   * Get recent crew activity
   */
  private async getRecentCrewActivity(): Promise<any[]> {
    try {
      const recentMemories = await this.ragIntegration.retrieveRelevantMemories('', 10);
      return recentMemories
        .filter(memory => memory.metadata.crewMember)
        .map(memory => ({
          crewMember: memory.metadata.crewMember,
          activity: memory.memoryType,
          timestamp: memory.metadata.timestamp,
          confidence: memory.metadata.confidence
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
    } catch (error) {
      console.error('❌ Failed to get recent crew activity:', error);
      return [];
    }
  }

  /**
   * Sync with N8N dashboard
   */
  private async syncWithN8NDashboard(): Promise<void> {
    try {
      // Get current dashboard configuration from N8N
      const response = await fetch(`${this.config.n8nBaseUrl}/api/dashboard/config`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`N8N dashboard sync failed: ${response.statusText}`);
      }

      const n8nConfig = await response.json();

      // Merge Alex AI widgets with N8N dashboard
      const enhancedConfig = {
        ...n8nConfig,
        alexAI: {
          widgets: Array.from(this.widgets.values()),
          metrics: this.metrics,
          lastUpdate: new Date().toISOString()
        }
      };

      // Update N8N dashboard with enhanced configuration
      await fetch(`${this.config.n8nBaseUrl}/api/dashboard/config`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(enhancedConfig)
      });

      console.log('🔄 N8N dashboard synced with Alex AI enhancements');
    } catch (error) {
      console.error('❌ Failed to sync with N8N dashboard:', error);
    }
  }

  /**
   * Create custom widget
   */
  createCustomWidget(widget: DashboardWidget): void {
    this.widgets.set(widget.id, widget);
    console.log(`✅ Custom widget created: ${widget.title}`);
  }

  /**
   * Update widget data
   */
  updateWidgetData(widgetId: string, data: any): void {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      widget.data = { ...widget.data, ...data };
      console.log(`🔄 Widget updated: ${widget.title}`);
    }
  }

  /**
   * Get dashboard configuration for N8N
   */
  getDashboardConfig(): any {
    return {
      widgets: Array.from(this.widgets.values()),
      metrics: this.metrics,
      config: this.config,
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(): SystemMetrics {
    return this.metrics;
  }

  /**
   * Get widget by ID
   */
  getWidget(widgetId: string): DashboardWidget | undefined {
    return this.widgets.get(widgetId);
  }

  /**
   * Get all widgets
   */
  getAllWidgets(): DashboardWidget[] {
    return Array.from(this.widgets.values());
  }

  /**
   * Stop real-time updates
   */
  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('⏹️ Real-time dashboard updates stopped');
    }
  }

  /**
   * Generate dashboard HTML for embedding
   */
  generateDashboardHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alex AI Enhanced Monitoring Dashboard</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #0a0a0a; color: #00ff00; }
        .dashboard { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; }
        .widget { background: #1a1a1a; border: 1px solid #00ff00; border-radius: 8px; padding: 15px; }
        .widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .widget-title { font-size: 18px; font-weight: bold; color: #00ff00; }
        .status-online { color: #00ff00; }
        .status-offline { color: #ff0000; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .crew-member { display: flex; justify-content: space-between; align-items: center; padding: 8px; background: #2a2a2a; margin: 5px 0; border-radius: 4px; }
        .chart { height: 200px; background: #2a2a2a; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
    </style>
</head>
<body>
    <h1>🖖 Alex AI Enhanced Monitoring Dashboard</h1>
    <div class="dashboard" id="dashboard">
        <!-- Widgets will be dynamically generated here -->
    </div>
    
    <script>
        // Dashboard JavaScript for real-time updates
        const dashboard = document.getElementById('dashboard');
        
        function updateDashboard() {
            fetch('/api/dashboard/config')
                .then(response => response.json())
                .then(data => {
                    renderWidgets(data.alexAI.widgets);
                })
                .catch(error => console.error('Dashboard update failed:', error));
        }
        
        function renderWidgets(widgets) {
            dashboard.innerHTML = '';
            widgets.forEach(widget => {
                const widgetElement = document.createElement('div');
                widgetElement.className = 'widget';
                widgetElement.style.gridColumn = \`span \${widget.position.width}\`;
                widgetElement.style.gridRow = \`span \${widget.position.height}\`;
                
                widgetElement.innerHTML = \`
                    <div class="widget-header">
                        <div class="widget-title">\${widget.title}</div>
                        <div class="widget-status">\${widget.data.status || 'active'}</div>
                    </div>
                    <div class="widget-content">
                        \${renderWidgetContent(widget)}
                    </div>
                \`;
                
                dashboard.appendChild(widgetElement);
            });
        }
        
        function renderWidgetContent(widget) {
            switch(widget.type) {
                case 'status':
                    return \`<div class="status-\${widget.data.status}">\${widget.data.message}</div>\`;
                case 'metric':
                    return Object.entries(widget.data).map(([key, value]) => 
                        \`<div class="metric"><span>\${key}:</span><span>\${value}</span></div>\`
                    ).join('');
                case 'crew':
                    return widget.data.members.map(member => 
                        \`<div class="crew-member">
                            <span>\${member.name}</span>
                            <span class="status-\${member.status}">\${member.status}</span>
                        </div>\`
                    ).join('');
                default:
                    return '<div>Widget content</div>';
            }
        }
        
        // Update dashboard every 5 seconds
        setInterval(updateDashboard, 5000);
        updateDashboard(); // Initial load
    </script>
</body>
</html>
    `;
  }
}
