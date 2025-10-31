'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/state-manager';
import { getProfessionalSuggestion, getAdvisorOptions, AdvisorCode } from '@/lib/suggestion-engine';
import ThemeSelector from '@/components/ThemeSelector';

export default function BentoEditor({ projectId }: { projectId: string }) {
  const { projects, updateComponent } = useAppState();
  const project = projects[projectId];
  const components = project?.components || [];
  const advisorOptions = React.useMemo(() => getAdvisorOptions(), []);
  const [advisorOverride, setAdvisorOverride] = useState<AdvisorCode | ''>('');

  const gridTemplate = React.useMemo(() => {
    return 'repeat(auto-fill, minmax(260px, 1fr))';
  }, []);

  const cardSize = (priority: number, role: string) => {
    if (role === 'hero') return { gridColumn: 'span 2', gridRow: 'span 2' };
    if (priority >= 4) return { gridColumn: 'span 2' };
    return {};
  };

  const select = {
    padding: '8px 10px',
    background: 'var(--card)',
    color: 'var(--text)',
    border: 'var(--border)',
    borderRadius: 8
  } as const;

  const intentOptions = ['acquire','convert','educate','trust','delight'] as const;
  const toneOptions = ['bold','calm','playful','serious','futuristic'] as const;
  const roleOptions = ['header','hero','feature','testimonial','cta','gallery','content','footer'] as const;

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: gridTemplate as any,
        gap: 16
      }}>
        {components.map((c) => (
          <div key={c.id} style={{
            border: 'var(--border)',
            borderRadius: 12,
            background: 'var(--surface)',
            padding: 12,
            ...cardSize(c.priority, c.role)
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <input
                value={c.title}
                onChange={(e) => updateComponent(projectId, c.id, { title: e.target.value })}
                style={{ width: '70%', padding: 8, background: 'var(--card)', color: 'var(--text)', border: 'var(--border)', borderRadius: 8 }}
              />
              <select value={c.role} onChange={(e) => updateComponent(projectId, c.id, { role: e.target.value as any })} style={select as any}>
                {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <textarea
              value={c.body}
              onChange={(e) => updateComponent(projectId, c.id, { body: e.target.value })}
              style={{ width: '100%', minHeight: 80, padding: 8, background: 'var(--card)', color: 'var(--text)', border: 'var(--border)', borderRadius: 8 }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' as const }}>
              <label style={{ fontSize: 12, opacity: 0.8 }}>Priority</label>
              <input
                type="range"
                min={1}
                max={5}
                value={c.priority}
                onChange={(e) => updateComponent(projectId, c.id, { priority: Number(e.target.value) })}
              />
              <label style={{ fontSize: 12, opacity: 0.8 }}>Intent</label>
              <select value={c.intent || ''} onChange={(e) => updateComponent(projectId, c.id, { intent: e.target.value as any })} style={select as any}>
                <option value="">—</option>
                {intentOptions.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              <label style={{ fontSize: 12, opacity: 0.8 }}>Tone</label>
              <select value={c.tone || ''} onChange={(e) => updateComponent(projectId, c.id, { tone: e.target.value as any })} style={select as any}>
                <option value="">—</option>
                {toneOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div style={{ gridColumn: 'span 2' }}>
                <ThemeSelector
                  value={c.theme || ''}
                  onChange={(themeId) => updateComponent(projectId, c.id, { theme: themeId })}
                  mode="dropdown"
                  showInherit={true}
                  inheritLabel={`Use project theme (${project?.theme || 'gradient'})`}
                  label="Theme Override"
                />
              </div>
              <select
                value={advisorOverride}
                onChange={(e) => setAdvisorOverride((e.target.value || '') as AdvisorCode | '')}
                style={select as any}
                title="Advisor (professional title)"
              >
                <option value="">Auto (role-based)</option>
                {advisorOptions.map(opt => (
                  <option key={opt.code} value={opt.code}>{opt.title}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const suggestion = getProfessionalSuggestion(c as any, project as any, advisorOverride || undefined);
                  updateComponent(projectId, c.id, {
                    title: suggestion.title,
                    body: suggestion.body
                  });
                }}
                title="Get professional suggestion"
                style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--accent)', color: '#0b1020', border: 'none', cursor: 'pointer' }}
              >
                Get professional suggestion
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


