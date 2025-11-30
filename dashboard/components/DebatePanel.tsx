'use client';

export default function DebatePanel() {
  const box = {
    border: 'var(--border)',
    background: 'var(--card)',
    borderRadius: 'var(--radius)',
    padding: 12,
    maxWidth: 520
  } as const;

  const row = { display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 } as const;
  const badge = (bg: string) => ({ fontSize: 12, padding: '2px 8px', borderRadius: 999, background: bg, color: '#0b1020', fontWeight: 700 }) as const;
  const p = { fontSize: 12, lineHeight: 1.5, opacity: 0.9 } as const;

  return (
    <div style={box as any}>
      <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>Theme rationale (Quark vs. Troi)</div>
      <div style={row as any}>
        <span style={badge('#22d3ee') as any}>Quark</span>
        <p style={p as any}>"Lead with intent. If you want wallets open, pick patterns that convert. Bold contrast, clear CTAs, and decisive motion. Brand follows revenue."</p>
      </div>
      <div style={row as any}>
        <span style={badge('#a78bfa') as any}>Troi</span>
        <p style={p as any}>"Users are people. Choose tones that respect context: calm for trust, playful for exploration. Align emotion with intent and you earn loyalty, not just clicks."</p>
      </div>
      <div style={{ fontSize: 11, opacity: 0.75 }}>Guideline: Select Business Intent → choose Human Tone → theme maps accordingly. You can fine-tune in advanced style switcher.</div>
    </div>
  );
}



