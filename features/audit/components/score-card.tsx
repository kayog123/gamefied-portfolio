import { CATEGORY_INFO } from '@/content/audit-page';
import type { AuditCategory } from '@/types/audit';
import { scoreLevel } from '../audit.summary';

export type ScoreCardProps = {
  category: AuditCategory;
  score: number;
  /** Failing checks in this category. */
  failing: number;
  total: number;
};

/** One category score: big mono number, thin bar, caption (Sheet 09 · "Stat + bar + label"). */
export function ScoreCard({ category, score, failing, total }: ScoreCardProps) {
  const level = scoreLevel(score);
  return (
    <div className="panel-ticks flex flex-col gap-2.5 p-4 md:p-[18px]">
      <h3 className="font-mono text-[11px] font-medium tracking-label text-muted">{CATEGORY_INFO[category].label.toUpperCase()}</h3>
      <p className="font-mono text-4xl font-semibold leading-none tracking-[-0.04em] text-text-strong md:text-5xl">
        {score}
        <span className="ml-0.5 text-sm tracking-normal text-glow md:text-lg">/100</span>
      </p>
      <div
        role="img"
        aria-label={`${score} out of 100, ${level === 'good' ? 'in good shape' : level === 'fair' ? 'worth fixing' : 'needs attention'}`}
        className="h-1 rounded-full bg-grid"
      >
        <div
          className="h-1 rounded-full bg-glow shadow-[0_0_12px_var(--color-glow)] motion-safe:transition-[width] motion-safe:duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="font-sans text-[13px] text-muted">
        {failing === 0 ? `All ${total} checks passed` : `${failing} of ${total} checks need work`}
      </p>
    </div>
  );
}
