'use client';

/**
 * Dashboard Bento Layout - Comprehensive Component Organization
 * 
 * Organizes ALL visualization and UI components into a beautiful bento grid
 * 
 * Crew: Troi (UX Lead) + Riker (Layout) + Data (Organization) + La Forge (Implementation)
 */

import { useState } from 'react';
import ServiceStatusDisplay from './ServiceStatusDisplay';
import CrossServerSyncPanel from './CrossServerSyncPanel';
import LiveRefreshDashboard from './LiveRefreshDashboard';
import MCPDashboardSection from './MCPDashboardSection';
import LearningAnalyticsDashboard from './LearningAnalyticsDashboard';
import CrewMemoryVisualization from './CrewMemoryVisualization';
import RAGProjectRecommendations from './RAGProjectRecommendations';
import N8NWorkflowBento from './N8NWorkflowBento';
import RAGSelfDocumentation from './RAGSelfDocumentation';
import SecurityAssessmentDashboard from './SecurityAssessmentDashboard';
import CostOptimizationMonitor from './CostOptimizationMonitor';
import UserExperienceAnalytics from './UserExperienceAnalytics';
import AIImpactAssessment from './AIImpactAssessment';
import ProcessDocumentationSystem from './ProcessDocumentationSystem';
import DataSourceIntegrationPanel from './DataSourceIntegrationPanel';
import ProjectGrid from './ProjectGrid';
import ThemeTestingHarness from './ThemeTestingHarness';
import AnalyticsDashboard from './AnalyticsDashboard';
import VectorBasedDashboard from './VectorBasedDashboard';
import VectorPrioritySystem from './VectorPrioritySystem';
import UIDesignComparison from './UIDesignComparison';
import ProgressTracker from './ProgressTracker';
import PriorityMatrix from './PriorityMatrix';
import DynamicDataDrilldown from './DynamicDataDrilldown';
import DynamicDataRenderer from './DynamicDataRenderer';
import DynamicComponentRegistry, { ComponentGrid } from './DynamicComponentRegistry';
import DebatePanel from './DebatePanel';
import AgentMemoryDisplay from './AgentMemoryDisplay';
import StatusRibbon from './StatusRibbon';
import UniversalProgressBar from './UniversalProgressBar';
import DesignSystemErrorDisplay from './DesignSystemErrorDisplay';
import MCPStatusModal from './MCPStatusModal';
import { useAppState } from '@/lib/state-manager';

interface BentoCardProps {
  title: string;
  description?: string;
  icon?: string;
  span?: number; // Grid column span (1-4)
  height?: 'short' | 'medium' | 'tall';
  children: React.ReactNode;
}

