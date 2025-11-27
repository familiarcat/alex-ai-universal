'use client';

/**
 * Domain-Driven Bento Layout - User Intent Organization
 * 
 * Organizes components by user interaction domains, not technical functions
 * Visual hierarchy matches user mental model
 * 
 * Leadership: Counselor Troi (UX Lead) + Commander Riker (Tactical) + Quark (Business)
 * Crew: All teams working in parallel
 */

import { useState } from 'react';
import { useAppState } from '@/lib/state-manager';

// Domain 1: System Health & Monitoring
import ServiceStatusDisplay from './ServiceStatusDisplay';
import StatusRibbon from './StatusRibbon';
import LiveRefreshDashboard from './LiveRefreshDashboard';
import MCPDashboardSection from './MCPDashboardSection';
import CrossServerSyncPanel from './CrossServerSyncPanel';
import ProgressTracker from './ProgressTracker';

// Domain 2: Intelligence & Learning
import LearningAnalyticsDashboard from './LearningAnalyticsDashboard';
import CrewMemoryVisualization from './CrewMemoryVisualization';
import RAGProjectRecommendations from './RAGProjectRecommendations';
import AnalyticsDashboard from './AnalyticsDashboard';
import AgentMemoryDisplay from './AgentMemoryDisplay';

// Domain 3: Design & Theming
import ThemeTestingHarness from './ThemeTestingHarness';
import UIDesignComparison from './UIDesignComparison';

// Domain 4: Project Management
import ProjectGrid from './ProjectGrid';

// Domain 5: Workflow & Automation
import N8NWorkflowBento from './N8NWorkflowBento';
import ProcessDocumentationSystem from './ProcessDocumentationSystem';
import DataSourceIntegrationPanel from './DataSourceIntegrationPanel';

// Domain 6: Security & Compliance
import SecurityAssessmentDashboard from './SecurityAssessmentDashboard';
import AIImpactAssessment from './AIImpactAssessment';
import CostOptimizationMonitor from './CostOptimizationMonitor';

// Domain 7: Data & Analytics
import VectorBasedDashboard from './VectorBasedDashboard';
import VectorPrioritySystem from './VectorPrioritySystem';
import PriorityMatrix from './PriorityMatrix';
import DynamicDataRenderer from './DynamicDataRenderer';
import DynamicDataDrilldown from './DynamicDataDrilldown';
import DynamicComponentRegistry, { ComponentGrid } from './DynamicComponentRegistry';

// Domain 8: Knowledge & Documentation
import RAGSelfDocumentation from './RAGSelfDocumentation';
import DebatePanel from './DebatePanel';
import UserExperienceAnalytics from './UserExperienceAnalytics';

// Testing & Development
import DesignSystemErrorDisplay from './DesignSystemErrorDisplay';
import UniversalProgressBar from './UniversalProgressBar';

interface DomainSectionProps {
  domainId: string;
  title: string;
  description: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function DomainSection({ domainId, title, description, icon, isExpanded, onToggle, children }: DomainSectionProps) {
  return (
    <section style={{
      marginBottom: '40px',
      padding: '24px',
      background: 'var(--card-bg)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      transition: 'all 0.3s ease'
    }}>
      {/* Domain Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isExpanded ? '24px' : '0',
          cursor: 'pointer',
          userSelect: 'none',
          padding: '12px',
          borderRadius: 'var(--radius)',
          background: isExpanded ? 'var(--background-light)' : 'transparent',
          transition: 'all 0.2s ease'
        }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <span style={{ fontSize: '32px', transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s ease' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
          <span style={{ fontSize: '36px' }}>{icon}</span>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: 'var(--font-xl)',
              fontWeight: 700,
              color: 'var(--accent)',
              margin: 0,
              marginBottom: '4px'
            }}>
              {title}
            </h2>
            <p style={{
              fontSize: 'var(--font-sm)',
              color: 'var(--text-muted)',
              margin: 0
            }}>
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Domain Content */}
      {isExpanded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '20px',
          animation: 'fadeIn 0.3s ease'
        }}>
          {children}
        </div>
      )}
    </section>
  );
}

