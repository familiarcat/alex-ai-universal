/**
 * 🖖 useRetryableFetch Hook - Prevents Infinite Retry Loops
 * 
 * Reusable hook for API calls with:
 * - Retry limits (max 5 attempts)
 * - Exponential backoff (1s, 2s, 4s, 8s, 16s)
 * - User warnings after 3 failures
 * - Cancellation support
 * - Circuit breaker pattern
 * 
 * Crew: La Forge (Infrastructure) + O'Brien (Pragmatic) + Troi (UX) + Worf (Security)
 * Pattern stored in RAG to prevent recurrence
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface RetryConfig {
  maxRetries?: number;        // Default: 5
  initialDelay?: number;      // Default: 1000ms
  maxDelay?: number;          // Default: 16000ms
  backoffMultiplier?: number; // Default: 2
  showWarningAfter?: number;  // Default: 3 (show warning after N failures)
  onRetry?: (attempt: number, error: any) => void;
  onMaxRetries?: (error: any) => void;
  onWarning?: (attempt: number) => void;
}

export interface RetryableFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retryCount: number;
  isStuck: boolean; // true after showWarningAfter failures
  cancel: () => void;
  retry: () => void;
}

export function useRetryableFetch<T = any>(
  url: string | null,
  options: RequestInit = {},
  config: RetryConfig = {}
): RetryableFetchResult<T> {
  const {
    maxRetries = 5,
    initialDelay = 1000,
    maxDelay = 16000,
    backoffMultiplier = 2,
    showWarningAfter = 3,
    onRetry,
    onMaxRetries,
    onWarning
  } = config;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isStuck, setIsStuck] = useState(false);

  const cancelledRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
  }, []);

  const fetchWithRetry = useCallback(async (attempt: number = 0): Promise<void> => {
    if (cancelledRef.current || !url) {
      return;
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      initialDelay * Math.pow(backoffMultiplier, attempt),
      maxDelay
    );

    try {
      setLoading(true);
      setError(null);

      // Create new AbortController for this attempt
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const response = await fetch(url, {
        ...options,
        signal,
      });

      if (cancelledRef.current) {
        return;
      }

      // Handle 404 gracefully (expected for missing resources)
      // FIXED: Don't set error state for 404s - treat as valid "not found" response
      // Crew: La Forge (Infrastructure) + O'Brien (Pragmatic) + Troi (UX)
      if (response.status === 404) {
        // Set data to null (not found) but don't treat as error
        setData(null);
        setError(null); // Don't set error for expected 404s
        setLoading(false);
        setRetryCount(0); // Reset retry count
        setIsStuck(false);
        // Don't retry on 404 - it's expected
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (cancelledRef.current) {
        return;
      }

      // Success!
      setData(result);
      setLoading(false);
      setRetryCount(0);
      setIsStuck(false);
      return;

    } catch (err: any) {
      if (cancelledRef.current) {
        return;
      }

      // Don't retry on abort
      if (err.name === 'AbortError') {
        setLoading(false);
        return;
      }

      const currentAttempt = attempt + 1;
      setRetryCount(currentAttempt);
      setError(err);

      // Show warning after showWarningAfter failures
      if (currentAttempt >= showWarningAfter && !isStuck) {
        setIsStuck(true);
        if (onWarning) {
          onWarning(currentAttempt);
        }
      }

      // Retry if we haven't hit max retries
      if (currentAttempt < maxRetries) {
        if (onRetry) {
          onRetry(currentAttempt, err);
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));

        // Check if cancelled during delay
        if (cancelledRef.current) {
          return;
        }

        // Retry
        return fetchWithRetry(currentAttempt);
      } else {
        // Max retries reached
        setLoading(false);
        if (onMaxRetries) {
          onMaxRetries(err);
        }
      }
    }
  }, [url, options, maxRetries, initialDelay, maxDelay, backoffMultiplier, showWarningAfter, onRetry, onMaxRetries, onWarning, isStuck]);

  const retry = useCallback(() => {
    cancelledRef.current = false;
    setRetryCount(0);
    setIsStuck(false);
    setError(null);
    fetchWithRetry(0);
  }, [fetchWithRetry]);

  useEffect(() => {
    if (url) {
      cancelledRef.current = false;
      fetchWithRetry(0);
    }

    return () => {
      cancel();
    };
  }, [url]); // Only re-fetch if URL changes

  return {
    data,
    loading,
    error,
    retryCount,
    isStuck,
    cancel,
    retry
  };
}

