'use client';

/**
 * Analytics Dashboard Page
 * 
 * Displays analytics with graphs and router links
 */

import dynamic from 'next/dynamic';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

// Dynamic import to avoid SSR issues
const AnalyticsDashboardClient = dynamic(() => Promise.resolve(AnalyticsDashboard), {
  ssr: false
});

export default function AnalyticsPage() {
  return <AnalyticsDashboardClient />;
}

