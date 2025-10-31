'use client';

import { useState } from 'react';
import CombinedWizard from '@/components/CombinedWizard';
import BentoEditor from '@/components/BentoEditor';
import ThemeSelector from '@/components/ThemeSelector';

interface ProjectContentLike {
  headline: string;
  subheadline: string;
  description: string;
  theme: string;
}

interface ProjectEditorTabsProps {
  projectId: string;
  content: ProjectContentLike;
  onUpdate: (field: keyof ProjectContentLike, value: string) => void;
  onTheme: (themeId: string) => void;
}

export default function ProjectEditorTabs({ projectId, content, onUpdate, onTheme }: ProjectEditorTabsProps) {
  const [tab, setTab] = useState<'quick-edit' | 'components'>('quick-edit');

  const mainTabButton = (id: 'quick-edit' | 'components', label: string, icon: string) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: '12px 20px',
        borderRadius: 8,
        border: tab === id ? '2px solid var(--accent)' : 'var(--border)',
        background: tab === id ? 'var(--accent)' : 'var(--card-alt)',
        color: tab === id ? '#0a0015' : 'var(--text)',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: tab === id ? 600 : 400,
        transition: 'all 0.2s ease'
      }}
    >{icon} {label}</button>
  );

  return (
    <div>
      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {mainTabButton('quick-edit', 'Quick Edit', '✏️')}
        {mainTabButton('components', 'Component Manager', '📦')}
      </div>

      {/* Quick Edit Tab */}
      {tab === 'quick-edit' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--accent)' }}>
              Headline
            </label>
            <input
              type="text"
              value={content.headline}
              onChange={(e) => onUpdate('headline', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--card-alt)',
                border: 'var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--accent)' }}>
              Subheadline
            </label>
            <input
              type="text"
              value={content.subheadline}
              onChange={(e) => onUpdate('subheadline', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--card-alt)',
                border: 'var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--accent)' }}>
              Description
            </label>
            <textarea
              value={content.description}
              onChange={(e) => onUpdate('description', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--card-alt)',
                border: 'var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
                fontSize: '14px',
                minHeight: '100px',
                fontFamily: 'inherit',
                resize: 'vertical' as const
              }}
            />
          </div>

          <div>
            <ThemeSelector
              value={content.theme}
              onChange={onTheme}
              mode="gallery"
              label="🎨 Theme Selection"
              showQuickDropdown={false}
            />
          </div>

          {/* Progression Hint */}
          <div style={{ 
            marginTop: '24px', 
            padding: '16px', 
            background: 'var(--card-alt)', 
            borderRadius: 'var(--radius)',
            border: '1px dashed var(--accent)',
            opacity: 0.9
          }}>
            <div style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--accent)', fontWeight: 600 }}>
              📦 Need to add sections?
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '10px' }}>
              Switch to <strong>Component Manager</strong> to build rich, multi-section pages with hero blocks, features, testimonials, and more.
            </div>
            <button 
              onClick={() => setTab('components')}
              style={{ 
                padding: '8px 16px', 
                borderRadius: 6, 
                background: 'var(--accent)', 
                color: '#0a0015', 
                border: 'none', 
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              📦 Manage Components →
            </button>
          </div>
        </div>
      )}

      {/* Component Manager Tab */}
      {tab === 'components' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <div>
            <div style={{ marginBottom: 12, fontSize: 14, color: 'var(--text-muted)' }}>
              Create structured page components with AI-powered suggestions based on your business type
            </div>
            <h4 style={{ marginBottom: 8, color: 'var(--accent)' }}>🧪 Add Components (AI-Powered)</h4>
            <CombinedWizard projectId={projectId} />
          </div>
          <div>
            <h4 style={{ marginBottom: 8, color: 'var(--accent)' }}>📦 Manage Component Cards</h4>
            <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
              Edit existing components, adjust priority, set intent/tone, and customize per-component themes
            </div>
            <BentoEditor projectId={projectId} />
          </div>
        </div>
      )}
    </div>
  );
}


