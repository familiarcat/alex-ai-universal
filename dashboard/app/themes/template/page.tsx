export default function ThemeTemplate() {
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




