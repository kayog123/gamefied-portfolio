import { describe, expect, it } from 'vitest';
import { AUDIT_CHECKS } from '@/content/audit-checks';
import type { AuditResult, Finding } from '@/types/audit';
import { countFailures, mergeFindings, scoreFindings, toPreview } from '../audit.utils';
import { generateShareId } from './share-id';
import { parsePreviewJson } from './snapshot-schema';
import { isValidShareId } from '../audit.utils';

function buildPreview() {
  const passing = new Set(['seo.title', 'seo.lang']);
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

describe('parsePreviewJson', () => {
  const preview = buildPreview();

  it('round-trips a real preview', () => {
    expect(parsePreviewJson(JSON.stringify(preview))).toEqual(preview);
  });

  it('strips smuggled why / fix / evidence from locked findings, even if the stored JSON carries them', () => {
    const tampered = JSON.parse(JSON.stringify(preview)) as { findings: Record<string, unknown>[] };
    for (const finding of tampered.findings) {
      if (finding.isLocked) Object.assign(finding, { why: 'SMUGGLED-WHY', fix: 'SMUGGLED-FIX', evidence: 'SMUGGLED-EVIDENCE' });
    }
    const parsed = parsePreviewJson(JSON.stringify(tampered));
    expect(parsed).not.toBeNull();
    expect(JSON.stringify(parsed)).not.toContain('SMUGGLED');
    expect(parsed!.findings.some((finding) => finding.isLocked)).toBe(true);
  });

  it.each([
    ['not JSON', 'not json'],
    ['a JSON array', '[]'],
    ['missing scores', JSON.stringify({ ...buildPreview(), scores: undefined })],
    ['a bad severity', JSON.stringify({ ...buildPreview(), findings: [{ id: 'x', category: 'seo', title: 't', severity: 'doom', status: 'fail', isLocked: true }] })],
    ['an open finding without its why/fix', JSON.stringify({ ...buildPreview(), findings: [{ id: 'x', category: 'seo', title: 't', severity: 'info', tier: 'open', status: 'fail', isLocked: false }] })],
  ])('rejects %s', (_label, json) => {
    expect(parsePreviewJson(json)).toBeNull();
  });

  it.each([undefined, null, 42, {}])('rejects a non-string value (%j)', (value) => {
    expect(parsePreviewJson(value)).toBeNull();
  });
});

describe('generateShareId', () => {
  it('makes 10 URL-safe characters that pass validation', () => {
    for (let i = 0; i < 200; i++) expect(isValidShareId(generateShareId())).toBe(true);
  });

  it('does not repeat', () => {
    const ids = new Set(Array.from({ length: 2000 }, generateShareId));
    expect(ids.size).toBe(2000);
  });
});
