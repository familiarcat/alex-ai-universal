'use client';

import { useState } from 'react';
import QuizInline from '@/components/QuizInline';
import WizardInline from '@/components/WizardInline';
import CombinedWizard from '@/components/CombinedWizard';
import BentoEditor from '@/components/BentoEditor';

interface ProjectContentLike {
  headline: string;
  subheadline: string;
  description: string;
  theme: string;
}

interface ThemeMeta { id: string; icon: string; name: string; category?: string; year?: number }

interface ProjectEditorTabsProps {
  projectId: string;
  content: ProjectContentLike;
  themes: ThemeMeta[];
  onUpdate: (field: keyof ProjectContentLike, value: string) => void;
  onTheme: (themeId: string) => void;
}

export default function ProjectEditorTabs({ projectId, content, themes, onUpdate, onTheme }: ProjectEditorTabsProps) {
  const [tab, setTab] = useState<'quick-edit' | 'advanced'>('quick-edit');
  const [advancedSubTab, setAdvancedSubTab] = useState<'quiz' | 'wizard' | 'components'>('quiz');

  const mainTabButton = (id: 'quick-edit' | 'advanced', label: string, icon: string) => (
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

  const subTabButton = (id: 'quiz' | 'wizard' | 'components', label: string) => (
    <button
      onClick={() => setAdvancedSubTab(id)}
      style={{
        padding: '6px 12px',
        borderRadius: 6,
        border: 'none',
        background: advancedSubTab === id ? 'var(--subtle)' : 'transparent',
        color: 'var(--text)',
        cursor: 'pointer',
        fontSize: 12,
        opacity: advancedSubTab === id ? 1 : 0.7,
        transition: 'all 0.2s ease'
      }}
    >{label}</button>
  );

  return (
    <div>
      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {mainTabButton('quick-edit', 'Quick Edit', '✏️')}
        {mainTabButton('advanced', 'Advanced Builder', '🎨')}
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
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', color: 'var(--accent)' }}>
              🎨 Theme Selection
            </label>
            
            {/* Quick Dropdown */}
            <select
              value={content.theme}
              onChange={(e) => onTheme(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                marginBottom: '16px',
                background: 'var(--card-alt)',
                color: 'var(--text)',
                border: '2px solid var(--accent)',
                borderRadius: 'var(--radius)',
                fontSize: '14px'
              }}
            >
              <optgroup label="🔥 2025 Trending Themes">
                {themes.filter(t => t.category === '2025 Trend').map((t) => (
                  <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                ))}
              </optgroup>
              <optgroup label="✨ Classic Themes">
                {themes.filter(t => t.category === 'Classic').map((t) => (
                  <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                ))}
              </optgroup>
            </select>

            {/* Visual Theme Gallery */}
            <div>
              {/* 2025 Trends */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: 'var(--text-muted)', 
                  marginBottom: '8px',
                  fontWeight: 600,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.5px'
                }}>
                  🔥 2025 Trending (Pantone + WCAG AAA)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                  {themes.filter(t => t.category === '2025 Trend').map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onTheme(t.id)}
                      title={`${t.name} - ${t.year} Trend`}
                      style={{
                        padding: '12px 10px',
                        background: content.theme === t.id ? 'var(--accent)' : 'var(--card-alt)',
                        border: content.theme === t.id ? '2px solid var(--accent)' : 'var(--border)',
                        borderRadius: 'var(--radius)',
                        color: content.theme === t.id ? '#0a0a0a' : 'var(--text)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: content.theme === t.id ? 600 : 400,
                        transition: 'all 0.2s ease',
                        position: 'relative' as const,
                        overflow: 'hidden' as const
                      }}
                      onMouseEnter={(e) => {
                        if (content.theme !== t.id) {
                          e.currentTarget.style.background = 'var(--subtle)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (content.theme !== t.id) {
                          e.currentTarget.style.background = 'var(--card-alt)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{t.icon}</div>
                      <div style={{ fontSize: '11px', lineHeight: '1.2' }}>{t.name}</div>
                      {content.theme === t.id && (
                        <div style={{ 
                          position: 'absolute' as const, 
                          top: 4, 
                          right: 4, 
                          fontSize: '16px' 
                        }}>✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Classic Themes */}
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  color: 'var(--text-muted)', 
                  marginBottom: '8px',
                  fontWeight: 600,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.5px'
                }}>
                  ✨ Classic Themes
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                  {themes.filter(t => t.category === 'Classic').map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onTheme(t.id)}
                      title={t.name}
                      style={{
                        padding: '12px 10px',
                        background: content.theme === t.id ? 'var(--accent)' : 'var(--card-alt)',
                        border: content.theme === t.id ? '2px solid var(--accent)' : 'var(--border)',
                        borderRadius: 'var(--radius)',
                        color: content.theme === t.id ? '#0a0a0a' : 'var(--text)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: content.theme === t.id ? 600 : 400,
                        transition: 'all 0.2s ease',
                        position: 'relative' as const,
                        overflow: 'hidden' as const
                      }}
                      onMouseEnter={(e) => {
                        if (content.theme !== t.id) {
                          e.currentTarget.style.background = 'var(--subtle)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (content.theme !== t.id) {
                          e.currentTarget.style.background = 'var(--card-alt)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{t.icon}</div>
                      <div style={{ fontSize: '11px', lineHeight: '1.2' }}>{t.name}</div>
                      {content.theme === t.id && (
                        <div style={{ 
                          position: 'absolute' as const, 
                          top: 4, 
                          right: 4, 
                          fontSize: '16px' 
                        }}>✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Selection Info */}
            <div style={{ 
              marginTop: '12px', 
              padding: '10px 12px', 
              background: 'var(--card-alt)', 
              borderRadius: 'var(--radius)',
              border: 'var(--border)',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              <strong style={{ color: 'var(--accent)' }}>Active:</strong> {themes.find(t => t.id === content.theme)?.icon} {themes.find(t => t.id === content.theme)?.name || content.theme}
              {themes.find(t => t.id === content.theme)?.year && (
                <span style={{ marginLeft: '8px', opacity: 0.7 }}>• {themes.find(t => t.id === content.theme)?.year} Trend</span>
              )}
            </div>
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
              💡 Need more control?
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '10px' }}>
              Try <strong>Advanced Builder</strong> for AI-powered content generation, theme recommendations, and component-level customization.
            </div>
            <button 
              onClick={() => setTab('advanced')}
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
              🚀 Try Advanced Builder →
            </button>
          </div>
        </div>
      )}

      {/* Advanced Builder Tab */}
      {tab === 'advanced' && (
        <div>
          {/* Sub-tabs */}
          <div style={{ 
            display: 'flex', 
            gap: 4, 
            marginBottom: 16, 
            padding: '4px',
            background: 'var(--card-alt)',
            borderRadius: 8,
            width: 'fit-content'
          }}>
            {subTabButton('quiz', '🎯 Quiz')}
            {subTabButton('wizard', '🧙 Wizard')}
            {subTabButton('components', '📦 Components')}
          </div>

          {/* Sub-tab Content */}
          {advancedSubTab === 'quiz' && (
            <div>
              <div style={{ marginBottom: 12, fontSize: 14, color: 'var(--text-muted)' }}>
                Answer questions to get AI-powered theme recommendations
              </div>
              <QuizInline projectId={projectId} onApplyTheme={(t) => onTheme(t)} />
            </div>
          )}

          {advancedSubTab === 'wizard' && (
            <div>
              <div style={{ marginBottom: 12, fontSize: 14, color: 'var(--text-muted)' }}>
                Quick wizard to generate content suggestions
              </div>
              <WizardInline projectId={projectId} onApply={(data) => {
                if (data.headline) onUpdate('headline', data.headline);
                if (data.subheadline) onUpdate('subheadline', data.subheadline);
                if (data.description) onUpdate('description', data.description);
                if (data.theme) onTheme(data.theme);
              }} />
            </div>
          )}

          {advancedSubTab === 'components' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <div>
                <div style={{ marginBottom: 12, fontSize: 14, color: 'var(--text-muted)' }}>
                  Create and manage page components with AI-powered suggestions
                </div>
                <h4 style={{ marginBottom: 8, color: 'var(--accent)' }}>🧪 Component Wizard</h4>
                <CombinedWizard projectId={projectId} />
              </div>
              <div>
                <h4 style={{ marginBottom: 8, color: 'var(--accent)' }}>📦 Component Grid</h4>
                <BentoEditor projectId={projectId} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


