import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { AUDIT_CHECKS } from '@/content/audit-checks';
import type { AuditResult, Finding } from '@/types/audit';
import type { AuditRequestRecord, FullAuditReport, ReportMeta } from '../audit.types';
import { countFailures, isRunStale, mergeFindings, scoreFindings } from '../audit.utils';
import { buildReport } from '../server/build-report';
import type { AiAnalysis } from '../server/report-schema';
import { ExpiredReport } from './audit-report-page';
import { ReviewPanel } from './audit-review-page';
import { FullReport } from './full-report';

// The review page mounts a client component that needs the app router; it is only a timer, so stub it.
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: () => {} }) }));

function buildResult(): AuditResult {
  const passing = new Set(['seo.title', 'seo.lang', 'seo.viewport', 'maintainability.doctype']);
  const findings: Finding[] = AUDIT_CHECKS.map((check) => ({
    checkId: check.id,
    status: passing.has(check.id) ? 'pass' : 'fail',
    evidence: `EVIDENCE-${check.id}`,
  }));
  const merged = mergeFindings(AUDIT_CHECKS, findings);
  return {
    url: 'https://example.com/',
    finalUrl: 'https://example.com/',
    auditedAt: '2026-11-09T02:00:00.000Z',
    scores: scoreFindings(merged),
    counts: countFailures(merged),
    findings: merged,
  };
}

const result = buildResult();
const NOW = new Date('2026-11-09T05:00:00.000Z');
const ai: AiAnalysis = {
  summary: 'Your site is quick but hard to find.',
  businessImpact: 'People searching for you may never see you.',
  plan: [{ findingId: 'seo.meta-description', action: 'Write a clear description.', effort: 'quick', impact: 'medium' }],
};
const aiReport: FullAuditReport = buildReport({ result, ai, model: 'grok-test', now: NOW });
const plainReport: FullAuditReport = buildReport({ result, ai: null, model: null, now: NOW });

