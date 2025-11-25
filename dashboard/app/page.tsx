'use client';

/**
 * Root Dashboard Page
 * 
 * Redirects to MCP Dashboard or shows landing page
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified dashboard (includes MCP functionality)
    router.push('/dashboard');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background)',
      color: 'var(--text)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>
          🖖
        </div>
        <div style={{ fontSize: 'var(--font-xl)' }}>
          Loading Dashboard...
        </div>
      </div>
    </div>
  );
}
