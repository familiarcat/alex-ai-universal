'use client';

/**
 * Test Page - Verify Routing Works
 * 
 * Simple test page to verify Next.js routing is working
 */

export default function TestPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      background: '#0a0a0f',
      color: '#ffffff',
      padding: '40px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>✅ Routing Works!</h1>
      <p style={{ fontSize: '18px', marginBottom: '20px' }}>
        If you can see this page, Next.js routing is working correctly.
      </p>
      <div style={{ marginTop: '40px' }}>
        <a 
          href="/dashboard" 
          style={{
            color: '#00ffaa',
            textDecoration: 'underline',
            fontSize: '16px'
          }}
        >
          Go to Dashboard →
        </a>
      </div>
    </div>
  );
}



