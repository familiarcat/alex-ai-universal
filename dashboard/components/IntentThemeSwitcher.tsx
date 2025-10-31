'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAppState } from '@/lib/state-manager';

type BusinessIntent = 'acquire' | 'convert' | 'educate' | 'trust' | 'delight';
type HumanTone = 'bold' | 'calm' | 'playful' | 'serious' | 'futuristic';

const INTENT_TO_THEME: Record<BusinessIntent, Partial<Record<HumanTone, string>>> = {
  acquire:    { bold: 'brutalist', playful: 'gradient', futuristic: 'cyberpunk' },
  convert:    { bold: 'monochromeBlue', calm: 'mochaEarth', serious: 'monochromeBlue' },
  educate:    { calm: 'pastel', serious: 'monochromeBlue', playful: 'glassmorphism' },
  trust:      { calm: 'mochaEarth', serious: 'midnight', bold: 'monochromeBlue' },
  delight:    { playful: 'glassmorphism', bold: 'gradient', futuristic: 'cyberpunk' }
};

export default function IntentThemeSwitcher() {
  const { updateGlobalTheme, globalTheme } = useAppState();
  const [intent, setIntent] = useState<BusinessIntent>('convert');
  const [tone, setTone] = useState<HumanTone>('calm');

  const themeId = useMemo(() => {
    const mapped = INTENT_TO_THEME[intent]?.[tone];
    return mapped || globalTheme || 'midnight';
  }, [intent, tone, globalTheme]);

  // Apply only on explicit action
  const apply = () => {
    if (themeId && themeId !== globalTheme) updateGlobalTheme(themeId);
  };

  const pill = { padding: '8px 10px', border: 'var(--border)', borderRadius: 10, background: 'var(--card)', color: 'var(--text)', cursor: 'pointer' } as const;

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <label style={{ fontSize: 12, opacity: 0.8 }}>Intent</label>
      <select value={intent} onChange={(e)=> setIntent(e.target.value as BusinessIntent)} style={pill as any}>
        <option value="acquire">Acquire attention</option>
        <option value="convert">Convert to action</option>
        <option value="educate">Educate/learn</option>
        <option value="trust">Build trust</option>
        <option value="delight">Delight/brand</option>
      </select>
      <label style={{ fontSize: 12, opacity: 0.8 }}>Tone</label>
      <select value={tone} onChange={(e)=> setTone(e.target.value as HumanTone)} style={pill as any}>
        <option value="bold">Bold</option>
        <option value="calm">Calm</option>
        <option value="playful">Playful</option>
        <option value="serious">Serious</option>
        <option value="futuristic">Futuristic</option>
      </select>
      <button onClick={apply} style={{ ...pill, background: 'var(--accent)', color: '#0b1020', border: 'none' } as any}>Apply</button>
      <span style={{ fontSize: 12, opacity: 0.75 }}>Theme → {themeId}</span>
    </div>
  );
}


