'use client';

export default function ThemeA11yReview() {
  const blocks = [
    { label: 'Heading', style: { color: 'var(--heading, var(--text))', fontSize: 22, fontWeight: 700 } },
    { label: 'Body text', style: { color: 'var(--text)', fontSize: 14 } },
    { label: 'Muted', style: { color: 'var(--text-muted)', fontSize: 13 } },
  ];

  function Card({ title }: { title: string }) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
        <div style={{ color: 'var(--heading, var(--text))', fontWeight: 700, marginBottom: 8 }}>{title}</div>
        {blocks.map((b) => (
          <div key={b.label} style={{ marginBottom: 8 }}>
            <div style={{ opacity: 0.7, fontSize: 12 }}>{b.label}</div>
            <div style={b.style}>The quick brown fox jumps over the lazy dog 12345</div>
          </div>
        ))}
        <div style={{ marginTop: 10 }}>
          <button
            style={{
              background: 'var(--primary)',
              color: 'var(--on-primary, var(--text))',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 12px',
            }}
          >
            Primary Action
          </button>
        </div>
      </div>
    );
  }

  return (
    <main style={{ padding: '90px 24px 40px' }}>
      <h1 style={{ color: 'var(--heading, var(--text))', fontSize: 28, marginBottom: 12 }}>🎨 Theme Art Direction Review</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
        Visual audit of heading/body/muted and primary action on <code>--surface</code> using theme tokens.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <Card title="Sample Card" />
        <Card title="Dense Content" />
        <Card title="Controls & Buttons" />
      </div>
    </main>
  );
}


