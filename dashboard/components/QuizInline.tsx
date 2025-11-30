'use client';

import { useState } from 'react';

type ThemeId = 'mochaEarth' | 'verdantNature' | 'chromeMetallic' | 'brutalist' | 'mutedNeon' | 'monochromeBlue' | 'gradient' | 'pastel' | 'cyberpunk' | 'glassmorphism' | 'midnight' | 'offworld';

interface QuizInlineProps {
  projectId: string;
  onApplyTheme?: (themeId: string) => void;
}

const QUESTIONS: Array<{ q: string; key: ThemeId }> = [
  // 2025 Trends
  { q: 'Do you want warm, sophisticated earth tones (Pantone 2025)?', key: 'mochaEarth' },
  { q: 'Is sustainability and eco-consciousness central to your brand?', key: 'verdantNature' },
  { q: 'Do you need a high-tech, metallic, luxury aesthetic?', key: 'chromeMetallic' },
  { q: 'Do you prefer pure minimalism with raw authenticity?', key: 'brutalist' },
  { q: 'Do you want calm sophistication with surprise neon accents?', key: 'mutedNeon' },
  { q: 'Do you need professional trust with a single-hue color story?', key: 'monochromeBlue' },
  // Classic themes
  { q: 'Do you prefer vibrant multi-color gradients?', key: 'gradient' },
  { q: 'Do you prefer soft pastels and gentle colors?', key: 'pastel' },
  { q: 'Do you want futuristic neon with high contrast?', key: 'cyberpunk' },
  { q: 'Should it have frosted glass and blur effects?', key: 'glassmorphism' },
  { q: 'Will this be used primarily in dark environments?', key: 'midnight' },
  { q: 'Should it feel otherworldly with glowing panels?', key: 'offworld' }
];

export default function QuizInline({ projectId, onApplyTheme }: QuizInlineProps) {
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<Record<ThemeId, number>>({
    mochaEarth: 0,
    verdantNature: 0,
    chromeMetallic: 0,
    brutalist: 0,
    mutedNeon: 0,
    monochromeBlue: 0,
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
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'mochaEarth';
  
  const themeNames: Record<ThemeId, string> = {
    mochaEarth: '☕ Mocha Earth',
    verdantNature: '🌿 Verdant Nature',
    chromeMetallic: '🤖 Chrome Future',
    brutalist: '⬛ Brutalist Raw',
    mutedNeon: '✨ Muted Neon',
    monochromeBlue: '🔵 Monochrome Blue',
    gradient: '🌈 Gradient Fusion',
    pastel: '🌸 Pastel',
    cyberpunk: '🔮 Cyberpunk',
    glassmorphism: '🪟 Glass',
    midnight: '🌙 Midnight',
    offworld: '🛸 Offworld'
  };

  return (
    <div>
      {!done ? (
        <div style={{ border: 'var(--border)', padding: 16, borderRadius: 12, background: 'var(--card)' }}>
          <div style={{ marginBottom: 12, fontWeight: 500 }}>{QUESTIONS[idx].q}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
            <button onClick={() => answer(true)} style={{ padding: '10px 20px', borderRadius: 8, cursor: 'pointer', background: 'var(--accent)', border: 'none', color: '#0a0015', fontWeight: 600 }}>Yes</button>
            <button onClick={() => answer(false)} style={{ padding: '10px 20px', borderRadius: 8, cursor: 'pointer', background: 'var(--card-alt)', border: 'var(--border)', color: 'var(--text)' }}>No</button>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>Question {idx + 1} / {QUESTIONS.length}</div>
        </div>
      ) : (
        <div style={{ border: 'var(--border)', padding: 16, borderRadius: 12, background: 'var(--card)' }}>
          <div style={{ marginBottom: 8, fontSize: 14, opacity: 0.8 }}>✨ Based on your answers, we recommend:</div>
          <div style={{ marginBottom: 16, fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{themeNames[recommended]}</div>
          <button onClick={() => onApplyTheme?.(recommended)} style={{ display: 'inline-block', padding: '12px 20px', borderRadius: 8, fontWeight: 600, background: 'var(--accent)', color: '#0a0015', border: 'none', cursor: 'pointer' }}>Apply to project {projectId}</button>
          <button onClick={() => { setIdx(0); setScores(Object.fromEntries(Object.keys(scores).map(k => [k, 0])) as any); setDone(false); }} style={{ marginLeft: 12, padding: '12px 20px', borderRadius: 8, background: 'var(--card-alt)', color: 'var(--text)', border: 'var(--border)', cursor: 'pointer' }}>Retake Quiz</button>
        </div>
      )}
    </div>
  );
}


