'use client';

/**
 * Async Error Handler Hook
 * 
 * Provides graceful error handling for async operations
 * Displays errors using the design system without breaking the UI
 * 
 * Crew Integration:
 * - Dr. Crusher: Error diagnosis and recovery
 * - Counselor Troi: User-friendly error messages
 */

import { useState, useCallback } from 'react';
import DesignSystemErrorDisplay from '@/components/DesignSystemErrorDisplay';

interface AsyncError {
  message: string;
  error?: Error;
  timestamp: number;
}

export function useAsyncErrorHandler() {
  const [error, setError] = useState<AsyncError | null>(null);

  const handleError = useCallback((error: Error | string, context?: string) => {
    const errorMessage = typeof error === 'string' 
      ? error 
      : error.message || 'An unexpected error occurred';
    
    const fullMessage = context 
      ? `${context}: ${errorMessage}`
      : errorMessage;

    setError({
      message: fullMessage,
      error: typeof error === 'string' ? undefined : error,
      timestamp: Date.now()
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      setError(null);
    }, 10000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const ErrorDisplay = error ? (
    <DesignSystemErrorDisplay
      error={error.message}
      errorInfo={error.error}
      title="Operation Error"
      onDismiss={clearError}
      variant="compact"
    />
  ) : null;

  return {
    error,
    handleError,
    clearError,
    ErrorDisplay
  };
}

/**
 * Wrapper for async functions with automatic error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`Error in ${context || 'async operation'}:`, error);
      throw error; // Re-throw so caller can handle if needed
    }
  }) as T;
}

