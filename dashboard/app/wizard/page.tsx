'use client';

import { useState } from 'react';
import { useAppState } from '@/lib/state-manager';

type Step = 0 | 1 | 2;

export default function WizardPage() {
  const { updateProject, updateTheme } = useAppState();
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState('');
  const [project, setProject] = useState('alpha');
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('gradient');

  return (
    <main style={{ padding: '90px 24px 40px', color: 'var(--text)' }}>
      <h1 style={{ color: 'var(--accent)', fontSize: 28, marginBottom: 10 }}>🎭 Setup Wizard</h1>
      {step === 0 && (
        <div style={{ border: '1px solid var(--subtle)', padding: 16, borderRadius: 12, background: 'var(--card)' }}>
          <div style={{ marginBottom: 10 }}>Your name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{
            width: '100%', padding: 10, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid var(--subtle)', borderRadius: 8
          }} />
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setStep(1)} disabled={!name} style={{
              padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
              background: !name ? 'rgba(0,0,0,0.2)' : '#00ffaa', color: '#0a0015', border: 'none'
            }}>Next</button>
          </div>
        </div>
      )}
      {step === 1 && (
        <div style={{ border: '1px solid var(--subtle)', padding: 16, borderRadius: 12, background: 'var(--card)' }}>
          <div style={{ marginBottom: 10 }}>Pick project</div>
          <select value={project} onChange={(e) => setProject(e.target.value)} style={{
            padding: 10, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid var(--subtle)', borderRadius: 8
          }}>
            <option value="alpha">Alpha</option>
            <option value="beta">Beta</option>
            <option value="gamma">Gamma</option>
          </select>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={() => setStep(0)} style={{ padding: '8px 12px', borderRadius: 8 }}>Back</button>
            <button onClick={() => setStep(2)} style={{ padding: '8px 12px', borderRadius: 8, background: '#00ffaa', color: '#0a0015', border: 'none' }}>Next</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div style={{ border: '1px solid var(--subtle)', padding: 16, borderRadius: 12, background: 'var(--card)' }}>
          <div style={{ marginBottom: 10 }}>Customize content for {project}</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <input placeholder="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} style={{
              padding: 10, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid var(--subtle)', borderRadius: 8
            }} />
            <input placeholder="Subheadline" value={subheadline} onChange={(e) => setSubheadline(e.target.value)} style={{
              padding: 10, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid var(--subtle)', borderRadius: 8
            }} />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{
              padding: 10, minHeight: 100, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid var(--subtle)', borderRadius: 8
            }} />
            <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{
              padding: 10, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid var(--subtle)', borderRadius: 8
            }}>
              <option value="gradient">Gradient</option>
              <option value="pastel">Pastel</option>
              <option value="cyberpunk">Cyberpunk</option>
              <option value="glassmorphism">Glass</option>
              <option value="midnight">Midnight</option>
            </select>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            <button onClick={() => setStep(1)} style={{ padding: '8px 12px', borderRadius: 8 }}>Back</button>
            <button onClick={() => {
              if (headline) updateProject(project as any, 'headline', headline);
              if (subheadline) updateProject(project as any, 'subheadline', subheadline);
              if (description) updateProject(project as any, 'description', description);
              if (theme) updateTheme(project as any, theme);
              setStep(0);
            }} style={{ padding: '8px 12px', borderRadius: 8, background: '#00ffaa', color: '#0a0015', border: 'none' }}>Apply</button>
          </div>
        </div>
      )}
    </main>
  );
}


