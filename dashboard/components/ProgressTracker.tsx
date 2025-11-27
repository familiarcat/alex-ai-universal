'use client';

/**
 * Progress Tracker Component
 * 
 * Displays real-time progress of background tasks
 * Reads from Supabase task_progress table
 * 
 * FIXED: Now uses useRetryableFetch to prevent infinite retry loops
 * Crew: La Forge (Infrastructure) + O'Brien (Pragmatic) + Troi (UX)
 */

import { useState, useEffect } from 'react';
import { useRetryableFetch } from '@/lib/hooks/useRetryableFetch';
import StuckOperationWarning from './StuckOperationWarning';
// REMOVED: Direct Supabase import - now using API routes (DDD-compliant)

interface ProgressData {
  taskId: string;
  current: number;
  total: number;
  percentage: number;
  currentStep: string | null;
  steps: Array<{
    name: string;
    completed: boolean;
    duration: number | null;
  }>;
  elapsed: string;
  timestamp: string;
  status?: 'running' | 'completed' | 'failed';
  error?: string;
}

interface ProgressTrackerProps {
  taskId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function ProgressTracker({
  taskId,
  autoRefresh = true,
  refreshInterval = 1000
}: ProgressTrackerProps) {
  // FIXED: Use retryable fetch with limits and cancellation
  // Crew: La Forge (Infrastructure) + O'Brien (Pragmatic) + Troi (UX)
  const {
    data: progressData,
    loading,
    error,
    retryCount,
    isStuck,
    cancel,
    retry
  } = useRetryableFetch<ProgressData>(
    autoRefresh ? `/api/progress/${taskId}` : null,
    {
      headers: { 'Cache-Control': 'no-cache' },
      cache: 'no-store'
    },
    {
      maxRetries: 5,
      initialDelay: 1000,
      showWarningAfter: 3,
      onWarning: (attempt) => {
        console.warn(`⚠️ Progress tracking stuck after ${attempt} attempts for task: ${taskId}`);
      },
      onMaxRetries: (err) => {
        console.debug(`Progress tracking failed after max retries for task: ${taskId}`, err);
      }
    }
  );

  // Handle polling with refreshInterval
  // FIXED: Stop polling on 404 errors (expected for missing progress files)
  // Crew: La Forge (Infrastructure) + O'Brien (Pragmatic) + Troi (UX)
  useEffect(() => {
    if (!autoRefresh || !taskId) return;
    
    // Don't poll if we have a 404 error (file doesn't exist, expected)
    if (error && error.message?.includes('404') || error?.message?.includes('not found')) {
      return; // Stop polling for missing resources
    }

    const interval = setInterval(() => {
      retry(); // Retry the fetch
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, taskId, retry, error]);

  // Process progress data (handle both wrapped and direct responses)
  const progress: ProgressData | null = progressData ? (
    (progressData as any).success && (progressData as any).data ? (progressData as any).data :
    (progressData as any).taskId || (progressData as any).current !== undefined ? progressData as ProgressData :
    null
  ) : null;

  // Show stuck warning if operation is stuck
  if (isStuck) {
    return (
      <div className="p-4 border rounded-lg">
        <StuckOperationWarning
          operationName={`Progress Tracking (${taskId})`}
          retryCount={retryCount}
          maxRetries={5}
          onCancel={cancel}
          onRetry={retry}
          error={error}
        />
        {loading && (
          <div className="mt-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600">No progress data found for task: {taskId}</p>
        {error && (
          <p className="text-xs text-gray-500 mt-2">
            Error: {error.message}
          </p>
        )}
      </div>
    );
  }

  const isComplete = progress.status === 'completed' || progress.percentage >= 100;
  const isFailed = progress.status === 'failed';

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{progress.taskId}</h3>
          {progress.currentStep && (
            <p className="text-sm text-gray-600 mt-1">Current: {progress.currentStep}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {progress.percentage}%
          </div>
          <div className="text-xs text-gray-500">
            {progress.current}/{progress.total}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isFailed ? 'bg-red-500' :
              isComplete ? 'bg-green-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      {progress.steps && progress.steps.length > 0 && (
        <div className="space-y-2 mb-4">
          {progress.steps.map((step, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {step.completed ? (
                <span className="text-green-500">✅</span>
              ) : progress.currentStep === step.name ? (
                <span className="text-blue-500 animate-pulse">⏳</span>
              ) : (
                <span className="text-gray-400">○</span>
              )}
              <span className={step.completed ? 'text-gray-600' : 'text-gray-900'}>
                {step.name}
              </span>
              {step.duration && (
                <span className="text-xs text-gray-400 ml-auto">
                  {step.duration}s
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Elapsed: {progress.elapsed}s
        </div>
        {isComplete && (
          <span className="text-green-600 font-medium">✅ Complete</span>
        )}
        {isFailed && (
          <span className="text-red-600 font-medium">❌ Failed</span>
        )}
        {!isComplete && !isFailed && (
          <span className="text-blue-600 font-medium animate-pulse">⏳ Running...</span>
        )}
      </div>

      {/* Error Message */}
      {isFailed && progress.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">{progress.error}</p>
        </div>
      )}
    </div>
  );
}

