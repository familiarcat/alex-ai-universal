'use client';

/**
 * MCP Main Dashboard
 * 
 * Central hub for MCP system - replaces n8n as primary interface
 * Accessible at mcp.pbradygeorgen.com
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic imports for better performance
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

export default function MCPDashboard() {
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

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
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
      // Load workflow stats
      const workflowsRes = await fetch('/api/mcp/workflows/storage');
      const workflowsData = await workflowsRes.ok ? await workflowsRes.json() : { workflows: [] };
      
      // Load execution stats
      const executionsRes = await fetch('/api/mcp/workflows/executions?limit=100');
      const executionsData = executionsRes.ok ? await executionsRes.json() : { executions: [] };
      
      // Load system status (DDD: Controller Layer → Data Layer)
      const statusRes = await fetch('/api/mcp/status');
      const statusData = statusRes.ok ? await statusRes.json() : { 
        status: 'offline',
        services: {
          localMCP: false,
          remoteMCP: false,
          n8n: false,
          openRouter: false
        }
      };

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
    subtitle?: string;
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
        transition: 'transform 0.2s',
        cursor: link ? 'pointer' : 'default'
      }}
      onMouseEnter={(e) => {
        if (link) e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        if (link) e.currentTarget.style.transform = 'translateY(0)';
      }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          marginBottom: 'var(--spacing-sm)'
        }}>
          <div>
            <div style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--text-muted)',
              marginBottom: 'var(--spacing-xs)'
            }}>
              {title}
            </div>
            <div style={{
              fontSize: 'var(--font-2xl)',
              fontWeight: 'bold',
              color: color,
              marginBottom: subtitle ? 'var(--spacing-xs)' : 0
            }}>
              {value}
            </div>
            {subtitle && (
              <div style={{
                fontSize: 'var(--font-xs)',
                color: 'var(--text-muted)'
              }}>
                {subtitle}
              </div>
            )}
          </div>
          <div style={{
            fontSize: 'var(--font-2xl)'
          }}>
            {icon}
          </div>
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      padding: 'var(--spacing-lg)'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: 'var(--spacing-xl)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-md)'
        }}>
          <div>
            <h1 style={{
              fontSize: 'var(--font-3xl)',
              color: 'var(--accent)',
              margin: 0,
              marginBottom: 'var(--spacing-xs)'
            }}>
              🖖 MCP Dashboard
            </h1>
            <p style={{
              fontSize: 'var(--font-md)',
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
            <div style={{
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--radius-sm)',
              background: stats.system.mcpStatus === 'online' ? '#10b981' : '#ef4444',
              color: 'white',
              fontSize: 'var(--font-xs)',
              fontWeight: 'bold'
            }}>
              MCP: {stats.system.mcpStatus.toUpperCase()}
            </div>
            <div style={{
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--radius-sm)',
              background: stats.system.openRouterStatus === 'online' ? '#10b981' : '#ef4444',
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
          color="#3b82f6"
          link="/workflows"
        />
        <StatCard
          title="Crew Members"
          value={stats.crew.total}
          subtitle={`${stats.crew.active} active`}
          icon="👥"
          color="#10b981"
        />
        <StatCard
          title="Success Rate"
          value={stats.executions.total > 0 
            ? `${Math.round((stats.executions.success / stats.executions.total) * 100)}%`
            : 'N/A'}
          subtitle={`${stats.executions.errors} errors`}
          icon="✅"
          color={stats.executions.total > 0 && (stats.executions.success / stats.executions.total) > 0.9 ? '#10b981' : '#f59e0b'}
        />
      </div>

      {/* Quick Actions */}
      <div style={{
        marginBottom: 'var(--spacing-xl)'
      }}>
        <h2 style={{
          fontSize: 'var(--font-xl)',
          color: 'var(--text)',
          marginBottom: 'var(--spacing-md)'
        }}>
          Quick Actions
        </h2>
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
            color="#8b5cf6"
          />
          <QuickAction
            title="Error Dashboard"
            description="View and resolve errors"
            icon="🚨"
            link="/errors"
            color="#ef4444"
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
                color: stats.system.mcpStatus === 'online' ? '#10b981' : '#ef4444',
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
                color: stats.system.openRouterStatus === 'online' ? '#10b981' : '#ef4444',
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
                color: '#10b981',
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

      {/* Footer Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-md)',
        borderTop: 'var(--border)',
        marginTop: 'var(--spacing-xl)'
      }}>
        <Link href="/workflows" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          Workflows
        </Link>
        <span style={{ color: 'var(--text-muted)' }}>•</span>
        <Link href="/workflows/management" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          Management
        </Link>
        <span style={{ color: 'var(--text-muted)' }}>•</span>
        <Link href="/settings" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          Settings
        </Link>
        <span style={{ color: 'var(--text-muted)' }}>•</span>
        <Link href="/errors" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          Errors
        </Link>
      </div>
    </div>
  );
}

