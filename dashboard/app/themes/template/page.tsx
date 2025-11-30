'use client';

import Link from 'next/link';

const TOKEN_KEYS = [
  '--primary',
  '--secondary',
  '--accent',
  '--background',
  '--surface',
  '--text',
  '--heading',
  '--text-muted',
  '--border',
  '--shadow',
  '--on-primary',
  '--scrim',
];

function ThemeShowcase() {
  const card = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 16,
    color: 'var(--text)'
  } as const;

  const heading = { color: 'var(--heading, var(--text))', marginBottom: 8 } as const;
  const muted = { color: 'var(--text-muted, var(--text))', fontSize: 14 } as const;

  return (
    <div style={{ padding: 24, display: 'grid', gap: 16 }}>
      <h1 style={heading}>Theme UI Template</h1>
      <p style={muted}>All elements below use design tokens (surface, border, text, heading, text-muted, primary, on-primary).</p>

      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div style={card}>
          <h2 style={heading}>Buttons</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button style={{ background: 'var(--primary)', color: 'var(--on-primary, #fff)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 8 }}>Primary</button>
            <button style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 8 }}>Secondary</button>
            <button style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px dashed var(--border)', padding: '8px 12px', borderRadius: 8 }}>Ghost</button>
          </div>
        </div>

        <div style={card}>
          <h2 style={heading}>Inputs</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={muted}>Label</label>
            <input placeholder="Placeholder" style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', padding: 8, borderRadius: 8 }} />
            <small style={muted}>Helper text sits here</small>
          </div>
        </div>

        <div style={card}>
          <h2 style={heading}>Alerts</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 12, borderRadius: 8 }}>
              <strong style={heading as any}>Info</strong>
              <p style={muted}>Informational message using standard tokens.</p>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 12, borderRadius: 8 }}>
              <strong style={heading as any}>Success</strong>
              <p style={muted}>Operation completed successfully.</p>
            </div>
          </div>
        </div>

        <div style={card}>
          <h2 style={heading}>Cards</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 12, borderRadius: 8 }}>
              <h3 style={heading as any}>Card title</h3>
              <p style={muted}>Body copy to validate contrast and hierarchy.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ThemeTemplatePage() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gap: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Theme Template</h1>
          <div style={{ opacity: 0.8, marginBottom: 16 }}>
            Use this page to preview and validate universal theme tokens. Switch themes in the navbar and verify variables apply correctly.
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {TOKEN_KEYS.map((token) => (
              <div key={token} style={{ border: 'var(--border)', borderRadius: 12, padding: 16, background: 'var(--surface)' }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{token}</div>
                <div
                  style={{
                    height: 60,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: `var(${token})`,
                  }}
                />
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>value of var({token})</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <Link
              href="/gallery"
              style={{ border: 'var(--border)', padding: '8px 12px', borderRadius: 8, textDecoration: 'none', color: 'var(--text)' }}
            >
              ← Back to Gallery
            </Link>
            <Link
              href="/dashboard"
              style={{ border: 'var(--border)', padding: '8px 12px', borderRadius: 8, textDecoration: 'none', color: 'var(--text)' }}
            >
              Dashboard
            </Link>
          </div>
        </div>

        <ThemeShowcase />
      </div>
    </div>
  );
}




