import { useCallback, useEffect, useRef, useState } from 'react';
import type { AuditPreview, PerformanceResult } from '@/types/audit';

export type AuditScanState =
  | { status: 'idle' }
  | { status: 'scanning'; url: string }
  | { status: 'error'; url: string; message: string }
  /**
   * `ticket` lets the visitor share this scan. It is `null` when sharing isn't available (no private store is
   * configured), which hides the share box. The speed test gets its own copy of the ticket.
   */
  | { status: 'done'; preview: AuditPreview; ticket: string | null };

/** PageSpeed runs after the main results are shown, so the page never waits on it. */
export type PerformanceState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; result: PerformanceResult }
  | { status: 'unavailable' };

export type UseAuditScanResult = {
  state: AuditScanState;
  performance: PerformanceState;
  /** 0–95 while scanning: an estimate from elapsed time (the API reports no intermediate progress). */
  progress: number;
  /** `turnstileToken` is the visitor’s single-use bot-check token (omitted when Turnstile isn’t configured). */
  scan: (url: string, turnstileToken?: string) => Promise<void>;
  reset: () => void;
};

/** Slightly over the server's own 30 s `maxDuration`, so the server answers before we give up. */
const CLIENT_TIMEOUT_MS = 35_000;
/** Slightly over the performance route's 60 s `maxDuration`. */
const PERFORMANCE_TIMEOUT_MS = 65_000;
/** Typical audit length; the estimate eases toward 95% over about this long. */
const EXPECTED_MS = 9_000;

/** Runs a free website audit through `/api/audit/preview`, then the mobile speed score (Sheet 09). */
export function useAuditScan(): UseAuditScanResult {
  const [state, setState] = useState<AuditScanState>({ status: 'idle' });
  const [performance, setPerformance] = useState<PerformanceState>({ status: 'idle' });
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const isScanning = state.status === 'scanning';
  useEffect(() => {
    if (!isScanning) return;
    const startedAt = window.performance.now();
    const id = window.setInterval(() => {
      const elapsed = window.performance.now() - startedAt;
      setProgress(Math.min(95, Math.round(95 * (1 - Math.exp((-3 * elapsed) / EXPECTED_MS)))));
    }, 200);
    return () => window.clearInterval(id);
  }, [isScanning]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const measurePerformance = useCallback(async (url: string, ticket: string, controller: AbortController) => {
    setPerformance({ status: 'loading' });
    try {
      const response = await fetch('/api/audit/performance', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url, ticket }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(PERFORMANCE_TIMEOUT_MS)]),
      });
      const body = (await response.json().catch(() => null)) as { performance?: PerformanceResult } | null;
      if (controller.signal.aborted) return;
      setPerformance(response.ok && body?.performance ? { status: 'done', result: body.performance } : { status: 'unavailable' });
    } catch {
      if (controller.signal.aborted) return;
      setPerformance({ status: 'unavailable' });
    }
  }, []);

  const scan = useCallback(
    async (url: string, turnstileToken?: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setProgress(0);
      setPerformance({ status: 'idle' });
      setState({ status: 'scanning', url });

      try {
        const response = await fetch('/api/audit/preview', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ url, turnstileToken }),
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(CLIENT_TIMEOUT_MS)]),
        });
        const body = (await response.json().catch(() => null)) as { preview?: AuditPreview; ticket?: string; canShare?: boolean; error?: string } | null;
        if (controller.signal.aborted) return;

        if (!response.ok || !body?.preview) {
          setState({ status: 'error', url, message: body?.error ?? 'Couldn’t audit that site. Please try again.' });
          return;
        }
        setProgress(100);
        setState({ status: 'done', preview: body.preview, ticket: body.canShare ? (body.ticket ?? null) : null });
        if (body.ticket) void measurePerformance(body.preview.finalUrl, body.ticket, controller);
        else setPerformance({ status: 'unavailable' });
      } catch {
        if (controller.signal.aborted) return;
        setState({ status: 'error', url, message: 'The audit took too long or couldn’t be reached. Please try again.' });
      }
    },
    [measurePerformance],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setProgress(0);
    setPerformance({ status: 'idle' });
    setState({ status: 'idle' });
  }, []);

  return { state, performance, progress, scan, reset };
}
