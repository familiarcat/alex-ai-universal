'use client';

/**
 * MCP Dashboard Page - Redirects to Unified Dashboard
 * 
 * This page now redirects to /dashboard which includes all MCP functionality
 * Kept for backward compatibility and direct links
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MCPDashboard() {
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
          Redirecting to Unified Dashboard...
        </div>
        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginTop: 'var(--spacing-sm)' }}>
          All MCP functionality is now available in the main dashboard
        </div>
      </div>
    </div>
  );
}
