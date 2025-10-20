'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Command = { label: string; href: string; keywords?: string };

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const commands: Command[] = useMemo(
    () => [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard', keywords: 'main editor' },
      { label: 'Gallery', href: '/gallery', keywords: 'projects cards' },
      { label: 'Quiz', href: '/quiz', keywords: 'recommendation' },
      { label: 'Wizard', href: '/wizard', keywords: 'setup' },
      { label: 'Projects', href: '/projects', keywords: 'index' },
      { label: 'Observation Lounge', href: '/reports/observation-lounge', keywords: 'briefing findings' },
      { label: 'Project Alpha', href: '/projects/alpha' },
      { label: 'Project Beta', href: '/projects/beta' },
      { label: 'Project Gamma', href: '/projects/gamma' }
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      c.label.toLowerCase().includes(q) || (c.keywords || '').toLowerCase().includes(q)
    );
  }, [commands, query]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 120
      }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(720px, 92vw)',
          background: 'rgba(10,0,21,0.98)',
          border: '1px solid rgba(0,255,170,0.35)',
          borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
        }}
      >
        <div style={{ padding: 12, borderBottom: '1px solid rgba(0,255,170,0.2)' }}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search... (Esc to close)"
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(0,0,0,0.35)',
              color: '#d0d0d0',
              border: '1px solid rgba(0,255,170,0.35)',
              borderRadius: 8
            }}
          />
        </div>
        <div style={{ maxHeight: 360, overflow: 'auto', padding: 8 }}>
          {filtered.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '10px 12px',
                color: pathname === c.href ? '#0a0015' : '#d0d0d0',
                background: pathname === c.href ? '#00ffaa' : 'transparent',
                borderRadius: 8,
                textDecoration: 'none',
                marginBottom: 6
              }}
            >
              {c.label}
            </Link>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 12, opacity: 0.7 }}>No matches.</div>
          )}
        </div>
        <div style={{ padding: 10, borderTop: '1px solid rgba(0,255,170,0.2)', fontSize: 12, opacity: 0.75 }}>
          Tip: Press ⌘K / Ctrl+K to toggle the palette.
        </div>
      </div>
    </div>
  );
}



