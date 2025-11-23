'use client';

import dynamic from 'next/dynamic';

const ErrorDashboard = dynamic(() => import('@/components/workflows/ErrorDashboard'), {
  ssr: false
});

export default function ErrorsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: 'var(--spacing-lg)',
      background: 'var(--background)'
    }}>
      <ErrorDashboard />
    </div>
  );
}

