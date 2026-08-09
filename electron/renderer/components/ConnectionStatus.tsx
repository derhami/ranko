/**
 * Backend Connection Status indicator component for Header.
 * Pings /api/health periodically and displays a green/red badge.
 */

import { useState, useEffect } from 'react';

export function ConnectionStatus() {
  const [status, setStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch('/api/health', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (isMounted) {
          if (res.ok) {
            setStatus('online');
          } else {
            setStatus('offline');
          }
        }
      } catch {
        if (isMounted) {
          setStatus('offline');
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors shrink-0 select-none"
      style={{
        backgroundColor:
          status === 'online'
            ? 'rgba(16, 185, 129, 0.08)'
            : status === 'offline'
            ? 'rgba(239, 68, 68, 0.08)'
            : 'var(--color-bg-hover)',
        borderColor:
          status === 'online'
            ? 'rgba(16, 185, 129, 0.25)'
            : status === 'offline'
            ? 'rgba(239, 68, 68, 0.25)'
            : 'var(--color-border)',
        color:
          status === 'online'
            ? '#10b981'
            : status === 'offline'
            ? '#ef4444'
            : 'var(--color-text-muted)',
      }}
      title={
        status === 'online'
          ? 'ارتباط با سرویس‌های بک‌اند برقرار است'
          : status === 'offline'
          ? 'ارتباط با سرور قطع شده است'
          : 'در حال بررسی اتصال...'
      }
    >
      <span className="relative flex h-2 w-2">
        {status === 'online' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{
            backgroundColor:
              status === 'online'
                ? '#10b981'
                : status === 'offline'
                ? '#ef4444'
                : '#9ca3af',
          }}
        />
      </span>
      <span>
        {status === 'online'
          ? 'بک‌اند متصل'
          : status === 'offline'
          ? 'قطع اتصال'
          : 'بررسی...'}
      </span>
    </div>
  );
}
