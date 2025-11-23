'use client';

/**
 * Settings Page
 * 
 * System settings and configuration dashboard
 */

import dynamic from 'next/dynamic';

const SystemSettings = dynamic(() => import('@/components/workflows/SystemSettings'), {
  ssr: false
});

export default function SettingsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: 'var(--spacing-lg)',
      background: 'var(--background)'
    }}>
      <SystemSettings />
    </div>
  );
}

