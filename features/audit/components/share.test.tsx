import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AUDIT_CHECKS } from '@/content/audit-checks';
import type { AuditResult, Finding } from '@/types/audit';
import type { AuditSnapshotRecord } from '../audit.types';
import { countFailures, isExpired, isValidShareId, mergeFindings, scoreFindings, toPreview } from '../audit.utils';
import { AuditResults } from './audit-results';
import { ExpiredAudit, SharedAudit } from './shared-audit-page';
import { ShareAuditPanel } from './share-audit-panel';

function buildPreview() {
  const passing = new Set(['seo.title', 'seo.lang', 'seo.viewport']);
  const findings: Finding[] = AUDIT_CHECKS.map((check) => ({
    checkId: check.id,
    status: passing.has(check.id) ? 'pass' : 'fail',
    evidence: `EVIDENCE-${check.id}`,
  }));
  const merged = mergeFindings(AUDIT_CHECKS, findings);
  const result: AuditResult = {
    url: 'https://example.com/',
    finalUrl: 'https://example.com/',
    auditedAt: '2026-11-09T02:00:00.000Z',
    scores: scoreFindings(merged),
    counts: countFailures(merged),
    findings: merged,
  };
  return toPreview(result);
}

const snapshot: AuditSnapshotRecord = {
  shareId: 'k3Fq9xZp2a',
  url: 'https://example.com/',
  domain: 'example.com',
  createdAt: '2026-11-09T02:00:00.000Z',
  expiresAt: '2026-12-09T02:00:00.000Z',
  preparedFor: null,
  views: 0,
  preview: buildPreview(),
};

describe('SharedAudit', () => {
  it('is a read-only page with one h1, the dates, and no live-only parts', () => {
    const html = renderToStaticMarkup(<SharedAudit snapshot={snapshot} />);
    expect((html.match(/<h1/g) ?? []).length).toBe(1);
    expect(html).toContain('Website audit of example.com');
    expect(html).toContain('Nov 9, 2026');
    expect(html).toContain('LINK VALID UNTIL');
    expect(html).toContain('DEC 9, 2026');
    expect(html).toContain('Get the full audit');
    expect(html).not.toContain('PERFORMANCE · MOBILE');
    expect(html).not.toContain('Share this audit');
    expect(html).not.toContain('PREPARED FOR');
  });

  it('shows who it was prepared for, escaped and capped at 80 characters', () => {
    const html = renderToStaticMarkup(<SharedAudit snapshot={{ ...snapshot, preparedFor: 'Acme Co.' }} />);
    expect(html).toContain('PREPARED FOR ACME CO.');

    const hostile = renderToStaticMarkup(<SharedAudit snapshot={{ ...snapshot, preparedFor: '<img src=x onerror=alert(1)>' + 'z'.repeat(200) }} />);
    expect(hostile).not.toContain('<img src=x');
    expect(hostile).toContain('&lt;IMG SRC=X');
    expect(hostile).not.toContain('z'.repeat(81));
  });

  it('never carries a locked finding’s evidence, why or fix', () => {
    const html = renderToStaticMarkup(<SharedAudit snapshot={snapshot} />);
    for (const finding of snapshot.preview.findings) {
      if (!finding.isLocked) continue;
      const check = AUDIT_CHECKS.find((c) => c.id === finding.id)!;
      expect(html).not.toContain(`EVIDENCE-${check.id}`);
      expect(html).not.toContain(check.why);
      expect(html).not.toContain(check.fix);
    }
  });
});

describe('ExpiredAudit', () => {
  it('says the audit is out of date and offers a fresh run', () => {
    const html = renderToStaticMarkup(<ExpiredAudit domain="example.com" />);
    expect(html).toContain('This audit is out of date');
    expect(html).toContain('example.com');
    expect(html).toContain('href="/audit"');
    expect(html).not.toContain('Prepared for');
  });
});

describe('AuditResults share panel', () => {
  const preview = buildPreview();
  const live = { status: 'loading' } as const;

  it('offers sharing only when the scan has a ticket', () => {
    expect(renderToStaticMarkup(<AuditResults preview={preview} performance={live} ticket="1.sig" />)).toContain('Share this audit');
    expect(renderToStaticMarkup(<AuditResults preview={preview} performance={live} ticket={null} />)).not.toContain('Share this audit');
    expect(renderToStaticMarkup(<AuditResults preview={preview} performance={live} />)).not.toContain('Share this audit');
  });

  it('starts as a button and says how long the link lasts', () => {
    const html = renderToStaticMarkup(<ShareAuditPanel url="https://example.com/" ticket="1.sig" />);
    expect(html).toContain('Create share link');
    expect(html).toContain('works for 30 days');
    expect(html).not.toContain('<input');
  });
});

describe('share helpers', () => {
  it.each([
    ['k3Fq9xZp2a', true],
    ['AAAAAAAAAA', true],
    ['a-b_c-d_e1', true],
    ['short', false],
    ['waytoolong12', false],
    ['has space!', false],
    ['../../etc/', false],
    ['', false],
  ])('isValidShareId(%j) is %s', (value, expected) => {
    expect(isValidShareId(value)).toBe(expected);
  });

  it('isExpired treats past, equal and unparseable dates as expired', () => {
    const now = Date.UTC(2026, 10, 9);
    expect(isExpired('2026-12-09T00:00:00.000Z', now)).toBe(false);
    expect(isExpired('2026-11-09T00:00:00.000Z', now)).toBe(true);
    expect(isExpired('2026-11-08T00:00:00.000Z', now)).toBe(true);
    expect(isExpired('not a date', now)).toBe(true);
  });
});
