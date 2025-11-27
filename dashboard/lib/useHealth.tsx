import { useEffect, useState } from 'react';

type HealthStatus = 'ok' | 'fail' | 'unknown';

const DISABLED =
  process.env.NEXT_PUBLIC_DISABLE_POLLING === '1' ||
  process.env.NODE_ENV !== 'production';

export function useHealth(pollMs: number = 10000): HealthStatus {
  // Troi's decision: Slower polling (10s default) to reduce UI loops
  const [status, setStatus] = useState<HealthStatus>('unknown');
  const [lastCheck, setLastCheck] = useState<number>(0);

  useEffect(() => {
    if (DISABLED) {
      setStatus('unknown');
      return;
    }

    let mounted = true;
    let timer: NodeJS.Timeout | undefined;

    const fetchHealth = async () => {
      // Prevent rapid successive calls
      const now = Date.now();
      if (now - lastCheck < pollMs) {
        return; // Too soon, skip this check
      }
      setLastCheck(now);
      
      try {
        const res = await fetch('/api/health', { 
          cache: 'no-store',
          signal: AbortSignal.timeout(3000) // 3 second timeout
        });
        const json = await res.json().catch(() => ({}));
        if (mounted) setStatus(json?.status === 'ok' ? 'ok' : 'fail');
      } catch {
        if (mounted) setStatus('fail');
      }
    };

    fetchHealth(); // initial
    timer = setInterval(fetchHealth, pollMs); // Slower polling

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [pollMs, lastCheck]); // Added lastCheck to prevent loops

  return status;
}