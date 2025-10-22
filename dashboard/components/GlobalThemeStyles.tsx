'use client';

import { useEffect } from 'react';
import { useAppState } from '@/lib/state-manager';

const THEME_MAP: Record<string, { bg: string; text: string; card: string; accent: string; subtle: string }>= {
  glassmorphism: { bg: 'linear-gradient(135deg,#1a1a2e 0%, #16213e 100%)', text: '#ffffff', card: 'rgba(255,255,255,0.1)', accent: '#8b5cf6', subtle: 'rgba(255,255,255,0.2)' },
  neumorphism: { bg: 'linear-gradient(135deg,#e0e5ec 0%, #d1d9e6 100%)', text: '#2c3e50', card: '#e0e5ec', accent: '#7c3aed', subtle: 'rgba(0,0,0,0.1)' },
  neubrutalism: { bg: 'linear-gradient(135deg,#fafafa 0%, #f5f5f5 100%)', text: '#1a1a1a', card: '#ffffff', accent: '#f59e0b', subtle: '#000000' },
  material: { bg: 'linear-gradient(135deg,#f8f9fa 0%, #e9ecef 100%)', text: '#1c1b1f', card: '#ffffff', accent: '#3b82f6', subtle: 'rgba(0,0,0,0.12)' },
  midnight: { bg: 'linear-gradient(135deg,#0a0a0f 0%, #121218 100%)', text: '#e0e0e0', card: '#1a1a24', accent: '#00ffaa', subtle: 'rgba(0,255,255,0.2)' },
  pastel: { bg: 'linear-gradient(135deg,#fff5f7 0%, #f5f8ff 100%)', text: '#4a4a4a', card: '#ffffff', accent: '#a78bfa', subtle: 'rgba(0,0,0,0.05)' },
  gradient: { bg: 'linear-gradient(135deg,#667eea 0%, #764ba2 50%, #f093fb 100%)', text: '#2d3748', card: 'rgba(255,255,255,0.95)', accent: '#22d3ee', subtle: 'transparent' },
  corporate: { bg: 'linear-gradient(135deg,#f0f4f8 0%, #e1e8ed 100%)', text: '#2d3748', card: '#ffffff', accent: '#2563eb', subtle: '#cbd5e0' },
  organic: { bg: 'linear-gradient(135deg,#f0ebe3 0%, #e8e1d7 100%)', text: '#3e3632', card: '#f7f4f0', accent: '#22c55e', subtle: '#c8bfb3' },
  cyberpunk: { bg: 'linear-gradient(135deg,#0a0015 0%, #150a1f 100%)', text: '#00ffff', card: '#1a0f2e', accent: '#f43f5e', subtle: '#ff00ff' },
  offworld: { bg: 'linear-gradient(135deg, #0a0a0f 0%, #121218 100%)', text: '#e0e0e0', card: 'rgba(255,255,255,0.08)', accent: '#00ffff', subtle: 'rgba(0, 255, 255, 0.15)' }
};

export default function GlobalThemeStyles() {
  const { globalTheme } = useAppState();
  useEffect(() => {
    const theme = THEME_MAP[globalTheme] || THEME_MAP.midnight;
    const r = document.documentElement.style;
    r.setProperty('--bg', theme.bg);
    r.setProperty('--text', theme.text);
    r.setProperty('--card', theme.card);
    r.setProperty('--accent', theme.accent);
    r.setProperty('--subtle', theme.subtle);
  }, [globalTheme]);
  return null;
}


