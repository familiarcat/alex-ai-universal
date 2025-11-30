'use client';

/**
 * Analytics Dashboard Component
 * 
 * Displays analytics data with standard graphs and router links
 * Uses dashboard-core DataChart component for visualization
 */

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAppState } from '@/lib/state-manager';
import { SimpleChart } from './SimpleChart';

// Type definitions (local fallback if dashboard-core not available)
interface DashboardComponent {
  id: string;
  type: string;
  title: string;
  body: string;
  role?: string;
  priority?: number;
  data?: Array<{ label: string; value: number }>;
  config?: {
    chartType?: string;
  };
}

interface DashboardTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    card: string;
    cardAlt: string;
    text: string;
    textMuted: string;
    border: string;
    shadow: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  fontFamily: string;
  borderRadius: string;
  boxShadow: {
    sm: string;
    md: string;
    lg: string;
  };
}

interface AnalyticsDashboardProps {
  theme?: DashboardTheme;
}

export default function AnalyticsDashboard({ theme }: AnalyticsDashboardProps) {
  const { projects } = useAppState();

  // Generate analytics data from projects
  const analyticsData = useMemo(() => {
    const projectCount = Object.keys(projects).length;
    const projectsByTheme: Record<string, number> = {};
    const projectsByType: Record<string, number> = {};
    const componentCounts: number[] = [];
    const recentActivity: Array<{ date: string; count: number }> = [];

    Object.values(projects).forEach((project) => {
      // Count by theme
      const themeKey = project.theme || 'default';
      projectsByTheme[themeKey] = (projectsByTheme[themeKey] || 0) + 1;

      // Count by type
      const typeKey = project.projectType || 'business';
      projectsByType[typeKey] = (projectsByType[typeKey] || 0) + 1;

      // Component counts
      componentCounts.push(project.components?.length || 0);

      // Recent activity (simplified - using updatedAt)
      const date = new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = recentActivity.find(a => a.date === date);
      if (existing) {
        existing.count++;
      } else {
        recentActivity.push({ date, count: 1 });
      }
    });

    return {
      projectCount,
      projectsByTheme,
      projectsByType,
      componentCounts,
      recentActivity: recentActivity.slice(-7).reverse() // Last 7 days
    };
  }, [projects]);

  // Prepare chart data
  const themeChartData = Object.entries(analyticsData.projectsByTheme).map(([label, value]) => ({
    label,
    value
  }));

  const typeChartData = Object.entries(analyticsData.projectsByType).map(([label, value]) => ({
    label,
    value
  }));

  const activityChartData = analyticsData.recentActivity.map(item => ({
    label: item.date,
    value: item.count
  }));

  const componentChartData = analyticsData.componentCounts.map((count, index) => ({
    label: `Project ${index + 1}`,
    value: count
  }));

  const defaultTheme: DashboardTheme = theme || {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#0070f3',
      secondary: '#00d4ff',
      accent: '#00ffaa',
      background: '#ffffff',
      card: '#f5f5f5',
      cardAlt: '#e8e8e8',
      text: '#000000',
      textMuted: '#666666',
      border: '#e0e0e0',
      shadow: 'rgba(0,0,0,0.1)',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#f44336',
      info: '#2196F3'
    },
    fontFamily: 'system-ui, sans-serif',
    borderRadius: '8px',
    boxShadow: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 2px 4px rgba(0,0,0,0.1)',
      lg: '0 4px 8px rgba(0,0,0,0.15)'
    }
  };

  const chartComponents: DashboardComponent[] = [
    {
      id: 'projects-by-theme',
      type: 'chart',
      title: 'Projects by Theme',
      body: 'Distribution of projects across different themes',
      role: 'chart',
      priority: 3,
      data: themeChartData,
      config: { chartType: 'bar' }
    },
    {
      id: 'projects-by-type',
      type: 'chart',
      title: 'Projects by Type',
      body: 'Business vs Creative projects',
      role: 'chart',
      priority: 3,
      data: typeChartData,
      config: { chartType: 'pie' }
    },
    {
      id: 'recent-activity',
      type: 'chart',
      title: 'Recent Activity',
      body: 'Project updates over the last 7 days',
      role: 'chart',
      priority: 4,
      data: activityChartData,
      config: { chartType: 'line' }
    },
    {
      id: 'components-per-project',
      type: 'chart',
      title: 'Components per Project',
      body: 'Number of components in each project',
      role: 'chart',
      priority: 3,
      data: componentChartData,
      config: { chartType: 'bar' }
    }
  ];

  return (
    <div style={{
      padding: '24px',
      background: defaultTheme.colors.background,
      minHeight: '100vh'
    }}>
      {/* Header with Navigation */}
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: defaultTheme.colors.text,
            margin: 0,
            marginBottom: '8px'
          }}>
            📊 Analytics Dashboard
          </h1>
          <p style={{
            color: defaultTheme.colors.textMuted,
            margin: 0
          }}>
            Project analytics and insights
          </p>
        </div>
        
        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <Link
            href="/dashboard"
            style={{
              padding: '10px 20px',
              background: defaultTheme.colors.card,
              color: defaultTheme.colors.text,
              textDecoration: 'none',
              borderRadius: defaultTheme.borderRadius,
              border: `1px solid ${defaultTheme.colors.border}`,
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = defaultTheme.colors.cardAlt;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = defaultTheme.colors.card;
            }}
          >
            ← Back to Dashboard
          </Link>
          <Link
            href="/dashboard/analytics/detailed"
            style={{
              padding: '10px 20px',
              background: defaultTheme.colors.primary,
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: defaultTheme.borderRadius,
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Detailed Analytics →
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          padding: '20px',
          background: defaultTheme.colors.card,
          borderRadius: defaultTheme.borderRadius,
          border: `1px solid ${defaultTheme.colors.border}`,
          boxShadow: defaultTheme.boxShadow.sm
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: defaultTheme.colors.primary,
            marginBottom: '8px'
          }}>
            {analyticsData.projectCount}
          </div>
          <div style={{
            fontSize: '14px',
            color: defaultTheme.colors.textMuted
          }}>
            Total Projects
          </div>
        </div>
        <div style={{
          padding: '20px',
          background: defaultTheme.colors.card,
          borderRadius: defaultTheme.borderRadius,
          border: `1px solid ${defaultTheme.colors.border}`,
          boxShadow: defaultTheme.boxShadow.sm
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: defaultTheme.colors.success,
            marginBottom: '8px'
          }}>
            {analyticsData.componentCounts.reduce((a, b) => a + b, 0)}
          </div>
          <div style={{
            fontSize: '14px',
            color: defaultTheme.colors.textMuted
          }}>
            Total Components
          </div>
        </div>
        <div style={{
          padding: '20px',
          background: defaultTheme.colors.card,
          borderRadius: defaultTheme.borderRadius,
          border: `1px solid ${defaultTheme.colors.border}`,
          boxShadow: defaultTheme.boxShadow.sm
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: defaultTheme.colors.accent,
            marginBottom: '8px'
          }}>
            {Object.keys(analyticsData.projectsByTheme).length}
          </div>
          <div style={{
            fontSize: '14px',
            color: defaultTheme.colors.textMuted
          }}>
            Active Themes
          </div>
        </div>
        <div style={{
          padding: '20px',
          background: defaultTheme.colors.card,
          borderRadius: defaultTheme.borderRadius,
          border: `1px solid ${defaultTheme.colors.border}`,
          boxShadow: defaultTheme.boxShadow.sm
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: defaultTheme.colors.info,
            marginBottom: '8px'
          }}>
            {analyticsData.recentActivity.reduce((sum, a) => sum + a.count, 0)}
          </div>
          <div style={{
            fontSize: '14px',
            color: defaultTheme.colors.textMuted
          }}>
            Updates (7 days)
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {chartComponents.map((component) => (
          <div
            key={component.id}
            style={{
              padding: '20px',
              background: defaultTheme.colors.card,
              borderRadius: defaultTheme.borderRadius,
              border: `1px solid ${defaultTheme.colors.border}`,
              boxShadow: defaultTheme.boxShadow.sm
            }}
          >
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: defaultTheme.colors.text,
              marginBottom: '8px'
            }}>
              {component.title}
            </h3>
            <p style={{
              fontSize: '14px',
              color: defaultTheme.colors.textMuted,
              marginBottom: '16px'
            }}>
              {component.body}
            </p>
            <SimpleChart
              data={component.data || []}
              chartType={component.config?.chartType as any || 'bar'}
              height={200}
              colors={{
                primary: defaultTheme.colors.primary,
                secondary: defaultTheme.colors.secondary,
                accent: defaultTheme.colors.accent
              }}
            />
          </div>
        ))}
      </div>

      {/* Additional Navigation */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        background: defaultTheme.colors.card,
        borderRadius: defaultTheme.borderRadius,
        border: `1px solid ${defaultTheme.colors.border}`
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: defaultTheme.colors.text,
          marginBottom: '16px'
        }}>
          Quick Links
        </h3>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <Link
            href="/dashboard"
            style={{
              color: defaultTheme.colors.primary,
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            Main Dashboard
          </Link>
          <span style={{ color: defaultTheme.colors.border }}>•</span>
          <Link
            href="/projects/new"
            style={{
              color: defaultTheme.colors.primary,
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            Create Project
          </Link>
          <span style={{ color: defaultTheme.colors.border }}>•</span>
          <Link
            href="/dashboard/analytics/detailed"
            style={{
              color: defaultTheme.colors.primary,
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            Detailed Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}

