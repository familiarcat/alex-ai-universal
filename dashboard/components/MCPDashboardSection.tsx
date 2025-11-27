'use client';

/**
 * MCP Dashboard Section Component
 * 
 * Extracted from /mcp page for integration into unified dashboard
 * Provides MCP system stats, quick actions, and system status
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import MCPStatusModal from '@/components/MCPStatusModal';
import DynamicDataDrilldown from '@/components/DynamicDataDrilldown';
import ErrorBoundary from '@/components/ErrorBoundary';
import DesignSystemErrorDisplay from '@/components/DesignSystemErrorDisplay';

// Loading Spinner Component
function LoadingSpinner() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 10) % 360);
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      style={{
        width: '48px',
        height: '48px',
        border: '4px solid var(--border)',
        borderTop: '4px solid var(--accent)',
        borderRadius: '50%',
        marginBottom: '16px',
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.1s linear'
      }}
    />
  );
}

const ExecutionMonitor = dynamic(() => import('@/components/workflows/ExecutionMonitor'), {
  ssr: false
});

interface SystemStats {
  workflows: {
    total: number;
    active: number;
    recent: number;
  };
  executions: {
    total: number;
    running: number;
    success: number;
    errors: number;
  };
  crew: {
    total: number;
    active: number;
  };
  system: {
    mcpStatus: 'online' | 'offline' | 'error';
    openRouterStatus: 'online' | 'offline' | 'error';
    lastUpdate: string;
  };
}

export default function MCPDashboardSection() {
  const [stats, setStats] = useState<SystemStats>({
    workflows: { total: 0, active: 0, recent: 0 },
    executions: { total: 0, running: 0, success: 0, errors: 0 },
    crew: { total: 10, active: 10 },
    system: {
      mcpStatus: 'offline',
      openRouterStatus: 'offline',
      lastUpdate: new Date().toISOString()
    }
  });
  const [loading, setLoading] = useState(true);
  const [formattedTime, setFormattedTime] = useState<string>('');
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
    // Cost optimization: Only poll when tab is visible, increased interval to 60s
    let intervalId: NodeJS.Timeout | null = null;
    
    const setupPolling = () => {
      if (intervalId) clearInterval(intervalId);
      if (!document.hidden) {
        intervalId = setInterval(loadDashboardData, 60000); // 60 seconds when visible
      }
    };
    
    // Initial setup
    setupPolling();
    
    // Pause/resume based on visibility (cost optimization)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } else {
        setupPolling();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Format time only on client to avoid hydration mismatch
  useEffect(() => {
    if (stats.system.lastUpdate) {
      try {
        const date = new Date(stats.system.lastUpdate);
        setFormattedTime(date.toLocaleTimeString());
      } catch (error) {
        setFormattedTime('--:--:--');
      }
    }
  }, [stats.system.lastUpdate]);

  const loadDashboardData = async () => {
    try {
      // Add timeout to prevent hanging (10 seconds per request)
      const timeoutMs = 10000;
      const timeoutPromise = (url: string) => new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs/1000} seconds: ${url}`)), timeoutMs)
      );
      
      // Load workflow stats with timeout
      const workflowsPromise = fetch('/api/mcp/workflows/storage').then(res => 
        res.ok ? res.json() : { workflows: [] }
      );
      const workflowsData = await Promise.race([
        workflowsPromise,
        timeoutPromise('/api/mcp/workflows/storage')
      ]).catch(() => ({ workflows: [] })) as any;
      
      // Load execution stats with timeout
      const executionsPromise = fetch('/api/mcp/workflows/executions?limit=100').then(res => 
        res.ok ? res.json() : { executions: [] }
      );
      const executionsData = await Promise.race([
        executionsPromise,
        timeoutPromise('/api/mcp/workflows/executions')
      ]).catch(() => ({ executions: [] })) as any;
      
      // Load system status with timeout (DDD: Controller Layer → Data Layer)
      const statusPromise = fetch('/api/mcp/status').then(res => 
        res.ok ? res.json() : { 
          status: 'offline',
          services: {
            localMCP: false,
            remoteMCP: false,
            n8n: false,
            openRouter: false
          }
        }
      );
      const statusData = await Promise.race([
        statusPromise,
        timeoutPromise('/api/mcp/status')
      ]).catch(() => ({ 
        status: 'offline',
        services: {
          localMCP: false,
          remoteMCP: false,
          n8n: false,
          openRouter: false
        }
      })) as any;

      const executions = executionsData.executions || [];
      const workflows = workflowsData.workflows || [];

      // DDD: Map API response (source of truth) to UI state
      const mcpStatus = statusData.services?.localMCP || statusData.services?.remoteMCP 
        ? 'online' 
        : 'offline';
      const openRouterStatus = statusData.services?.openRouter 
        ? 'online' 
        : 'offline';

      setStats({
        workflows: {
          total: workflows.length,
          active: workflows.filter((w: any) => w.metadata?.active !== false).length,
          recent: workflows.filter((w: any) => {
            const updated = new Date(w.metadata?.updatedAt || 0);
            return updated > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          }).length
        },
        executions: {
          total: executions.length,
          running: executions.filter((e: any) => e.status === 'running').length,
          success: executions.filter((e: any) => e.status === 'success').length,
          errors: executions.filter((e: any) => e.status === 'error').length
        },
        crew: {
          total: 10,
          active: 10
        },
        system: {
          mcpStatus: mcpStatus,
          openRouterStatus: openRouterStatus,
          lastUpdate: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, link }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: string;
    color: string;
    link?: string;
  }) => {
    const content = (
      <div style={{
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius)',
        border: 'var(--border)',
        background: 'var(--card)',
        transition: 'all 0.2s',
        cursor: link ? 'pointer' : 'default'
      }}
      onMouseEnter={(e) => {
        if (link) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = color;
        }
      }}
      onMouseLeave={(e) => {
        if (link) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }
      }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-xs)'
        }}>
          <span style={{ fontSize: 'var(--font-xl)' }}>{icon}</span>
          <div style={{
            fontSize: 'var(--font-sm)',
            color: 'var(--card-text-muted)',
            fontWeight: 500
          }}>
            {title}
          </div>
        </div>
        <div style={{
          fontSize: 'var(--font-2xl)',
          fontWeight: 'bold',
          color: 'var(--data-point-number)',
          marginBottom: 'var(--spacing-xs)'
        }}>
          {value}
        </div>
        <div style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--card-text-muted)'
        }}>
          {subtitle}
        </div>
      </div>
    );

    if (link) {
      return <Link href={link} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</Link>;
    }
    return content;
  };

  const QuickAction = ({ title, description, icon, link, color }: {
    title: string;
    description: string;
    icon: string;
    link: string;
    color: string;
  }) => (
    <Link
      href={link}
      style={{
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius)',
        border: 'var(--border)',
        background: 'var(--card)',
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <div style={{
        fontSize: 'var(--font-2xl)',
        marginBottom: 'var(--spacing-xs)'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: 'var(--font-md)',
        fontWeight: 'bold',
        color: 'var(--text)',
        marginBottom: 'var(--spacing-xs)'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 'var(--font-sm)',
        color: 'var(--text-muted)'
      }}>
        {description}
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="card" style={{
        padding: '40px 24px',
        border: 'var(--border)',
        borderRadius: 'var(--radius)',
        marginBottom: '30px',
        background: 'var(--card-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
      }}>
        {/* Animated Spinner */}
        <LoadingSpinner />
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '8px' 
        }}>
          <span style={{ fontSize: '28px' }}>🖖</span>
          <h3 style={{ fontSize: '20px', color: 'var(--accent)', margin: 0 }}>
            MCP System Dashboard
          </h3>
        </div>
        <div style={{ 
          color: 'var(--text-muted)', 
          fontSize: '14px',
          textAlign: 'center'
        }}>
          Loading system status and metrics...
        </div>
        <div style={{
          marginTop: '16px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          opacity: 0.7
        }}>
          Checking MCP, OpenRouter, and workflow status...
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '40px' }}>
      {/* MCP System Header */}
      <div className="card" style={{
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius)',
        border: 'var(--border)',
        background: 'var(--card)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-md)',
          flexWrap: 'wrap',
          gap: 'var(--spacing-md)'
        }}>
          <div>
            <h2 style={{
              fontSize: 'var(--font-2xl)',
              color: 'var(--accent)',
              margin: 0,
              marginBottom: 'var(--spacing-xs)'
            }}>
              🖖 MCP System Dashboard
            </h2>
            <p style={{
              fontSize: 'var(--font-sm)',
              color: 'var(--text-muted)',
              margin: 0
            }}>
              Model Context Protocol - Central Control Hub
            </p>
          </div>
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            alignItems: 'center'
          }}>
            <button
              onClick={() => setStatusModalOpen(true)}
              style={{
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                background: stats.system.mcpStatus === 'online' ? 'var(--status-success)' : 'var(--status-error)',
                color: 'white',
                fontSize: 'var(--font-xs)',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              MCP: {stats.system.mcpStatus.toUpperCase()}
              <span style={{ fontSize: '10px', opacity: 0.8 }}>ℹ️</span>
            </button>
            <div style={{
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--radius-sm)',
              background: stats.system.openRouterStatus === 'online' ? 'var(--status-success)' : 'var(--status-error)',
              color: 'white',
              fontSize: 'var(--font-xs)',
              fontWeight: 'bold'
            }}>
              OpenRouter: {stats.system.openRouterStatus.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <StatCard
          title="Total Workflows"
          value={stats.workflows.total}
          subtitle={`${stats.workflows.active} active`}
          icon="📋"
          color="var(--accent)"
          link="/workflows/management"
        />
        <StatCard
          title="Executions"
          value={stats.executions.total}
          subtitle={`${stats.executions.running} running`}
          icon="⚙️"
          color="var(--status-info)"
          link="/workflows"
        />
        <StatCard
          title="Crew Members"
          value={stats.crew.total}
          subtitle={`${stats.crew.active} active`}
          icon="👥"
          color="var(--status-success)"
        />
        <StatCard
          title="Success Rate"
          value={stats.executions.total > 0 
            ? `${Math.round((stats.executions.success / stats.executions.total) * 100)}%`
            : 'N/A'}
          subtitle={`${stats.executions.errors} errors`}
          icon="✅"
          color={stats.executions.total > 0 && (stats.executions.success / stats.executions.total) > 0.9 ? 'var(--status-success)' : 'var(--status-warning)'}
        />
      </div>

      {/* Quick Actions */}
      <div style={{
        marginBottom: 'var(--spacing-xl)'
      }}>
        <h3 style={{
          fontSize: 'var(--font-xl)',
          color: 'var(--text)',
          marginBottom: 'var(--spacing-md)'
        }}>
          Quick Actions
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-md)'
        }}>
          <QuickAction
            title="Create Workflow"
            description="Build a new workflow visually"
            icon="➕"
            link="/workflows"
            color="var(--accent)"
          />
          <QuickAction
            title="Manage Workflows"
            description="View and manage all workflows"
            icon="📋"
            link="/workflows/management"
            color="#3b82f6"
          />
          <QuickAction
            title="System Settings"
            description="Configure MCP and services"
            icon="⚙️"
            link="/settings"
            color="var(--accent)"
          />
          <QuickAction
            title="Error Dashboard"
            description="View and resolve errors"
            icon="🚨"
            link="/errors"
            color="var(--status-error)"
          />
          <QuickAction
            title="Crew Coordination"
            description="Coordinate crew members"
            icon="🖖"
            link="/workflows"
            color="#10b981"
          />
        </div>
      </div>

      {/* Dynamic Data Drilldown - NEW: Smart component generation based on data */}
      <ErrorBoundary
        fallback={
          <DesignSystemErrorDisplay
            error="Failed to render MCP system data"
            title="Data Display Error"
            variant="compact"
          />
        }
      >
        <DynamicDataDrilldown
          data={stats}
          title="🖖 MCP System Data - Dynamic Drilldown"
          initialPath={[{ label: 'MCP Dashboard', path: '/mcp' }]}
        />
      </ErrorBoundary>

      {/* Recent Executions & System Status */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-xl)'
      }}>
        {/* Recent Executions */}
        <div style={{
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--radius)',
          border: 'var(--border)',
          background: 'var(--card)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--spacing-md)'
          }}>
            <h3 style={{
              fontSize: 'var(--font-lg)',
              color: 'var(--text)',
              margin: 0
            }}>
              Recent Executions
            </h3>
            <Link
              href="/workflows"
              style={{
                fontSize: 'var(--font-sm)',
                color: 'var(--accent)',
                textDecoration: 'none'
              }}
            >
              View All →
            </Link>
          </div>
          <div style={{ height: '300px' }}>
            <ExecutionMonitor />
          </div>
        </div>

        {/* System Status */}
        <div style={{
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--radius)',
          border: 'var(--border)',
          background: 'var(--card)'
        }}>
          <h3 style={{
            fontSize: 'var(--font-lg)',
            color: 'var(--text)',
            marginBottom: 'var(--spacing-md)'
          }}>
            System Status
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-sm)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--background)'
            }}>
              <span style={{ color: 'var(--text)' }}>MCP Server</span>
              <span style={{
                color: stats.system.mcpStatus === 'online' ? 'var(--status-success)' : 'var(--status-error)',
                fontWeight: 'bold'
              }}>
                {stats.system.mcpStatus === 'online' ? '✅ Online' : '❌ Offline'}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--background)'
            }}>
              <span style={{ color: 'var(--text)' }}>OpenRouter</span>
              <span style={{
                color: stats.system.openRouterStatus === 'online' ? 'var(--status-success)' : 'var(--status-error)',
                fontWeight: 'bold'
              }}>
                {stats.system.openRouterStatus === 'online' ? '✅ Online' : '❌ Offline'}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--background)'
            }}>
              <span style={{ color: 'var(--text)' }}>Crew System</span>
              <span style={{
                color: 'var(--status-success)',
                fontWeight: 'bold'
              }}>
                ✅ {stats.crew.active} Active
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--background)'
            }}>
              <span style={{ color: 'var(--text)' }}>Last Update</span>
              <span style={{
                color: 'var(--text-muted)',
                fontSize: 'var(--font-xs)'
              }}>
                {formattedTime || '--:--:--'}
              </span>
            </div>
          </div>

          <div style={{
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-sm)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-light)',
            fontSize: 'var(--font-sm)',
            color: 'var(--accent)'
          }}>
            💡 <strong>Tip:</strong> Use the quick actions above to navigate to different sections of the MCP system.
          </div>
        </div>
      </div>

      {/* MCP Status Modal */}
      <MCPStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        currentStatus={stats.system.mcpStatus}
      />
    </div>
  );
}

