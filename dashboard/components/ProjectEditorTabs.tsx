'use client';

import { useState } from 'react';
import QuizInline from '@/components/QuizInline';
import WizardInline from '@/components/WizardInline';

interface ProjectContentLike {
  headline: string;
  subheadline: string;
  description: string;
  theme: string;
}

interface ThemeMeta { id: string; icon: string; name: string }

interface ProjectEditorTabsProps {
  projectId: string;
  content: ProjectContentLike;
  themes: ThemeMeta[];
  onUpdate: (field: keyof ProjectContentLike, value: string) => void;
  onTheme: (themeId: string) => void;
}

export default function ProjectEditorTabs({ projectId, content, themes, onUpdate, onTheme }: ProjectEditorTabsProps) {
  const [tab, setTab] = useState<'editor' | 'quiz' | 'wizard'>('editor');

  const tabButton = (id: 'editor' | 'quiz' | 'wizard', label: string) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: '8px 12px',
        borderRadius: 8,
        border: 'var(--border)',
        background: tab === id ? 'var(--subtle)' : 'var(--card-alt)',
        color: 'var(--text)',
        cursor: 'pointer',
        fontSize: 13
      }}
    >{label}</button>
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {tabButton('editor', 'Editor')}
        {tabButton('quiz', 'Quiz')}
        {tabButton('wizard', 'Wizard')}
      </div>

      {tab === 'editor' && (
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
              🎨 Theme
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const }}>
              <select
                value={content.theme}
                onChange={(e) => onTheme(e.target.value)}
                style={{
                  padding: '10px 14px',
                  background: 'var(--card-alt)',
                  color: 'var(--text)',
                  border: '2px solid var(--accent)',
                  borderRadius: 'var(--radius)'
                }}
              >
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onTheme(t.id)}
                    style={{
                      padding: '10px 16px',
                      background: content.theme === t.id ? 'var(--subtle)' : 'var(--card-alt)',
                      border: content.theme === t.id ? '2px solid var(--accent)' : 'var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {t.icon} {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'quiz' && (
        <QuizInline projectId={projectId} onApplyTheme={(t) => onTheme(t)} />
      )}

      {tab === 'wizard' && (
        <WizardInline projectId={projectId} onApply={(data) => {
          if (data.headline) onUpdate('headline', data.headline);
          if (data.subheadline) onUpdate('subheadline', data.subheadline);
          if (data.description) onUpdate('description', data.description);
          if (data.theme) onTheme(data.theme);
        }} />
      )}
    </div>
  );
}


