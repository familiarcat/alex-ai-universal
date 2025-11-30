'use client';

import React, { useEffect, useMemo } from 'react';
import { useAppState } from '@/lib/state-manager';

type Theme = {
  bg: string;
  text: string;
  textMuted: string;
  card: string;
  cardAlt?: string;
  accent: string;
  subtle: string;
  border: string;
  radius: string;
  shadow: string;
  elevation: string;
  blur: string;
  font: string;
};

const THEME_MAP: Record<string, Theme> = {
  glassmorphism: { bg: 'linear-gradient(135deg,#1a1a2e 0%, #16213e 100%)', text: '#ffffff', textMuted: 'rgba(255,255,255,0.75)', card: 'rgba(255,255,255,0.08)', cardAlt: 'rgba(255,255,255,0.12)', accent: '#8b5cf6', subtle: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', radius: '16px', shadow: '0 8px 24px rgba(0,0,0,0.35)', elevation: '0 4px 12px rgba(0,0,0,0.25)', blur: '14px', font: '"Inter", "Plus Jakarta Sans", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' },
  neumorphism: { bg: 'linear-gradient(135deg,#e0e5ec 0%, #d1d9e6 100%)', text: '#2c3e50', textMuted: 'rgba(44,62,80,0.75)', card: '#e6ebf2', cardAlt: '#e0e5ec', accent: '#7c3aed', subtle: 'rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.7)', radius: '18px', shadow: '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.9)', elevation: '4px 4px 8px rgba(163,177,198,0.45), -4px -4px 8px rgba(255,255,255,0.9)', blur: '0px', font: '"SF Pro Text", "Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' },
  neubrutalism: { bg: 'linear-gradient(135deg,#fafafa 0%, #f5f5f5 100%)', text: '#111111', textMuted: '#3a3a3a', card: '#ffffff', cardAlt: '#fefefe', accent: '#f59e0b', subtle: '#000000', border: '4px solid #111111', radius: '10px', shadow: '8px 8px 0 #111111', elevation: '4px 4px 0 #111111', blur: '0px', font: '"Syne", "Space Grotesk", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' },
  material: { bg: 'linear-gradient(135deg,#f8f9fa 0%, #e9ecef 100%)', text: '#1c1b1f', textMuted: 'rgba(28,27,31,0.75)', card: '#ffffff', cardAlt: '#f9fafb', accent: '#3b82f6', subtle: 'rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.12)', radius: '12px', shadow: '0 1px 2px rgba(0,0,0,0.06), 0 3px 6px rgba(0,0,0,0.08)', elevation: '0 2px 8px rgba(0,0,0,0.12)', blur: '0px', font: '"Roboto Flex", "Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' },
  midnight: { bg: 'linear-gradient(135deg,#0f1115 0%, #12141b 100%)', text: '#e6e6e6', textMuted: 'rgba(230,230,230,0.7)', card: '#171a22', cardAlt: '#1b1f29', accent: '#00ffaa', subtle: 'rgba(0,255,255,0.18)', border: '1px solid rgba(255,255,255,0.08)', radius: '14px', shadow: '0 10px 30px rgba(0,0,0,0.6)', elevation: '0 6px 18px rgba(0,0,0,0.5)', blur: '8px', font: '"Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' },
  pastel: { bg: 'linear-gradient(135deg,#fff5f7 0%, #f5f8ff 100%)', text: '#3f3f46', textMuted: 'rgba(63,63,70,0.7)', card: '#ffffff', cardAlt: '#fffafd', accent: '#a78bfa', subtle: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.06)', radius: '16px', shadow: '0 6px 18px rgba(17,24,39,0.06)', elevation: '0 3px 10px rgba(17,24,39,0.08)', blur: '0px', font: '"General Sans", "Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' },
  gradient: { bg: 'linear-gradient(135deg,#667eea 0%, #764ba2 50%, #f093fb 100%)', text: '#1f2937', textMuted: 'rgba(31,41,55,0.75)', card: 'rgba(255,255,255,0.92)', cardAlt: 'rgba(255,255,255,0.98)', accent: '#22d3ee', subtle: 'transparent', border: '1px solid rgba(255,255,255,0.4)', radius: '14px', shadow: '0 10px 24px rgba(0,0,0,0.2)', elevation: '0 6px 16px rgba(0,0,0,0.18)', blur: '10px', font: '"Plus Jakarta Sans", "Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' },
  corporate: { bg: 'linear-gradient(135deg,#f0f4f8 0%, #e1e8ed 100%)', text: '#2d3748', textMuted: 'rgba(45,55,72,0.75)', card: '#ffffff', cardAlt: '#f8fafc', accent: '#2563eb', subtle: '#cbd5e0', border: '1px solid #e2e8f0', radius: '12px', shadow: '0 2px 8px rgba(0,0,0,0.08)', elevation: '0 4px 12px rgba(0,0,0,0.1)', blur: '0px', font: '"IBM Plex Sans", "Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' },
  organic: { bg: 'linear-gradient(135deg,#f0ebe3 0%, #e8e1d7 100%)', text: '#3e3632', textMuted: 'rgba(62,54,50,0.75)', card: '#f7f4f0', cardAlt: '#f2eee8', accent: '#22c55e', subtle: '#c8bfb3', border: '1px solid #ddd4c8', radius: '18px', shadow: '0 8px 20px rgba(112,66,20,0.12)', elevation: '0 4px 12px rgba(112,66,20,0.16)', blur: '0px', font: '"Georgia", ui-serif, serif' },
  cyberpunk: { bg: 'linear-gradient(135deg,#0a0015 0%, #150a1f 100%)', text: '#e6faff', textMuted: 'rgba(230,250,255,0.7)', card: '#150f2a', cardAlt: '#1a1233', accent: '#f43f5e', subtle: '#8a2be2', border: '1px solid rgba(255,0,255,0.28)', radius: '14px', shadow: '0 12px 36px rgba(255,0,255,0.18), inset 0 0 0 1px rgba(0,255,255,0.08)', elevation: '0 8px 22px rgba(0,255,255,0.14)', blur: '6px', font: '"Oxanium", "Orbitron", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' }
};

function applyTheme(name: string) {
  const theme = THEME_MAP[name] ?? THEME_MAP.material;
  const r = document.documentElement.style as any;
  r.setProperty('--bg', theme.bg);
  r.setProperty('--text', theme.text);
  r.setProperty('--text-muted', theme.textMuted);
  r.setProperty('--card', theme.card);
  r.setProperty('--card-alt', theme.cardAlt ?? theme.card);
  r.setProperty('--accent', theme.accent);
  r.setProperty('--subtle', theme.subtle);
  r.setProperty('--border', theme.border);
  r.setProperty('--radius', theme.radius);
  r.setProperty('--shadow', theme.shadow);
  r.setProperty('--elevation', theme.elevation);
  r.setProperty('--blur', theme.blur);
  r.setProperty('--font', theme.font);
  document.documentElement.setAttribute('data-theme', name);
}

export default function ThemeStyleGallery() {
  const { globalTheme, setGlobalTheme } = useAppState();
  const theme = globalTheme ?? 'material';
  const names = useMemo(() => Object.keys(THEME_MAP), []);

  useEffect(() => { applyTheme(theme); }, [theme]);

  return (
    <main className="wrap">
      <header className="toolbar">
        <div>
          <h1>Theme Style Gallery</h1>
          <p className="muted">Preview our 10 curated themes across common UI patterns.</p>
        </div>
        <div className="controls">
          <label className="select">
            <span>Theme</span>
            <select value={theme} onChange={(e)=> setGlobalTheme?.(e.target.value)}>
              {names.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
      </header>

      <div className="grid">
        <section className="section">
          <h2>Typography & Content</h2>
          <p>Body text with <span className="muted">muted secondary</span> information.</p>
        </section>
        <section className="section">
          <h2>Buttons</h2>
          <div className="row">
            <button className="btn primary">Primary</button>
            <button className="btn outline">Outline</button>
            <button className="btn ghost">Ghost</button>
            <button className="btn soft">Soft</button>
          </div>
        </section>
        <section className="section card">
          <h2>Card</h2>
          <p>Reusable container using card tokens.</p>
        </section>
      </div>

      <style jsx global>{`
        .wrap { max-width: 1200px; margin: 0 auto; padding: 32px; color: var(--text); }
        .toolbar { display:flex; align-items:center; justify-content:space-between; gap:24px; margin-bottom: 24px; }
        .muted { color: var(--text-muted); }
        .controls { display:flex; gap:12px; align-items:flex-end; }
        .select { display:flex; flex-direction:column; gap:8px; font-size:14px; }
        .select select { padding:10px 12px; border: var(--border); border-radius: 10px; background: var(--card); color: var(--text); }
        .grid { display:grid; grid-template-columns: repeat(12, 1fr); gap: 24px; }
        .section { grid-column: span 12; background: var(--card); border: var(--border); border-radius: var(--radius); box-shadow: var(--shadow); backdrop-filter: blur(var(--blur)); padding: 20px; }
        .row { display:flex; gap:12px; align-items:center; flex-wrap: wrap; }
        .btn { padding: 10px 14px; border-radius: calc(var(--radius) - 4px); border: none; cursor:pointer; transition: transform .06s ease, box-shadow .06s ease; }
        .btn.primary { background: var(--accent); color: #0b1020; box-shadow: var(--elevation); }
        .btn.outline { background: transparent; border: var(--border); color: var(--text); }
        .btn.ghost { background: transparent; color: var(--text); }
        .btn.soft { background: var(--card-alt); color: var(--text); border: var(--border); }
        .btn:active { transform: translateY(1px); }
      `}</style>
    </main>
  );
}



