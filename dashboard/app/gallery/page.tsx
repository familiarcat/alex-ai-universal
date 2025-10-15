'use client';

import Link from 'next/link';
import { useAppState } from '@/lib/state-manager';
import { useMemo, useState } from 'react';

type SortKey = 'name' | 'theme';

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
      return a.headline.localeCompare(b.headline);
    });
    return sorted;
  }, [projects, query, sortBy, themeFilter]);

  const themes = Array.from(new Set(Object.values(projects).map((p) => p.theme)));

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {items.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} style={{
            display: 'block',
            border: '1px solid var(--subtle)',
            background: 'linear-gradient( to bottom right, var(--card), rgba(0,0,0,0.35) )',
            padding: 16,
            borderRadius: 12,
            textDecoration: 'none',
            color: 'var(--text)'
          }}>
            <div style={{ fontSize: 18, color: 'var(--accent)', marginBottom: 6 }}>{p.headline}</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 8 }}>{p.subheadline}</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8, lineHeight: 1.5 }}>{p.description}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Theme: {p.theme}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}


