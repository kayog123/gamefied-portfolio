import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUDIT_CHECKS } from '@/content/audit-checks';
import type { AuditResult, Finding } from '@/types/audit';
import type { AuditSnapshotRecord } from '../audit.types';
import { countFailures, mergeFindings, scoreFindings, toPreview } from '../audit.utils';

// Plain functions rather than vi.fn(): vitest's call bookkeeping reports a rejected promise as "unhandled"
// even when the code under test catches it, which would hide what this file wants to prove.
let lookups: string[] = [];
let respond: (shareId: string) => Promise<AuditSnapshotRecord | null> = async () => null;
vi.mock('./audit-store', () => ({
  getSnapshot: (shareId: string) => {
    lookups.push(shareId);
    return respond(shareId);
  },
}));

const { renderShareImage } = await import('./share-image');

function snapshot(domain = 'example.com'): AuditSnapshotRecord {
  const findings: Finding[] = AUDIT_CHECKS.map((check, index) => ({ checkId: check.id, status: index % 3 === 0 ? 'pass' : 'fail' }));
  const merged = mergeFindings(AUDIT_CHECKS, findings);
  const result: AuditResult = {
    url: `https://${domain}/`,
    finalUrl: `https://${domain}/`,
    auditedAt: '2026-11-09T02:00:00.000Z',
    scores: scoreFindings(merged),
    counts: countFailures(merged),
    findings: merged,
  };
  return {
    shareId: 'k3Fq9xZp2a',
    url: result.url,
    domain,
    createdAt: result.auditedAt,
    expiresAt: '2026-12-09T02:00:00.000Z',
    preparedFor: null,
    views: 0,
    preview: toPreview(result),
  };
}

/** PNG files start with these 8 bytes. */
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

async function pngOf(response: Response) {
  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toBe('image/png');
  const bytes = new Uint8Array(await response.arrayBuffer());
  expect([...bytes.slice(0, 8)]).toEqual(PNG_SIGNATURE);
  return bytes;
}

beforeEach(() => {
  lookups = [];
  respond = async () => null;
});

describe('renderShareImage', () => {
  it('draws a real PNG with the scores for a stored snapshot', async () => {
    respond = async () => snapshot();
    const bytes = await pngOf(await renderShareImage('k3Fq9xZp2a'));
    expect(bytes.length).toBeGreaterThan(5_000);
    expect(lookups).toEqual(['k3Fq9xZp2a']);
  });

  it('copes with a very long domain', async () => {
    respond = async () => snapshot('a-really-quite-long-subdomain.of-some-company.example.com');
    await pngOf(await renderShareImage('k3Fq9xZp2a'));
  });

  it('gives crawlers a generic card, not an error, for an unknown snapshot', async () => {
    respond = async () => null;
    await pngOf(await renderShareImage('k3Fq9xZp2a'));
  });

  it('gives a generic card when the store throws', async () => {
    respond = async () => {
      throw new Error('sanity down');
    };
    await pngOf(await renderShareImage('k3Fq9xZp2a'));
    expect(lookups).toEqual(['k3Fq9xZp2a']);
  });

  it('never queries the store for a malformed ID', async () => {
    await pngOf(await renderShareImage('../../etc/passwd'));
    expect(lookups).toEqual([]);
  });
});
