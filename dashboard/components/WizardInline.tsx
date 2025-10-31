'use client';

import { useState } from 'react';
import { useAppState } from '@/lib/state-manager';

interface WizardInlineProps {
  projectId: string;
  onApply: (data: { headline?: string; subheadline?: string; description?: string; theme?: string; }) => void;
}

export default function WizardInline({ projectId, onApply }: WizardInlineProps) {
  const { projects } = useAppState();
  const currentProjectTheme = projects[projectId]?.theme || 'gradient';
  
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState(currentProjectTheme);

  return (
    <div style={{ border: 'var(--border)', padding: 16, borderRadius: 12, background: 'var(--card)' }}>
      {step === 0 && (
        <div>
          <div style={{ marginBottom: 8 }}>Set headline and subheadline</div>
          <input placeholder="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} style={{ width: '100%', padding: 10, background: 'var(--card-alt)', color: 'var(--text)', border: 'var(--border)', borderRadius: 8, marginBottom: 8 }} />
          <input placeholder="Subheadline" value={subheadline} onChange={(e) => setSubheadline(e.target.value)} style={{ width: '100%', padding: 10, background: 'var(--card-alt)', color: 'var(--text)', border: 'var(--border)', borderRadius: 8 }} />
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={() => setStep(1)} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--accent)', color: '#0a0015', border: 'none' }}>Next</button>
          </div>
        </div>
      )}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: 8 }}>Describe the project</div>
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', minHeight: 100, padding: 10, background: 'var(--card-alt)', color: 'var(--text)', border: 'var(--border)', borderRadius: 8 }} />
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={() => setStep(0)} style={{ padding: '8px 12px', borderRadius: 8 }}>Back</button>
            <button onClick={() => setStep(2)} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--accent)', color: '#0a0015', border: 'none' }}>Next</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <div style={{ marginBottom: 8 }}>Choose a theme (Current: {currentProjectTheme})</div>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{ width: '100%', padding: 10, background: 'var(--card-alt)', color: 'var(--text)', border: 'var(--border)', borderRadius: 8 }}>
            <optgroup label="🔥 2025 Trending Themes">
              <option value="mochaEarth">☕ Mocha Earth</option>
              <option value="verdantNature">🌿 Verdant Nature</option>
              <option value="chromeMetallic">🤖 Chrome Future</option>
              <option value="brutalist">⬛ Brutalist Raw</option>
              <option value="mutedNeon">✨ Muted Neon</option>
              <option value="monochromeBlue">🔵 Monochrome Blue</option>
            </optgroup>
            <optgroup label="✨ Classic Themes">
              <option value="gradient">🌈 Gradient</option>
              <option value="pastel">🌸 Pastel</option>
              <option value="cyberpunk">🔮 Cyberpunk</option>
              <option value="glassmorphism">🪟 Glass</option>
              <option value="midnight">🌙 Midnight</option>
              <option value="offworld">🛸 Offworld</option>
            </optgroup>
          </select>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            <button onClick={() => setStep(1)} style={{ padding: '8px 12px', borderRadius: 8 }}>Back</button>
            <button onClick={() => onApply({ headline, subheadline, description, theme })} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--accent)', color: '#0a0015', border: 'none' }}>Apply to {projectId}</button>
          </div>
        </div>
      )}
    </div>
  );
}


