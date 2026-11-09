import type { AuditCategory, AuditPreview } from '@/types/audit';
import { AUDIT_CATEGORIES } from '../audit.constants';
import { buildSummary } from '../audit.summary';
import type { PerformanceState } from '../hooks/use-audit-scan';
import { AuditSummarySection } from './audit-summary';
import { FindingsList } from './findings-list';
import { FullAuditPanel } from './full-audit-panel';
import { PerformanceCard } from './performance-card';
import { ScoreCard } from './score-card';

export type AuditResultsProps = { preview: AuditPreview; performance: PerformanceState };

/** Sheet 09 results: scores → "what this means" → findings + full-audit panel. */
export function AuditResults({ preview, performance }: AuditResultsProps) {
  const domain = new URL(preview.finalUrl).hostname;
  const summary = buildSummary(preview);
  const lockedCount = preview.findings.filter((finding) => finding.isLocked).length;
  const hasCritical = preview.findings.some((finding) => finding.isLocked && finding.severity === 'critical');
  const passedCount = preview.findings.filter((finding) => finding.status === 'pass').length;

  const tally = (category: AuditCategory) => {
    const all = preview.findings.filter((finding) => finding.category === category);
    return { total: all.length, failing: all.filter((finding) => finding.status === 'fail').length };
  };

  return (
    <div className="flex flex-col gap-10 md:gap-12">
      <section aria-labelledby="scores-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="scores-title" className="font-display text-2xl font-semibold tracking-[-0.02em] text-text-strong md:text-3xl">
            Audit of {domain}
          </h2>
          <p className="font-mono text-[11px] tracking-label text-muted">
            <time dateTime={preview.auditedAt}>
              {new Date(preview.auditedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </time>{' '}
            · {preview.findings.length} CHECKS
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-4">
          {AUDIT_CATEGORIES.map((category) => (
            <ScoreCard key={category} category={category} score={preview.scores[category]} {...tally(category)} />
          ))}
          <PerformanceCard performance={performance} />
        </div>
      </section>

      <AuditSummarySection summary={summary} domain={domain} />

      <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-8">
        <div className="min-w-0 flex-1">
          <FindingsList findings={preview.findings} passedCount={passedCount} />
        </div>
        <div className="w-full lg:w-[380px] lg:shrink-0">
          <FullAuditPanel domain={domain} lockedCount={lockedCount} hasCritical={hasCritical} />
        </div>
      </div>
    </div>
  );
}