interface BentoCardProps {
  title: string;
  description?: string;
  icon?: string;
  span?: number; // Grid column span (1-12)
  height?: 'short' | 'medium' | 'tall';
  children: React.ReactNode;
}

function BentoCard({ title, description, icon, span = 4, height = 'medium', children }: BentoCardProps) {
  const heightValue = height === 'short' ? '200px' : height === 'medium' ? '300px' : '400px';
  
  return (
    <div
      className="card"
      style={{
        gridColumn: `span ${span}`,
        padding: '20px',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        background: 'var(--card-bg)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: heightValue,
        transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {(title || icon) && (
        <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
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
              fontSize: 'var(--font-xs)',
              color: 'var(--text-muted)',
              margin: 0,
              marginTop: '4px'
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

export default function DomainDrivenBentoLayout() {
  const { globalTheme } = useAppState();
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set(['health', 'intelligence', 'projects']));

  const toggleDomain = (domainId: string) => {
    setExpandedDomains(prev => {
      const next = new Set(prev);
      if (next.has(domainId)) {
        next.delete(domainId);
      } else {
        next.add(domainId);
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
      {/* Domain 1: System Health & Monitoring */}
      <DomainSection
        domainId="health"
        title="System Health & Monitoring"
        description="Is everything working? What's the status?"
        icon="🏥"
        isExpanded={expandedDomains.has('health')}
        onToggle={() => toggleDomain('health')}
      >
        <BentoCard title="Service Status" icon="🖖" span={12} height="short">
          <ServiceStatusDisplay />
        </BentoCard>
        <BentoCard title="Status Ribbon" icon="🎗️" span={6} height="short">
          <StatusRibbon />
        </BentoCard>
        <BentoCard title="Live Refresh" icon="🔄" span={6} height="medium">
          <LiveRefreshDashboard />
        </BentoCard>
        <BentoCard title="MCP System" icon="🔌" span={6} height="medium">
          <MCPDashboardSection />
        </BentoCard>
        <BentoCard title="Cross-Server Sync" icon="🔗" span={6} height="medium">
          <CrossServerSyncPanel />
        </BentoCard>
        <BentoCard title="Progress Tracker" icon="📈" span={12} height="short">
          <ProgressTracker taskId="dashboard-initialization" />
        </BentoCard>
      </DomainSection>

      {/* Domain 2: Intelligence & Learning */}
      <DomainSection
        domainId="intelligence"
        title="Intelligence & Learning"
        description="What has the system learned? What insights do we have?"
        icon="🧠"
        isExpanded={expandedDomains.has('intelligence')}
        onToggle={() => toggleDomain('intelligence')}
      >
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
        <BentoCard title="Agent Memory Display" icon="🤖" span={6} height="medium">
          <AgentMemoryDisplay agentName="Data" limit={10} showStats={true} />
        </BentoCard>
      </DomainSection>

      {/* Domain 3: Design & Theming */}
      <DomainSection
        domainId="design"
        title="Design & Theming"
        description="How does it look? What themes work best?"
        icon="🎨"
        isExpanded={expandedDomains.has('design')}
        onToggle={() => toggleDomain('design')}
      >
        <BentoCard title="Theme Testing Harness" icon="🎨" span={12} height="tall">
          <ThemeTestingHarness />
        </BentoCard>
        <BentoCard title="UI Design Comparison" icon="🖼️" span={12} height="tall">
          <UIDesignComparison />
        </BentoCard>
      </DomainSection>

      {/* Domain 4: Project Management */}
      <DomainSection
        domainId="projects"
        title="Project Management"
        description="What projects exist? How do I manage them?"
        icon="📋"
        isExpanded={expandedDomains.has('projects')}
        onToggle={() => toggleDomain('projects')}
      >
        <BentoCard title="All Projects" icon="📁" span={12} height="tall">
          <ProjectGrid />
        </BentoCard>
      </DomainSection>

      {/* Domain 5: Workflow & Automation */}
      <DomainSection
        domainId="workflows"
        title="Workflow & Automation"
        description="How do processes work? What's automated?"
        icon="⚙️"
        isExpanded={expandedDomains.has('workflows')}
        onToggle={() => toggleDomain('workflows')}
      >
        <BentoCard title="n8n Workflows" icon="⚙️" span={12} height="tall">
          <N8NWorkflowBento />
        </BentoCard>
        <BentoCard title="Process Documentation" icon="📝" span={6} height="medium">
          <ProcessDocumentationSystem />
        </BentoCard>
        <BentoCard title="Data Source Integration" icon="🔗" span={6} height="medium">
          <DataSourceIntegrationPanel />
        </BentoCard>
      </DomainSection>

      {/* Domain 6: Security & Compliance */}
      <DomainSection
        domainId="security"
        title="Security & Compliance"
        description="Is it secure? Are we compliant?"
        icon="🛡️"
        isExpanded={expandedDomains.has('security')}
        onToggle={() => toggleDomain('security')}
      >
        <BentoCard title="Security Assessment" icon="⚔️" span={6} height="tall">
          <SecurityAssessmentDashboard />
        </BentoCard>
        <BentoCard title="Cost Optimization" icon="💰" span={6} height="tall">
          <CostOptimizationMonitor />
        </BentoCard>
        <BentoCard title="AI Impact Assessment" icon="🎖️" span={12} height="medium">
          <AIImpactAssessment />
        </BentoCard>
      </DomainSection>

      {/* Domain 7: Data & Analytics */}
      <DomainSection
        domainId="data"
        title="Data & Analytics"
        description="What does the data tell us? How do we visualize it?"
        icon="📊"
        isExpanded={expandedDomains.has('data')}
        onToggle={() => toggleDomain('data')}
      >
        <BentoCard title="Vector-Based Dashboard" icon="📊" span={12} height="tall">
          <VectorBasedDashboard />
        </BentoCard>
        <BentoCard title="Vector Priority System" icon="🎯" span={6} height="tall">
          <VectorPrioritySystem />
        </BentoCard>
        <BentoCard title="Priority Matrix" icon="⚡" span={6} height="tall">
          <PriorityMatrix vectors={[]} />
        </BentoCard>
        <BentoCard title="Dynamic Data Renderer" icon="🔄" span={6} height="medium">
          <DynamicDataRenderer data={{}} structure={{}} />
        </BentoCard>
        <BentoCard title="Dynamic Data Drilldown" icon="🔍" span={6} height="medium">
          <DynamicDataDrilldown data={{}} title="Data Analysis" />
        </BentoCard>
        <BentoCard title="Component Registry" icon="📦" span={12} height="medium">
          <ComponentGrid componentIds={[]} />
        </BentoCard>
      </DomainSection>

      {/* Domain 8: Knowledge & Documentation */}
      <DomainSection
        domainId="knowledge"
        title="Knowledge & Documentation"
        description="What do we know? How is it documented?"
        icon="📚"
        isExpanded={expandedDomains.has('knowledge')}
        onToggle={() => toggleDomain('knowledge')}
      >
        <BentoCard title="RAG Self-Documentation" icon="📖" span={12} height="tall">
          <RAGSelfDocumentation />
        </BentoCard>
        <BentoCard title="Debate Panel" icon="💬" span={6} height="medium">
          <DebatePanel />
        </BentoCard>
        <BentoCard title="User Experience Analytics" icon="💭" span={6} height="medium">
          <UserExperienceAnalytics />
        </BentoCard>
      </DomainSection>

      {/* Testing & Development (Always Visible) */}
      <section style={{
        marginTop: '40px',
        padding: '24px',
        background: 'var(--card-bg)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)'
      }}>
        <h2 style={{
          fontSize: 'var(--font-xl)',
          fontWeight: 700,
          color: 'var(--accent)',
          margin: 0,
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>🧪</span> Testing & Development
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '20px'
        }}>
          <BentoCard title="Design System Errors" icon="⚠️" span={6} height="medium">
            <DesignSystemErrorDisplay />
          </BentoCard>
          <BentoCard title="Universal Progress Bar" icon="📊" span={6} height="short">
            <UniversalProgressBar current={75} total={100} description="System Health" />
          </BentoCard>
        </div>
      </section>
    </div>
  );
}

