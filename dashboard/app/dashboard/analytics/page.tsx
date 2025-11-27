'use client';

/**
 * Analytics Dashboard Page
 * 
 * Displays analytics with graphs and router links
 * 
 * FIXED: Added consistent top spacing to match dashboard layout
 * Crew: Counselor Troi (UX) + Chief O'Brien (Pragmatic Fix)
 */

import dynamic from 'next/dynamic';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

// Dynamic import to avoid SSR issues
const AnalyticsDashboardClient = dynamic(() => Promise.resolve(AnalyticsDashboard), {
  ssr: false
});

export default function AnalyticsPage() {
  return (
    <div style={{
      padding: '40px 20px',
      minHeight: '100vh'
    }}>
      <AnalyticsDashboardClient />
    </div>
  );
}

