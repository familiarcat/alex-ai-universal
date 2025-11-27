'use client';

/**
 * Root Dashboard Page
 * 
 * DDD: Entry Point Bounded Context
 * Redirects to unified dashboard (includes MCP functionality)
 * 
 * Reviewed by: Captain Picard (Strategic), Commander Riker (Execution)
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified dashboard (includes MCP functionality)
    // Use replace to avoid adding to history
    router.replace('/dashboard');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background, #0a0a0f)',
      color: 'var(--text, #ffffff)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md, 16px)' }}>
          🖖
        </div>
        <div style={{ fontSize: 'var(--font-xl, 24px)' }}>
          Loading Dashboard...
        </div>
        <div style={{ 
          fontSize: 'var(--font-sm, 14px)', 
          opacity: 0.6,
          marginTop: 'var(--spacing-sm, 8px)'
        }}>
          Redirecting to unified dashboard...
        </div>
      </div>
    </div>
  );
}
