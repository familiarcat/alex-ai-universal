import { useEffect, useState } from 'react';

type HealthStatus = 'ok' | 'fail' | 'unknown';

const DISABLED =
  process.env.NEXT_PUBLIC_DISABLE_POLLING === '1' ||
  process.env.NODE_ENV !== 'production';

export function useHealth(pollMs: number = 5000): HealthStatus {
  const [status, setStatus] = useState<HealthStatus>('unknown');

  useEffect(() => {
    if (DISABLED) {
      setStatus('unknown');
      return;
    }

    let mounted = true;
    let timer: NodeJS.Timeout | undefined;

    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (mounted) setStatus(json?.status === 'ok' ? 'ok' : 'fail');
      } catch {
        if (mounted) setStatus('fail');
      }
    };

    fetchHealth(); // initial
    timer = setInterval(fetchHealth, pollMs); // every 5s by default

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [pollMs]);

  return status;
}