import { describe, expect, it } from 'vitest';
import { buildSummary, scoreLevel } from './audit.summary';

const counts = (critical: number, warning: number) => ({ critical, warning, info: 0 });

describe('scoreLevel', () => {
  it.each([
    [100, 'good'],
    [80, 'good'],
    [79, 'fair'],
    [50, 'fair'],
    [49, 'attention'],
    [0, 'attention'],
  ] as const)('%i is %s', (score, level) => {
    expect(scoreLevel(score)).toBe(level);
  });
});

describe('buildSummary', () => {
  it('contrasts strengths with weaknesses (the example.com result)', () => {
    const summary = buildSummary({ scores: { seo: 50, security: 45, maintainability: 91 }, counts: counts(1, 7) });
    expect(summary.headline).toBe(
      'Your site is built on a solid foundation, but it is easy to miss on Google and is less protected than it should be.',
    );
    expect(summary.cards.map((card) => [card.category, card.level])).toEqual([
      ['seo', 'fair'],
      ['security', 'attention'],
      ['maintainability', 'good'],
    ]);
    expect(summary.lead).toContain('One issue is marked critical');
  });

  it('is positive when everything scores well', () => {
    const summary = buildSummary({ scores: { seo: 95, security: 90, maintainability: 100 }, counts: counts(0, 0) });
    expect(summary.headline).toBe('Your site is in good shape, with only small improvements left.');
    expect(summary.lead).toContain('Only minor notices remain');
  });

  it('has no strengths clause when nothing scores well', () => {
    const summary = buildSummary({ scores: { seo: 20, security: 10, maintainability: 30 }, counts: counts(3, 5) });
    expect(summary.headline.startsWith('Your site is easy to miss on Google, is less protected')).toBe(true);
    expect(summary.headline).not.toContain('but');
    expect(summary.lead).toContain('3 issues are marked critical');
  });

  it('never mentions locked details, only scores and counts', () => {
    const summary = buildSummary({ scores: { seo: 50, security: 45, maintainability: 91 }, counts: counts(1, 7) });
    expect(JSON.stringify(summary)).not.toMatch(/HSTS|CSP|Content-Security|JSON-LD|cookie/i);
  });
});
