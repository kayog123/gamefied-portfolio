import type { BuildStatus } from '@/types/blueprint';
import { cn } from '@/lib/cn';

export type SegmentedProgressProps = {
  segments: { status: BuildStatus; percent?: number }[];
  /** Hide the "Your project: N% built" row, e.g. when a caller renders its own. */
  showHeader?: boolean;
  className?: string;
};

function segmentStyle(status: BuildStatus, percent?: number) {
  if (status === 'live') return { background: 'var(--color-live)', boxShadow: '0 0 8px rgb(34 197 94 / 0.7)' };
  if (status === 'building') {
    const p = percent ?? 50;
    return { background: `linear-gradient(90deg, var(--color-cta) ${p}%, var(--color-grid) ${p}%)` };
  }
  return { background: 'var(--color-grid)' };
}

/** "Your project: N% built" header + per-building segment bar (Sheet 00 / top bar, HUD). */
export function SegmentedProgress({ segments, showHeader = true, className }: SegmentedProgressProps) {
  const total = segments.length;
  const liveCount = segments.filter((s) => s.status === 'live').length;
  const percent = total === 0 ? 0 : Math.round((liveCount / total) * 100);
  const isComplete = total > 0 && liveCount === total;

  return (
    <div className={cn('flex flex-col gap-[7px]', className)}>
      {showHeader && (
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-sans text-sm text-text">
            Your project:{' '}
            <span className={cn('font-mono', isComplete ? 'text-live-text' : 'text-glow')}>{percent}%</span> built
          </span>
          <span className="font-mono text-[11px] tracking-label text-muted">
            BUILDINGS {liveCount}/{total}
          </span>
        </div>
      )}
      {isComplete ? (
        <div className="h-[5px] shadow-glow-live bg-live" />
      ) : (
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
          {segments.map((segment, i) => (
            <span key={i} className="h-[5px]" style={segmentStyle(segment.status, segment.percent)} />
          ))}
        </div>
      )}
    </div>
  );
}