function BentoCard({ title, description, icon, span = 1, height = 'medium', children }: BentoCardProps) {
  const heightClass = {
    short: 'min-h-[200px]',
    medium: 'min-h-[300px]',
    tall: 'min-h-[400px]'
  }[height];

  return (
    <div
      className="card"
      style={{
        gridColumn: `span ${span}`,
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius)',
        border: 'var(--border)',
        background: 'var(--card-bg)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: height === 'short' ? '200px' : height === 'medium' ? '300px' : '400px'
      }}
    >
      {(title || icon) && (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{
            fontSize: 'var(--font-lg)',
            fontWeight: 600,
            color: 'var(--accent)',
            margin: 0,
            marginBottom: description ? '4px' : 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {icon && <span>{icon}</span>}
            {title}
          </h3>
          {description && (
            <p style={{
              fontSize: 'var(--font-sm)',
              color: 'var(--text-muted)',
              margin: 0
            }}>
              {description}
            </p>
          )}
        </div>
      )}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

export default function DashboardBentoLayout() {
  const { globalTheme } = useAppState();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['core', 'analytics', 'workflows']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      padding: '24px 0'
    }}>
      {/* Core System Status - Always Visible */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => toggleSection('core')}
        >
          <h2 style={{
            fontSize: 'var(--font-xl)',
            fontWeight: 600,
            color: 'var(--accent)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{expandedSections.has('core') ? '▼' : '▶'}</span>
            🖖 Core System Status
          </h2>
        </div>
        {expandedSections.has('core') && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '20px'
          }}>
            <BentoCard title="Service Status" icon="🖖" span={12} height="short">
              <ServiceStatusDisplay />
            </BentoCard>
            <BentoCard title="Live Refresh" icon="🔄" span={6} height="medium">
              <LiveRefreshDashboard />
            </BentoCard>
            <BentoCard title="Cross-Server Sync" icon="🔗" span={6} height="medium">
              <CrossServerSyncPanel />
            </BentoCard>
            <BentoCard title="MCP System" icon="🔌" span={12} height="medium">
              <MCPDashboardSection />
            </BentoCard>
          </div>
        )}
      </section>

      {/* Analytics & Learning - RAG-Powered */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => toggleSection('analytics')}
        >
          <h2 style={{
            fontSize: 'var(--font-xl)',
            fontWeight: 600,
            color: 'var(--accent)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{expandedSections.has('analytics') ? '▼' : '▶'}</span>
            📊 Analytics & Learning
          </h2>
        </div>
        {expandedSections.has('analytics') && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '20px'
          }}>
            <BentoCard title="Learning Analytics" icon="📈" span={12} height="tall">
              <LearningAnalyticsDashboard />
            </BentoCard>
            <BentoCard title="Crew Memory Visualization" icon="🧠" span={12} height="tall">
              <CrewMemoryVisualization />
            </BentoCard>
            <BentoCard title="Analytics Dashboard" icon="📊" span={12} height="tall">
              <AnalyticsDashboard />
            </BentoCard>
            <BentoCard title="RAG Recommendations" icon="💡" span={6} height="medium">
              <RAGProjectRecommendations />
            </BentoCard>
            <BentoCard title="User Experience Analytics" icon="💭" span={6} height="medium">
              <UserExperienceAnalytics />
            </BentoCard>
          </div>
        )}
      </section>

      {/* Workflows & Automation */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => toggleSection('workflows')}
        >
          <h2 style={{
            fontSize: 'var(--font-xl)',
            fontWeight: 600,
            color: 'var(--accent)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{expandedSections.has('workflows') ? '▼' : '▶'}</span>
            ⚙️ Workflows & Automation
          </h2>
        </div>
        {expandedSections.has('workflows') && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '20px'
          }}>
            <BentoCard title="n8n Workflows" icon="⚙️" span={12} height="tall">
              <N8NWorkflowBento />
            </BentoCard>
            <BentoCard title="Process Documentation" icon="📝" span={6} height="medium">
              <ProcessDocumentationSystem />
            </BentoCard>
            <BentoCard title="Data Source Integration" icon="🔗" span={6} height="medium">
              <DataSourceIntegrationPanel />
            </BentoCard>
          </div>
        )}
      </section>

      {/* Security & Optimization */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => toggleSection('security')}
        >
          <h2 style={{
            fontSize: 'var(--font-xl)',
            fontWeight: 600,
            color: 'var(--accent)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{expandedSections.has('security') ? '▼' : '▶'}</span>
            🛡️ Security & Optimization
          </h2>
        </div>
        {expandedSections.has('security') && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '20px'
          }}>
            <BentoCard title="Security Assessment" icon="⚔️" span={6} height="tall">
              <SecurityAssessmentDashboard />
            </BentoCard>
            <BentoCard title="Cost Optimization" icon="💰" span={6} height="tall">
              <CostOptimizationMonitor />
            </BentoCard>
            <BentoCard title="AI Impact Assessment" icon="🎖️" span={12} height="medium">
              <AIImpactAssessment />
            </BentoCard>
          </div>
        )}
      </section>

      {/* Vector & Data Visualization */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => toggleSection('vectors')}
        >
          <h2 style={{
            fontSize: 'var(--font-xl)',
            fontWeight: 600,
            color: 'var(--accent)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{expandedSections.has('vectors') ? '▼' : '▶'}</span>
            🎯 Vector & Data Visualization
          </h2>
        </div>
        {expandedSections.has('vectors') && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '20px'
          }}>
            <BentoCard title="Vector-Based Dashboard" icon="📊" span={12} height="tall">
              <VectorBasedDashboard />
            </BentoCard>
            <BentoCard title="Vector Priority System" icon="🎯" span={6} height="tall">
              <VectorPrioritySystem />
            </BentoCard>
            <BentoCard title="Priority Matrix" icon="⚡" span={6} height="tall">
              <PriorityMatrix vectors={[]} />
            </BentoCard>
            <BentoCard title="UI Design Comparison" icon="🎨" span={12} height="tall">
              <UIDesignComparison />
            </BentoCard>
          </div>
        )}
      </section>

      {/* Dynamic Data & Components */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => toggleSection('dynamic')}
        >
          <h2 style={{
            fontSize: 'var(--font-xl)',
            fontWeight: 600,
            color: 'var(--accent)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{expandedSections.has('dynamic') ? '▼' : '▶'}</span>
            🔄 Dynamic Data & Components
          </h2>
        </div>
        {expandedSections.has('dynamic') && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '20px'
          }}>
            <BentoCard title="Dynamic Data Renderer" icon="🔄" span={6} height="medium">
              <DynamicDataRenderer data={{}} structure={{}} />
            </BentoCard>
            <BentoCard title="Dynamic Data Drilldown" icon="🔍" span={6} height="medium">
              <DynamicDataDrilldown data={{}} title="Data Analysis" />
            </BentoCard>
            <BentoCard title="Component Registry" icon="📦" span={12} height="medium">
              <ComponentGrid componentIds={[]} />
            </BentoCard>
            <BentoCard title="Agent Memory Display" icon="🤖" span={6} height="medium">
              <AgentMemoryDisplay agentName="Data" limit={10} showStats={true} />
            </BentoCard>
            <BentoCard title="Progress Tracker" icon="📈" span={6} height="medium">
              <ProgressTracker taskId="dashboard-initialization" />
            </BentoCard>
          </div>
        )}
      </section>

      {/* Documentation & Knowledge */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => toggleSection('documentation')}
        >
          <h2 style={{
            fontSize: 'var(--font-xl)',
            fontWeight: 600,
            color: 'var(--accent)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{expandedSections.has('documentation') ? '▼' : '▶'}</span>
            📚 Documentation & Knowledge
          </h2>
        </div>
        {expandedSections.has('documentation') && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '20px'
          }}>
            <BentoCard title="RAG Self-Documentation" icon="📖" span={12} height="tall">
              <RAGSelfDocumentation />
            </BentoCard>
            <BentoCard title="Debate Panel" icon="💬" span={6} height="medium">
              <DebatePanel />
            </BentoCard>
            <BentoCard title="Status Ribbon" icon="📋" span={6} height="short">
              <StatusRibbon />
            </BentoCard>
          </div>
        )}
      </section>

      {/* Projects & Management */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => toggleSection('projects')}
        >
          <h2 style={{
            fontSize: 'var(--font-xl)',
            fontWeight: 600,
            color: 'var(--accent)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{expandedSections.has('projects') ? '▼' : '▶'}</span>
            📋 Projects & Management
          </h2>
        </div>
        {expandedSections.has('projects') && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '20px'
          }}>
            <BentoCard title="All Projects" icon="📋" span={12} height="tall">
              <ProjectGrid />
            </BentoCard>
          </div>
        )}
      </section>

      {/* Testing & Development */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => toggleSection('testing')}
        >
          <h2 style={{
            fontSize: 'var(--font-xl)',
            fontWeight: 600,
            color: 'var(--accent)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{expandedSections.has('testing') ? '▼' : '▶'}</span>
            🧪 Testing & Development
          </h2>
        </div>
        {expandedSections.has('testing') && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '20px'
          }}>
            <BentoCard title="Theme Testing Harness" icon="🎨" span={12} height="tall">
              <ThemeTestingHarness />
            </BentoCard>
            <BentoCard title="Design System Errors" icon="⚠️" span={6} height="medium">
              <DesignSystemErrorDisplay />
            </BentoCard>
            <BentoCard title="Universal Progress Bar" icon="📊" span={6} height="short">
              <UniversalProgressBar current={75} total={100} description="System Health" />
            </BentoCard>
          </div>
        )}
      </section>
    </div>
  );
}

