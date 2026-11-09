import { describe, expect, it } from 'vitest';
import type { AuditCheck, AuditResult } from '@/types/audit';
import { countFailures, mergeFindings, normalizeAuditUrl, scoreFindings, toPreview } from './audit.utils';

const CATALOG: AuditCheck[] = [
  { id: 'open.basic', category: 'seo', title: 'Open basic', severity: 'warning', tier: 'open', why: 'why-open', fix: 'fix-open' },
  { id: 'open.critical', category: 'seo', title: 'Open critical', severity: 'critical', tier: 'open', why: 'why-oc', fix: 'fix-oc' },
  { id: 'locked.one', category: 'security', title: 'Locked one', severity: 'info', tier: 'locked', why: 'why-locked', fix: 'fix-locked' },
];

describe('normalizeAuditUrl', () => {
  it('adds https and drops the fragment', () => {
    expect(normalizeAuditUrl(' example.com/pricing#faq ')?.toString()).toBe('https://example.com/pricing');
  });

  it.each(['', 'ftp://example.com', 'https://user:pw@example.com', 'localhost', 'javascript:alert(1)', 'not a url'])(
    'rejects %j',
    (input) => {
      expect(normalizeAuditUrl(input)).toBeNull();
    },
  );
});

describe('mergeFindings', () => {
  it('locks failing locked checks and failing critical checks only', () => {
    const findings = mergeFindings(CATALOG, [
      { checkId: 'open.basic', status: 'fail' },
      { checkId: 'open.critical', status: 'fail' },
      { checkId: 'locked.one', status: 'pass' },
      { checkId: 'unknown', status: 'fail' },
    ]);
    expect(findings.map((f) => [f.id, f.isLocked])).toEqual([
      ['open.basic', false],
      ['open.critical', true],
      ['locked.one', false],
    ]);
  });

  it('applies a severity override', () => {
    const [finding] = mergeFindings(CATALOG, [{ checkId: 'open.basic', status: 'fail', severity: 'info' }]);
    expect(finding.severity).toBe('info');
  });
});

describe('scoring', () => {
  const findings = mergeFindings(CATALOG, [
    { checkId: 'open.basic', status: 'fail' }, // weight 2
    { checkId: 'open.critical', status: 'pass' }, // weight 3
    { checkId: 'locked.one', status: 'fail' }, // weight 1
  ]);

  it('scores by passed weight', () => {
    expect(scoreFindings(findings)).toEqual({ seo: 60, security: 0, maintainability: 100 });
  });

  it('counts failures by severity', () => {
    expect(countFailures(findings)).toEqual({ critical: 0, warning: 1, info: 1 });
  });
});

describe('toPreview', () => {
  it('never leaks evidence, why or fix of locked findings', () => {
    const findings = mergeFindings(CATALOG, [
      { checkId: 'open.basic', status: 'fail', evidence: 'open-evidence' },
      { checkId: 'locked.one', status: 'fail', evidence: 'SECRET-EVIDENCE' },
    ]);
    const result: AuditResult = {
      url: 'https://example.com/',
      finalUrl: 'https://example.com/',
      auditedAt: '2026-11-09T00:00:00.000Z',
      scores: scoreFindings(findings),
      counts: countFailures(findings),
      findings,
    };

    const json = JSON.stringify(toPreview(result));
    expect(json).not.toContain('SECRET-EVIDENCE');
    expect(json).not.toContain('why-locked');
    expect(json).not.toContain('fix-locked');
    expect(json).toContain('Locked one');
    expect(json).toContain('open-evidence');
    expect(json).toContain('fix-open');
  });
});
