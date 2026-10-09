import { SegmentedProgress } from '@/components/blueprint';
import type { BuildStatus } from '@/types/blueprint';

export type MobileProjectCardProps = {
  projectName: string;
  segments: { status: BuildStatus; percent?: number }[];
};

/** Floating project card under the mobile top bar (Sheet 03b). */
export function MobileProjectCard({ projectName, segments }: MobileProjectCardProps) {
  const total = segments.length;
  const liveCount = segments.filter((s) => s.status === 'live').length;
  const percent = total === 0 ? 0 : Math.round((liveCount / total) * 100);

  return (
    <div className="rounded-lg border border-glow/30 bg-navy/[0.78] p-3.5 backdrop-blur-[12px]">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-lg font-semibold text-text-strong">{projectName}</span>
        <span className="font-mono text-xs text-glow">
          {percent}% · {liveCount}/{total}
        </span>
      </div>
      <SegmentedProgress segments={segments} showHeader={false} className="mt-2.5" />
    </div>
  );
}
