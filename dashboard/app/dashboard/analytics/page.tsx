'use client';

/**
 * Analytics Dashboard Page
 * 
 * Displays analytics with graphs and router links
 * 
 * Uses system-wide navigation spacing system
 * Crew: Counselor Troi (UX) + Chief O'Brien (Pragmatic Fix)
 */

import dynamic from 'next/dynamic';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { useNavigationSpacing } from '@/lib/hooks/useNavigationSpacing';

// Dynamic import to avoid SSR issues
const AnalyticsDashboardClient = dynamic(() => Promise.resolve(AnalyticsDashboard), {
  ssr: false
});

export default function AnalyticsPage() {
  const { style: navStyle } = useNavigationSpacing();
  
  return (
    <div className="dashboard-theme-wrapper" style={{
      ...navStyle,
      paddingLeft: '20px',
      paddingRight: '20px',
      paddingBottom: '40px',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <AnalyticsDashboardClient />
      </div>
    </div>
  );
}

