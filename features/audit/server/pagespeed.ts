import 'server-only';
import { cacheLife } from 'next/cache';
import { z } from 'zod';
import type { PerformanceResult } from '@/types/audit';
import { resolveSafeTarget } from './ssrf-guard';

const ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

/** PageSpeed runs a real Lighthouse test, which usually takes 10–30 s. */
const REQUEST_TIMEOUT_MS = 50_000;

export type PageSpeedFailure = 'blocked' | 'quota' | 'unavailable';

export type PageSpeedOutcome = { ok: true; result: PerformanceResult } | { ok: false; reason: PageSpeedFailure };

const audit = z.object({ numericValue: z.number().finite() });

const responseSchema = z.object({
  lighthouseResult: z.object({
    fetchTime: z.string().optional(),
    categories: z.object({ performance: z.object({ score: z.number().min(0).max(1).nullable() }) }),
    audits: z.object({
      'largest-contentful-paint': audit,
      'cumulative-layout-shift': audit,
      'total-blocking-time': audit,
    }),
  }),
});

/**
 * Turns a PageSpeed Insights v5 response into the open performance result, or `null` when the
 * response is malformed or Lighthouse couldn't score the page (`score: null`).
 * Only the score and three headline metrics are kept: opportunities and the LCP element are
 * full-audit material (docs/AUDIT.md#open-vs-locked-checks).
 */
export function parsePageSpeed(json: unknown, now = new Date()): PerformanceResult | null {
  const parsed = responseSchema.safeParse(json);
  if (!parsed.success) return null;
  const { categories, audits, fetchTime } = parsed.data.lighthouseResult;
  const score = categories.performance.score;
  if (score === null) return null;

  return {
    score: Math.round(score * 100),
    strategy: 'mobile',
    metrics: {
      lcpMs: Math.round(audits['largest-contentful-paint'].numericValue),
      cls: Math.round(audits['cumulative-layout-shift'].numericValue * 1000) / 1000,
      tbtMs: Math.round(audits['total-blocking-time'].numericValue),
    },
    measuredAt: fetchTime ?? now.toISOString(),
  };
}

/**
 * Mobile performance for a URL via Google's PageSpeed Insights API (docs/AUDIT.md). Google fetches
 * the page itself, so nothing here reaches our network, but the URL is still checked as public to
 * avoid spending quota on junk. Needs `PAGESPEED_API_KEY`: without one, Google's shared daily quota
 * is almost always exhausted. Successes are cached about a day, failures for seconds.
 */
export async function runPageSpeed(url: string): Promise<PageSpeedOutcome> {
  'use cache';

  try {
    await resolveSafeTarget(new URL(url));
  } catch {
    cacheLife('seconds');
    return { ok: false, reason: 'blocked' };
  }

  const endpoint = new URL(ENDPOINT);
  endpoint.searchParams.set('url', url);
  endpoint.searchParams.set('strategy', 'mobile');
  endpoint.searchParams.append('category', 'performance');
  const key = process.env.PAGESPEED_API_KEY;
  if (key) endpoint.searchParams.set('key', key);

  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), cache: 'no-store' });
    if (response.status === 429) {
      cacheLife('seconds');
      return { ok: false, reason: 'quota' };
    }
    if (!response.ok) {
      cacheLife('seconds');
      return { ok: false, reason: 'unavailable' };
    }
    const result = parsePageSpeed(await response.json());
    if (!result) {
      cacheLife('seconds');
      return { ok: false, reason: 'unavailable' };
    }
    cacheLife('days');
    return { ok: true, result };
  } catch {
    cacheLife('seconds');
    return { ok: false, reason: 'unavailable' };
  }
}
