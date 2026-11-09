import { cn } from '@/lib/cn';
import type { PerformanceMetrics } from '@/types/audit';
import { performanceLevel, PERFORMANCE_LEVEL_LABEL } from '../audit.utils';
import type { PerformanceState } from '../hooks/use-audit-scan';

const CARD = 'flex flex-col gap-2.5 rounded-panel p-4 md:p-[18px]';

function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)} s`;
}

/** The three headline numbers as one caption: "LCP 2.4 s · CLS 0.05 · TBT 120 ms". */
export function formatMetrics({ lcpMs, cls, tbtMs }: PerformanceMetrics): string {
  return `LCP ${formatSeconds(lcpMs)} · CLS ${cls} · TBT ${tbtMs} ms`;
}

export type PerformanceCardProps = { performance: PerformanceState };

/**
 * The 4th score card: mobile speed from PageSpeed Insights. It appears with the rest of the results
 * in a "measuring" state, because Lighthouse takes 10–30 s and must never block the page.
 */
export function PerformanceCard({ performance }: PerformanceCardProps) {
  if (performance.status === 'done') {
    const { score, metrics } = performance.result;
    const level = performanceLevel(score);
    return (
      <div className={cn('panel-ticks', CARD)}>
        <h3 className="font-mono text-[11px] font-medium tracking-label text-muted">PERFORMANCE · MOBILE</h3>
        <p className="font-mono text-4xl font-semibold leading-none tracking-[-0.04em] text-text-strong md:text-5xl">
          {score}
          <span className="ml-0.5 text-sm tracking-normal text-glow md:text-lg">/100</span>
        </p>
        <div role="img" aria-label={`${score} out of 100, ${PERFORMANCE_LEVEL_LABEL[level].toLowerCase()}`} className="h-1 rounded-full bg-grid">
          <div
            className="h-1 rounded-full bg-glow shadow-[0_0_12px_var(--color-glow)] motion-safe:transition-[width] motion-safe:duration-700"
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="font-mono text-[11px] leading-[1.4] text-text-soft">{formatMetrics(metrics)}</p>
        {level !== 'good' && <p className="font-sans text-[13px] text-muted">What is slowing it down is part of the full audit.</p>}
      </div>
    );
  }

  const isLoading = performance.status === 'loading' || performance.status === 'idle';
  return (
    <div className={cn('border border-dashed border-wire/35 bg-glass/60', CARD)}>
      <h3 className="font-mono text-[11px] font-medium tracking-label text-muted">PERFORMANCE · MOBILE</h3>
      <p className="font-mono text-4xl font-semibold leading-none text-muted md:text-5xl" aria-hidden>
        ··
      </p>
      <div className="h-1 overflow-hidden rounded-full bg-grid" aria-hidden>
        {isLoading && <div className="h-1 w-2/5 rounded-full bg-glow/60 motion-safe:animate-pulse" />}
      </div>
      <p role="status" className="font-sans text-[13px] text-muted">
        {isLoading ? 'Measuring with PageSpeed. Usually 10–30 s.' : 'Couldn’t measure speed right now. The other results are complete.'}
      </p>
    </div>
  );
}
