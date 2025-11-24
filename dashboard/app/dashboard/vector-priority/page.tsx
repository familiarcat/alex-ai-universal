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

const UIDesignComparison = dynamic(() => import('@/components/UIDesignComparison'), {
  ssr: false
});

const ProgressTracker = dynamic(() => import('@/components/ProgressTracker'), {
  ssr: false
});

export default function VectorPriorityDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-6">
        {/* Progress Tracker */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Background Task Progress</h2>
          <ProgressTracker 
            taskId="crew-recommendations" 
            autoRefresh={true} 
            refreshInterval={1000} 
          />
        </div>

        <VectorBasedDashboard autoRefresh={true} refreshInterval={5000} />
        <div className="mt-8">
          <UIDesignComparison />
        </div>
      </div>
    </div>
  );
}