describe('FullReport', () => {
  const html = renderToStaticMarkup(<FullReport domain="example.com" report={aiReport} />);

  it('is one page with one h1, the date, and who prepared it', () => {
    expect((html.match(/<h1/g) ?? []).length).toBe(1);
    expect(html).toContain('Full audit of example.com');
    expect(html).toContain('November 9, 2026');
    expect(html).toContain('Automated checks plus an AI-assisted analysis, reviewed by me.');
  });

  it('shows the AI’s summary and what it costs, then the plan in order', () => {
    expect(html).toContain('Your site is quick but hard to find.');
    expect(html).toContain('WHAT THIS COSTS YOU');
    expect(html).toContain('People searching for you may never see you.');
    expect(html.indexOf('The short version'.toUpperCase())).toBeLessThan(html.indexOf('What to do, in order'));
    expect(html.indexOf('What to do, in order')).toBeLessThan(html.indexOf('explained'));
    expect(html).toContain('Write a clear description.');
    expect(html).toContain('Quick win · under an hour'.toUpperCase());
  });

  it('shows EVERY failing finding with its evidence, why and fix, and nothing is locked', () => {
    const failing = result.findings.filter((finding) => finding.status === 'fail');
    expect(html).toContain(`All ${failing.length} findings, explained`);
    for (const finding of failing) {
      const check = AUDIT_CHECKS.find((c) => c.id === finding.id)!;
      expect(html).toContain(`id="finding-${finding.id}"`);
      expect(html).toContain(`EVIDENCE-${finding.id}`);
      expect(html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')).toContain(check.fix);
    }
    expect(html).not.toContain('LOCKED');
    expect(html).not.toContain('part of the full audit');
  });

  it('lists what passed, and ends with a way to get in touch', () => {
    expect(html).toContain('4 checks passed');
    expect(html).toContain('Book a call');
    expect(html).toContain('mailto:');
  });

  it('without AI it uses the standard summary and says only "automated checks"', () => {
    const plain = renderToStaticMarkup(<FullReport domain="example.com" report={plainReport} />);
    expect(plain).toContain('Automated checks, reviewed by me.');
    expect(plain).not.toContain('AI-assisted');
    expect(plain).not.toContain('WHAT THIS COSTS YOU');
    expect(plain).toContain(plainReport.lead.replace(/'/g, '&#x27;'));
    expect(plain).not.toContain('Quick win');
  });

  it('renders whatever the model wrote as text, never as markup', () => {
    const hostile = buildReport({
      result,
      ai: { ...ai, summary: '<img src=x onerror=alert(1)>', businessImpact: '<script>alert(2)</script>', plan: [{ findingId: 'seo.h1', action: '<b onmouseover=x>do it</b>', effort: 'quick', impact: 'low' }] },
      model: 'grok-test',
      now: NOW,
    });
    const page = renderToStaticMarkup(<FullReport domain="example.com" report={hostile} />);
    expect(page).not.toContain('<img src=x');
    expect(page).not.toContain('<script>alert(2)');
    expect(page).not.toContain('<b onmouseover');
    expect(page).toContain('&lt;img src=x');
  });

  it('copes with a site that has nothing to fix', () => {
    const clean: AuditResult = { ...result, findings: result.findings.map((finding) => ({ ...finding, status: 'pass' as const, isLocked: false })) };
    const page = renderToStaticMarkup(<FullReport domain="example.com" report={buildReport({ result: clean, ai: null, model: null, now: NOW })} />);
    expect(page).toContain('Nothing to fix');
    expect(page).not.toContain('What to do, in order');
  });
});

describe('ExpiredReport', () => {
  it('says the link expired and offers a way to ask for a new one', () => {
    const html = renderToStaticMarkup(<ExpiredReport />);
    expect(html).toContain('This report link has expired');
    expect(html).toContain('mailto:');
    expect(html).not.toContain('Full audit of');
  });
});

describe('ReviewPanel · full audit section', () => {
  const base: AuditRequestRecord = {
    id: 'req-1',
    createdAt: '2026-11-09T04:00:00.000Z',
    url: 'https://example.com/',
    domain: 'example.com',
    name: 'Maria Santos',
    email: 'maria@example.com',
    message: '',
    status: 'pending',
    previewSummary: null,
    sharedFrom: null,
    report: null,
    reportError: null,
    runStartedAt: null,
  };
  const meta = (patch: Partial<ReportMeta> = {}): ReportMeta => ({
    generatedAt: '2026-11-09T05:00:00.000Z',
    usedAi: true,
    model: 'grok-test',
    tokensUsed: 4321,
    expiresAt: '2026-12-09T05:00:00.000Z',
    sentAt: null,
    sendError: null,
    ...patch,
  });
  const render = (patch: Partial<AuditRequestRecord>, reportUrl: string | null = null) =>
    renderToStaticMarkup(<ReviewPanel request={{ ...base, ...patch }} token="t.sig" reportUrl={reportUrl} />);

  it('before any run: explains the cost and offers only "Run full audit"', () => {
    const html = render({});
    expect(html).toContain('Run full audit');
    expect(html).toContain('It costs tokens');
    expect(html).not.toContain('Send report to');
    expect(html).not.toContain('Re-run');
  });

  it('while running: says so, disables the button and refreshes itself', () => {
    const html = render({ status: 'running', runStartedAt: new Date().toISOString() });
    expect(html).toContain('Running: fresh checks first');
    expect(html).toContain('Running…');
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Running…/);
  });

  it('a run that was cut off more than five minutes ago can be started again', () => {
    const html = render({ status: 'running', runStartedAt: new Date(Date.now() - 10 * 60_000).toISOString() });
    expect(html).toContain('Run full audit');
    expect(html).not.toContain('Running: fresh checks first');
  });

  it('after a failure: shows the reason and offers to try again', () => {
    const html = render({ status: 'failed', reportError: 'The site couldn’t be audited right now: The site refused the connection.' });
    expect(html).toContain('The site refused the connection.');
    expect(html).toContain('role="alert"');
    expect(html).toContain('Run full audit');
  });

  it('with an AI report: shows model and tokens, the link, and offers to send it', () => {
    const html = render({ status: 'completed', report: meta() }, 'https://example.com/audit/report/req-1?token=1.sig');
    expect(html).toContain('grok-test');
    expect(html).toContain('4,321 tokens');
    expect(html).toContain('value="https://example.com/audit/report/req-1?token=1.sig"');
    expect(html).toContain('Open the report');
    expect(html).toContain('Send report to maria@example.com');
    expect(html).toContain('Re-run full audit');
    expect(html).toContain('Nothing has been sent to them yet');
  });

  it('says plainly when the AI was unavailable and this is the standard report', () => {
    const html = render({ status: 'completed', report: meta({ usedAi: false, model: null, tokensUsed: null }) }, 'https://example.com/r');
    expect(html).toContain('AI analysis was unavailable');
    expect(html).not.toContain('tokens');
  });

  it('after sending: shows when, and offers to send again', () => {
    const html = render({ status: 'completed', report: meta({ sentAt: '2026-11-09T06:00:00.000Z' }) }, 'https://example.com/r');
    expect(html).toContain('Sent to maria@example.com');
    expect(html).toContain('Send it again');
  });

  it('when sending failed: shows why and tells you to send the link by hand', () => {
    const html = render({ status: 'completed', report: meta({ sendError: 'Email isn’t configured (no RESEND_API_KEY).' }) }, 'https://example.com/r');
    expect(html).toContain('Couldn&#x27;t email it');
    expect(html).toContain('RESEND_API_KEY');
    expect(html).toContain('send it yourself');
  });

  it('puts the review token only in the two action forms; the report link carries its own, different token', () => {
    const html = render({ status: 'completed', report: meta() }, 'https://example.com/audit/report/req-1?token=9.reportsig');
    // Run + Send. ("Mark contacted" / "Decline" only exist for pending or contacted requests.)
    expect((html.match(/name="token"/g) ?? []).length).toBe(2);
    expect((html.match(/value="t\.sig"/g) ?? []).length).toBe(2);
    expect(html).toContain('token=9.reportsig');
    expect(html.match(/value="https:[^"]*"/)?.[0]).not.toContain('t.sig');
  });

  it('keeps "Mark contacted" and "Decline" for requests that are still open', () => {
    expect(render({ status: 'pending' })).toContain('Mark contacted');
    expect(render({ status: 'completed', report: meta() })).not.toContain('Mark contacted');
  });
});

describe('isRunStale', () => {
  const now = Date.UTC(2026, 10, 9, 12, 0, 0);
  it.each([
    [new Date(now - 60_000).toISOString(), false],
    [new Date(now - 4 * 60_000).toISOString(), false],
    [new Date(now - 5 * 60_000).toISOString(), true],
    [new Date(now - 60 * 60_000).toISOString(), true],
    [null, true],
    [undefined, true],
    ['not a date', true],
  ])('start time %j is stale: %s', (startedAt, expected) => {
    expect(isRunStale(startedAt, now)).toBe(expected);
  });
});
