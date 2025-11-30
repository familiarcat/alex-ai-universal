'use client';

import Link from 'next/link';
import { useAppState } from '@/lib/state-manager';
import { useMemo, useState } from 'react';

type SortKey = 'name' | 'theme' | 'updated';

export default function GalleryPage() {
  const { projects } = useAppState();
  const [query, setQuery] = useState('');
  const [themeFilter, setThemeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('name');

  const items = useMemo(() => {
    const entries = Object.entries(projects).map(([id, c]) => ({ id, ...c }));
    const filtered = entries.filter((p) => {
      const hay = `${p.headline} ${p.subheadline} ${p.description} ${p.theme}`.toLowerCase();
      const matchQuery = hay.includes(query.toLowerCase());
      const matchTheme = themeFilter === 'all' ? true : p.theme === themeFilter;
      return matchQuery && matchTheme;
    });
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'theme') return a.theme.localeCompare(b.theme);
      if (sortBy === 'updated') return (b.updatedAt || 0) - (a.updatedAt || 0);
      return a.headline.localeCompare(b.headline);
    });
    return sorted;
  }, [projects, query, sortBy, themeFilter]);

  const themes = Array.from(new Set(Object.values(projects).map((p) => p.theme)));

  // Per-project thumbnail style map (mirrors project page styles)
  const themeStyles: Record<string, { background: string; textColor: string; accentColor: string }>= {
    gradient: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', textColor: '#ffffff', accentColor: '#f093fb' },
    pastel: { background: 'linear-gradient(135deg, #fff5f7 0%, #f5f8ff 100%)', textColor: '#4a4a4a', accentColor: '#a78bfa' },
    cyberpunk: { background: 'linear-gradient(135deg, #0a0015 0%, #150a1f 100%)', textColor: '#d0d0d0', accentColor: '#00ffaa' },
    midnight: { background: 'linear-gradient(135deg,#0f1115 0%, #12141b 100%)', textColor: '#e6e6e6', accentColor: '#00ffaa' },
    glassmorphism: { background: 'linear-gradient(135deg,#1a1a2e 0%, #16213e 100%)', textColor: '#ffffff', accentColor: '#8b5cf6' },
    material: { background: 'linear-gradient(135deg,#f8f9fa 0%, #e9ecef 100%)', textColor: '#1c1b1f', accentColor: '#3b82f6' }
  };

  return (
    <main style={{ padding: '90px 24px 40px', color: 'var(--text)' }}>
      <h1 style={{ color: 'var(--accent)', fontSize: '28px', marginBottom: 12 }}>🖼️ Project Gallery</h1>

      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 14,
        border: '1px solid rgba(0,255,170,0.25)', padding: 12, borderRadius: 10, background: 'rgba(0,255,170,0.04)'
      }}>
        <input
          placeholder="Search projects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            minWidth: 220, padding: '10px 12px', borderRadius: 8,
            background: 'rgba(0,0,0,0.35)', color: 'var(--text)', border: '1px solid var(--subtle)'
          }}
        />
        <select value={themeFilter} onChange={(e) => setThemeFilter(e.target.value)} style={{
          padding: '10px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.35)', color: 'var(--text)', border: '1px solid var(--subtle)'
        }}>
          <option value="all">All themes</option>
          {themes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} style={{
          padding: '10px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.35)', color: 'var(--text)', border: '1px solid var(--subtle)'
        }}>
          <option value="name">Sort by name</option>
          <option value="theme">Sort by theme</option>
        </select>
        <div style={{ marginLeft: 'auto', opacity: 0.8, fontSize: 12 }}>Results: {items.length}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {items.map((p) => {
          const s = themeStyles[p.theme] || themeStyles.gradient;
          return (
            <div key={p.id} className="card" style={{ border: 'var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              {/* Thumbnail preview using project theme (isolated visuals) */}
              <div style={{ background: s.background, color: s.textColor, padding: 16 }}>
                <div style={{
                  textAlign: 'left',
                  padding: '28px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.12)'
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{p.headline}</div>
                  <div style={{ fontSize: 13, opacity: 0.9 }}>{p.subheadline}</div>
                </div>
              </div>

              {/* Meta + actions */}
              <div style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  Theme: {p.theme} • Updated: {p.updatedAt ? new Date(p.updatedAt).toLocaleTimeString() : '—'}
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <Link href={`/projects/${p.id}?embed=1`} aria-label={`View ${p.id}`} style={{
                    background: 'var(--accent)', color: '#0b1020', padding: '8px 12px', borderRadius: 10, textDecoration: 'none', fontSize: 12, fontWeight: 600
                  }}>View</Link>
                  <Link href={`/dashboard?project=${p.id}`} aria-label={`Edit ${p.id}`} style={{
                    background: 'var(--card-alt)', color: 'var(--text)', border: 'var(--border)', padding: '8px 12px', borderRadius: 10, textDecoration: 'none', fontSize: 12, fontWeight: 600
                  }}>Edit</Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}


