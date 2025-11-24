/**
 * Vector-Based Priority Dashboard Page
 * 
 * New dashboard page integrating vector-based priority system
 * with dynamic component interchangeability
 */

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

export default function VectorPriorityDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <VectorBasedDashboard autoRefresh={true} refreshInterval={5000} />
    </div>
  );
}

