/**
 * Vector-Based Priority Dashboard Page
 * 
 * New dashboard page integrating vector-based priority system
 * with dynamic component interchangeability
 */

'use client';

import dynamic from 'next/dynamic';

const VectorBasedDashboard = dynamic(() => import('@/components/VectorBasedDashboard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Vector-Based Priority Dashboard...</p>
      </div>
    </div>
  )
});

const UIDesignComparison = dynamic(() => import('@/components/UIDesignComparison'), {
  ssr: false
});

const ProgressTracker = dynamic(() => import('@/components/ProgressTracker'), {
  ssr: false
});

export default function VectorPriorityDashboardPage() {
  return (
    <div style={{
      padding: '40px 20px', // FIXED: Consistent top spacing with main dashboard
      minHeight: '100vh',
      background: 'var(--background)'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Progress Tracker */}
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: 'var(--font-xl)',
            fontWeight: 700,
            color: 'var(--accent)',
            marginBottom: '16px'
          }}>
            Background Task Progress
          </h2>
          <ProgressTracker 
            taskId="crew-recommendations" 
            autoRefresh={true} 
            refreshInterval={1000} 
          />
        </div>

        <div style={{ marginTop: '32px' }}>
          <VectorBasedDashboard autoRefresh={true} refreshInterval={5000} />
        </div>
        <div style={{ marginTop: '32px' }}>
          <UIDesignComparison />
        </div>
      </div>
    </div>
  );
}

