/**
 * MINIMAL TEST PAGE - To verify Next.js works
 */

export default function HomePage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#00ffaa' }}>🖖 Alex AI - Next.js Working!</h1>
      <p>If you see this, Next.js is running successfully.</p>
      <a href="/dashboard" style={{ color: '#00ffaa' }}>→ Go to Dashboard</a>
    </div>
  );
}

