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
      <span style={{ fontSize: 12, color: 'var(--header-text, rgba(255, 255, 255, 0.9))', opacity: 0.9 }}>Theme</span>
      <select
        value={globalTheme}
        onChange={(e) => updateGlobalTheme(e.target.value)}
        style={{
          padding: '6px 8px',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'var(--header-text, rgba(255, 255, 255, 0.9))',
          border: '1px solid var(--header-border, rgba(255, 255, 255, 0.2))',
          borderRadius: 6,
          cursor: 'pointer'
        }}
      >
        {THEMES.map((t) => (
          <option key={t.id} value={t.id} style={{ background: 'var(--header-bg, rgba(15, 15, 20, 0.95))', color: 'var(--header-text, rgba(255, 255, 255, 0.9))' }}>{t.label}</option>
        ))}
      </select>
    </div>
  );
}


