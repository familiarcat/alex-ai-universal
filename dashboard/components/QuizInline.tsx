'use client';

import { useState } from 'react';

type ThemeId = 'gradient' | 'pastel' | 'cyberpunk' | 'glassmorphism' | 'midnight' | 'offworld';

interface QuizInlineProps {
  projectId: string;
  onApplyTheme?: (themeId: ThemeId) => void;
}

const QUESTIONS: Array<{ q: string; key: ThemeId }> = [
  { q: 'Do you prefer neon accents and high contrast?', key: 'cyberpunk' },
  { q: 'Do you prefer soft colors and calm mood?', key: 'pastel' },
  { q: 'Will this be used primarily in dark environments?', key: 'midnight' },
  { q: 'Should it feel glossy and layered?', key: 'glassmorphism' },
  { q: 'Should it feel otherworldly with glowing panels?', key: 'offworld' },
  { q: 'Should it feel vibrant and energetic?', key: 'gradient' }
];

export default function QuizInline({ projectId, onApplyTheme }: QuizInlineProps) {
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<Record<ThemeId, number>>({
    gradient: 0,
    pastel: 0,
    cyberpunk: 0,
    glassmorphism: 0,
    midnight: 0,
    offworld: 0
  });
  const [done, setDone] = useState(false);

  function answer(yes: boolean) {
    if (done) return;
    const themeKey = QUESTIONS[idx].key;
    setScores((s) => ({ ...s, [themeKey]: s[themeKey] + (yes ? 1 : 0) }));
    if (idx + 1 >= QUESTIONS.length) setDone(true);
    else setIdx((i) => i + 1);
  }

  const recommended = (Object.entries(scores) as Array<[ThemeId, number]>)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'midnight';

  return (
    <div>
      {!done ? (
        <div style={{ border: 'var(--border)', padding: 16, borderRadius: 12, background: 'var(--card)' }}>
          <div style={{ marginBottom: 12 }}>{QUESTIONS[idx].q}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
            <button onClick={() => answer(true)} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', background: 'var(--subtle)', border: '1px solid var(--subtle)', color: 'var(--text)' }}>Yes</button>
            <button onClick={() => answer(false)} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', background: 'var(--card-alt)', border: '1px solid var(--subtle)', color: 'var(--text)' }}>No</button>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>Question {idx + 1} / {QUESTIONS.length}</div>
        </div>
      ) : (
        <div style={{ border: 'var(--border)', padding: 16, borderRadius: 12, background: 'var(--card)' }}>
          <div style={{ marginBottom: 8 }}>Recommended theme</div>
          <div style={{ marginBottom: 12, fontWeight: 700 }}>{recommended}</div>
          <button onClick={() => onApplyTheme?.(recommended)} style={{ display: 'inline-block', padding: '10px 14px', borderRadius: 8, fontWeight: 600, background: 'var(--accent)', color: '#0a0015', border: 'none', cursor: 'pointer' }}>Apply to project {projectId}</button>
        </div>
      )}
    </div>
  );
}


