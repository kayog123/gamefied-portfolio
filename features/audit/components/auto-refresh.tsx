'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export type AutoRefreshProps = { intervalMs?: number };

/** Re-renders the server page every few seconds while it is mounted (the review page mounts it only while a run is in progress). */
export function AutoRefresh({ intervalMs = 4000 }: AutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), intervalMs);
    return () => window.clearInterval(timer);
  }, [router, intervalMs]);

  return null;
}
