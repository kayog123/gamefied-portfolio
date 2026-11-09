import { describe, expect, it } from 'vitest';
import { parsePageSpeed } from './pagespeed';

/** Shaped like a PageSpeed Insights v5 response (only the fields we read, plus noise we must ignore). */
function response(overrides: Record<string, unknown> = {}) {
  return {
    id: 'https://example.com/',
    loadingExperience: { overall_category: 'FAST' },
    lighthouseResult: {
      fetchTime: '2026-11-09T02:05:11.123Z',
      finalUrl: 'https://example.com/',
      categories: { performance: { id: 'performance', score: 0.62 } },
      audits: {
        'largest-contentful-paint': { numericValue: 3412.7, displayValue: '3.4 s' },
        'cumulative-layout-shift': { numericValue: 0.0523, displayValue: '0.052' },
        'total-blocking-time': { numericValue: 209.6, displayValue: '210 ms' },
        'render-blocking-resources': { details: { items: [{ url: 'SHOULD-NOT-LEAK' }] } },
      },
      ...overrides,
    },
  };
}

describe('parsePageSpeed', () => {
  it('reads the score and the three headline metrics, rounded', () => {
    expect(parsePageSpeed(response())).toEqual({
      score: 62,
      strategy: 'mobile',
      metrics: { lcpMs: 3413, cls: 0.052, tbtMs: 210 },
      measuredAt: '2026-11-09T02:05:11.123Z',
    });
  });

  it('keeps nothing beyond the open fields (root causes are full-audit only)', () => {
    expect(JSON.stringify(parsePageSpeed(response()))).not.toContain('SHOULD-NOT-LEAK');
  });

  it('falls back to now when Lighthouse sends no fetch time', () => {
    const now = new Date('2026-11-09T09:00:00.000Z');
    const body = response();
    delete (body.lighthouseResult as { fetchTime?: string }).fetchTime;
    expect(parsePageSpeed(body, now)?.measuredAt).toBe('2026-11-09T09:00:00.000Z');
  });

  it('returns null when Lighthouse could not score the page', () => {
    expect(parsePageSpeed(response({ categories: { performance: { score: null } } }))).toBeNull();
  });

  it.each([
    ['an error body', { error: { code: 429, message: 'Quota exceeded' } }],
    ['null', null],
    ['a string', 'nope'],
    ['a missing metric', response({ audits: { 'largest-contentful-paint': { numericValue: 1 } } })],
    ['a score above 1', response({ categories: { performance: { score: 62 } } })],
    ['a non-numeric metric', response({ audits: { 'largest-contentful-paint': { numericValue: 'fast' } } })],
  ])('returns null for %s', (_label, body) => {
    expect(parsePageSpeed(body)).toBeNull();
  });
});
