import { describe, expect, it } from 'vitest';
import { PENDING_REQUEST_QUERY, RECENT_SNAPSHOT_QUERY, REQUEST_BY_ID_QUERY, SNAPSHOT_BY_ID_QUERY } from './audit-queries';

/**
 * Runs the store's real GROQ against fake documents with Sanity's own query engine, since there is no dataset to
 * test against. `groq-js` ships with `sanity` (a transitive dependency, not a declared one), so these tests skip
 * themselves rather than fail if it ever isn't installed.
 */
type GroqModule = typeof import('groq-js');
const groq: GroqModule | null = await import('groq-js').catch(() => null);

type Doc = Record<string, unknown>;

async function run(query: string, dataset: Doc[], params: Record<string, unknown>) {
  const tree = groq!.parse(query, { params });
  const value = await groq!.evaluate(tree, { dataset, params });
  return value.get();
}

const NOW = '2026-11-09T12:00:00.000Z';
const HOURS_AGO = (hours: number) => new Date(Date.parse(NOW) - hours * 3_600_000).toISOString();
const DAYS_FROM_NOW = (days: number) => new Date(Date.parse(NOW) + days * 86_400_000).toISOString();

describe.skipIf(!groq)('audit store queries (run with groq-js)', () => {
  describe('PENDING_REQUEST_QUERY', () => {
    const dataset: Doc[] = [
      { _id: 'r1', _type: 'auditRequest', status: 'pending', email: 'maria@example.com', domain: 'example.com' },
      { _id: 'r2', _type: 'auditRequest', status: 'contacted', email: 'ana@example.com', domain: 'example.com' },
      { _id: 'r3', _type: 'auditRequest', status: 'pending', email: 'maria@example.com', domain: 'other.com' },
      { _id: 's1', _type: 'auditSnapshot', status: 'pending', email: 'maria@example.com', domain: 'third.com' },
    ];

    it('finds a pending request for the same email and domain', async () => {
      expect(await run(PENDING_REQUEST_QUERY, dataset, { email: 'maria@example.com', domain: 'example.com' })).toBe('r1');
    });

    it.each([
      ['a request that is no longer pending', { email: 'ana@example.com', domain: 'example.com' }],
      ['a different domain', { email: 'maria@example.com', domain: 'nope.com' }],
      ['a different email', { email: 'bob@example.com', domain: 'example.com' }],
      ['another document type', { email: 'maria@example.com', domain: 'third.com' }],
    ])('does not match %s', async (_label, params) => {
      expect(await run(PENDING_REQUEST_QUERY, dataset, params)).toBeNull();
    });
  });

  describe('RECENT_SNAPSHOT_QUERY', () => {
    const url = 'https://example.com/';
    const snapshot = (id: string, patch: Doc): Doc => ({
      _id: `auditSnapshot-${id}`,
      _type: 'auditSnapshot',
      shareId: id,
      url,
      _createdAt: HOURS_AGO(2),
      expiresAt: DAYS_FROM_NOW(28),
      ...patch,
    });
    const params = { url, since: HOURS_AGO(24), now: NOW };

    it('returns the newest still-valid snapshot of that exact URL created within the window', async () => {
      const dataset = [snapshot('older00001', { _createdAt: HOURS_AGO(10) }), snapshot('newer00002', { _createdAt: HOURS_AGO(1) })];
      expect(await run(RECENT_SNAPSHOT_QUERY, dataset, params)).toEqual({ shareId: 'newer00002', expiresAt: DAYS_FROM_NOW(28) });
    });

    it('ignores snapshots older than the window, expired ones, and other URLs', async () => {
      const dataset = [
        snapshot('tooold0001', { _createdAt: HOURS_AGO(72) }),
        snapshot('expired001', { expiresAt: HOURS_AGO(1) }),
        snapshot('otherurl01', { url: 'https://example.org/' }),
      ];
      expect(await run(RECENT_SNAPSHOT_QUERY, dataset, params)).toBeNull();
    });

    it('compares real instants, not strings (different offsets, same moment)', async () => {
      // 13:00+01:00 is 12:00Z; "now" is 12:00Z, so this link has just expired even though "13:00" > "12:00" as text.
      const dataset = [snapshot('offset0001', { expiresAt: '2026-11-09T13:00:00.000+01:00' })];
      expect(await run(RECENT_SNAPSHOT_QUERY, dataset, params)).toBeNull();
    });
  });

  describe('by-id queries', () => {
    it('REQUEST_BY_ID_QUERY projects the request fields', async () => {
      const dataset = [{ _id: 'req1', _type: 'auditRequest', _createdAt: NOW, url: 'u', domain: 'd', name: 'n', email: 'e', status: 'pending', secret: 'x' }];
      const found = (await run(REQUEST_BY_ID_QUERY, dataset, { id: 'req1' })) as Doc;
      expect(found).toMatchObject({ _id: 'req1', name: 'n', status: 'pending' });
      expect(found).not.toHaveProperty('secret');
      expect(await run(REQUEST_BY_ID_QUERY, dataset, { id: 'missing' })).toBeNull();
    });

    it('SNAPSHOT_BY_ID_QUERY finds a snapshot by its document id only', async () => {
      const dataset = [{ _id: 'auditSnapshot-abc1234567', _type: 'auditSnapshot', shareId: 'abc1234567', domain: 'example.com', previewJson: '{}' }];
      expect(await run(SNAPSHOT_BY_ID_QUERY, dataset, { id: 'auditSnapshot-abc1234567' })).toMatchObject({ shareId: 'abc1234567' });
      expect(await run(SNAPSHOT_BY_ID_QUERY, dataset, { id: 'abc1234567' })).toBeNull();
    });
  });
});
