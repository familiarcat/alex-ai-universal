'use client';

import { useAppState } from '@/lib/state-manager';

const THEMES = [
  { id: 'glassmorphism', label: 'Glassmorphism' },
  { id: 'neumorphism', label: 'Neumorphism' },
  { id: 'neubrutalism', label: 'Neubrutalism' },
  { id: 'material', label: 'Material' },
  { id: 'midnight', label: 'Midnight' },
  { id: 'pastel', label: 'Pastel' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'organic', label: 'Organic' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'offworld', label: 'Offworld Panel' }
];

export default function GlobalThemeSwitcher() {
  const { globalTheme, updateGlobalTheme } = useAppState();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, opacity: 0.75 }}>Theme</span>
      <select
        value={globalTheme}
        onChange={(e) => updateGlobalTheme(e.target.value)}
        style={{
          padding: '6px 8px',
          background: 'rgba(0,0,0,0.35)',
          color: '#d0d0d0',
          border: '1px solid rgba(0,255,170,0.35)',
          borderRadius: 6
        }}
      >
        {THEMES.map((t) => (
          <option key={t.id} value={t.id}>{t.label}</option>
        ))}
      </select>
    </div>
  );
}


