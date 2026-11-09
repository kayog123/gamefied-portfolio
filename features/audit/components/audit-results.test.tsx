import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AUDIT_CHECKS } from '@/content/audit-checks';
import type { AuditPreview, AuditResult, Finding } from '@/types/audit';
import { countFailures, mergeFindings, scoreFindings, toPreview } from '../audit.utils';
import { AuditResults } from './audit-results';

/** A neglected site: every check fails except a few, so locked and open findings both appear. */
function buildPreview(): AuditPreview {
  const passing = new Set(['seo.title', 'seo.lang', 'seo.viewport', 'maintainability.doctype']);
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

describe('AuditResults', () => {
  const preview = buildPreview();
  const html = renderToStaticMarkup(<AuditResults preview={preview} />);

  it('renders scores, the plain-English summary and both contact buttons above the findings', () => {
    expect(html).toContain('Audit of example.com');
    expect(html).toContain('WHAT THIS MEANS FOR YOU');
    expect(html).toContain('Book a call to walk through it');
    expect(html).toContain('Email me about these results');
    expect(html.indexOf('WHAT THIS MEANS FOR YOU')).toBeLessThan(html.indexOf('things to improve'));
  });

  it('shows locked findings as title + severity only', () => {
    const locked = preview.findings.filter((f) => f.isLocked);
    expect(locked.length).toBeGreaterThan(5);
    expect(html).toContain('LOCKED');
    for (const finding of locked) expect(html).toContain(finding.title);
    // Passing checks never show up as findings to fix.
    expect(html).not.toContain('Mobile viewport');
  });

  it('never puts a locked check’s evidence, why or fix in the markup', () => {
    for (const finding of preview.findings) {
      if (!finding.isLocked) continue;
      const check = AUDIT_CHECKS.find((c) => c.id === finding.id)!;
      expect(html).not.toContain(`EVIDENCE-${check.id}`);
      expect(html).not.toContain(check.why);
      expect(html).not.toContain(check.fix);
    }
  });

  it('keeps open findings collapsed until clicked, with their evidence visible', () => {
    expect(html).toContain('EVIDENCE-seo.meta-description');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('WHY IT MATTERS');
  });

  it('offers the full audit with the locked count', () => {
    const locked = preview.findings.filter((f) => f.isLocked).length;
    expect(html).toContain(`${locked} findings are locked`);
    expect(html).toContain('Get the full audit');
  });
});
