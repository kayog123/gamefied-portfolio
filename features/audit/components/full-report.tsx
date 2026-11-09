import { Calendar, Check, Mail } from 'lucide-react';
import { Button } from '@/components/blueprint';
import { CATEGORY_INFO } from '@/content/audit-page';
import { BOOK_A_CALL_URL, SOCIAL_LINKS } from '@/lib/site';
import { AUDIT_CATEGORIES } from '../audit.constants';
import type { FixEffort, FixImpact, FullAuditReport } from '../audit.types';
import { failingFindings } from '../server/build-report';
import { ScoreCard } from './score-card';
import { SeverityTag } from './severity-tag';

const EFFORT_LABEL: Record<FixEffort, string> = {
  quick: 'Quick win · under an hour',
  moderate: 'A few hours',
  involved: 'Several days',
};

const IMPACT_LABEL: Record<FixImpact, string> = { high: 'High impact', medium: 'Medium impact', low: 'Low impact' };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export type FullReportProps = { domain: string; report: FullAuditReport };

/**
 * `/audit/report/…`: the full audit as the requester reads it (Sheet 09). Every finding is shown in full, nothing is
 * locked. All text, including whatever the model wrote, is rendered as text and never as markup.
 */
export function FullReport({ domain, report }: FullReportProps) {
  const { result } = report;
  const failing = failingFindings(result);
  const byId = new Map(result.findings.map((finding) => [finding.id, finding]));
  const passed = result.findings.filter((finding) => finding.status === 'pass');
  const tally = (category: (typeof AUDIT_CATEGORIES)[number]) => {
    const all = result.findings.filter((finding) => finding.category === category);
    return { total: all.length, failing: all.filter((finding) => finding.status === 'fail').length };
  };
  const emailHref = `mailto:${SOCIAL_LINKS.email}?subject=${encodeURIComponent(`Questions about my audit of ${domain}`)}`;

  return (
    <div className="flex flex-col gap-10 px-5 py-12 md:gap-14 md:px-12 md:py-16">
      <header className="flex max-w-[860px] flex-col gap-3.5">
        <p className="font-mono text-[11px] font-medium tracking-eyebrow text-glow">FULL WEBSITE AUDIT</p>
        <h1 className="text-balance font-display text-4xl font-semibold leading-[1.02] tracking-display text-text-strong md:text-[56px]">
          Full audit of {domain}
        </h1>
        <p className="max-w-[720px] text-pretty font-sans text-base leading-[1.55] text-muted md:text-lg">
          Prepared by Jovanni Jungco, a full-stack engineer, on <time dateTime={report.generatedAt}>{formatDate(report.generatedAt)}</time>.{' '}
          {report.ai ? 'Automated checks plus an AI-assisted analysis, reviewed by me.' : 'Automated checks, reviewed by me.'}
        </p>
      </header>

      <section aria-label="Scores" className="grid gap-3 md:grid-cols-3 md:gap-4">
        {AUDIT_CATEGORIES.map((category) => (
          <ScoreCard key={category} category={category} score={result.scores[category]} {...tally(category)} />
        ))}
      </section>

      <section aria-labelledby="summary" className="panel-ticks flex flex-col gap-4 p-5 md:p-7">
        <p className="font-mono text-[11px] font-medium tracking-eyebrow text-glow">THE SHORT VERSION</p>
        <h2 id="summary" className="text-balance font-display text-2xl font-semibold leading-[1.12] tracking-[-0.02em] text-text-strong md:text-3xl">
          {report.headline}
        </h2>
        {report.ai ? (
          <>
            <p className="max-w-[820px] text-pretty font-sans text-base leading-[1.6] text-text-soft">{report.ai.summary}</p>
            <div className="flex max-w-[820px] flex-col gap-1.5">
              <h3 className="font-mono text-[10px] tracking-eyebrow text-glow">WHAT THIS COSTS YOU</h3>
              <p className="text-pretty font-sans text-base leading-[1.6] text-text-soft">{report.ai.businessImpact}</p>
            </div>
          </>
        ) : (
          <p className="max-w-[820px] text-pretty font-sans text-base leading-[1.6] text-text-soft">{report.lead}</p>
        )}
      </section>

      {report.plan.length > 0 && (
        <section aria-labelledby="plan" className="flex flex-col gap-4">
          <h2 id="plan" className="font-display text-2xl font-semibold text-text-strong md:text-3xl">
            What to do, in order
          </h2>
          <ol className="flex flex-col gap-2">
            {report.plan.map((item, index) => {
              const finding = byId.get(item.findingId);
              if (!finding) return null;
              return (
                <li key={item.findingId} className="flex gap-4 rounded-panel border border-wire/25 bg-glass p-4 md:p-5">
                  <span className="font-mono text-sm text-glow" aria-hidden>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <h3 className="font-display text-lg font-semibold text-text-strong">
                        <a href={`#finding-${finding.id}`} className="focus-blueprint hover:text-glow-pale">
                          {finding.title}
                        </a>
                      </h3>
                      <SeverityTag severity={finding.severity} />
                    </div>
                    <p className="text-pretty font-sans text-[15px] leading-[1.55] text-text-soft">{item.action}</p>
                    <p className="font-mono text-[11px] tracking-label text-muted">
                      {IMPACT_LABEL[item.impact].toUpperCase()}
                      {item.effort ? ` · ${EFFORT_LABEL[item.effort].toUpperCase()}` : ''}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section aria-labelledby="findings" className="flex flex-col gap-4">
        <h2 id="findings" className="font-display text-2xl font-semibold text-text-strong md:text-3xl">
          {failing.length === 0 ? 'Nothing to fix' : `All ${failing.length} ${failing.length === 1 ? 'finding' : 'findings'}, explained`}
        </h2>
        <ul className="flex flex-col gap-3">
          {failing.map((finding) => (
            <li key={finding.id} id={`finding-${finding.id}`} className="flex scroll-mt-24 flex-col gap-3 rounded-panel border border-wire/25 bg-glass p-4 md:p-5">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                <h3 className="font-display text-lg font-semibold text-text-strong">{finding.title}</h3>
                <SeverityTag severity={finding.severity} />
                <span className="font-mono text-[10px] tracking-label text-muted">{CATEGORY_INFO[finding.category].label.toUpperCase()}</span>
              </div>
              {finding.evidence && <p className="font-mono text-xs leading-[1.5] text-text-soft">{finding.evidence}</p>}
              <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                <div className="flex flex-col gap-1.5">
                  <h4 className="font-mono text-[10px] tracking-eyebrow text-glow">WHY IT MATTERS</h4>
                  <p className="text-pretty font-sans text-sm leading-[1.55] text-text-soft">{finding.why}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h4 className="font-mono text-[10px] tracking-eyebrow text-glow">HOW TO FIX</h4>
                  <p className="text-pretty font-sans text-sm leading-[1.55] text-text-soft">{finding.fix}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {passed.length > 0 && (
        <details className="rounded-panel border border-wire/25 bg-glass">
          <summary className="focus-blueprint cursor-pointer rounded-panel px-4 py-3.5 font-display text-base font-semibold text-text-strong">
            {passed.length} {passed.length === 1 ? 'check' : 'checks'} passed
          </summary>
          <ul className="grid gap-x-6 gap-y-2 px-4 pb-4 sm:grid-cols-2">
            {passed.map((finding) => (
              <li key={finding.id} className="flex items-center gap-2 font-sans text-sm text-text-soft">
                <Check className="size-4 shrink-0 text-glow-soft" aria-hidden />
                {finding.title}
              </li>
            ))}
          </ul>
        </details>
      )}

      <section aria-labelledby="next" className="panel-ticks flex flex-wrap items-center justify-between gap-4 p-5 md:p-7">
        <div className="flex max-w-[560px] flex-col gap-1.5">
          <h2 id="next" className="font-display text-xl font-semibold text-text-strong md:text-2xl">
            Want me to walk you through it?
          </h2>
          <p className="font-sans text-[15px] leading-[1.5] text-text-soft">I can explain any of this in plain language, or fix it for you. No obligation.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button href={emailHref} variant="secondary" iconLeft={<Mail className="size-4" aria-hidden />}>
            Email me
          </Button>
          <Button href={BOOK_A_CALL_URL} iconLeft={<Calendar className="size-4" aria-hidden />}>
            Book a call
          </Button>
        </div>
      </section>
    </div>
  );
}
