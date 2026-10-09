import type { RoadmapPhase } from '@/types/blueprint';
import { cn } from '@/lib/cn';

const PHASE_BORDER = ['border-live', 'border-glow', 'border-muted/45'];
const PHASE_BG = ['bg-live/[0.06]', '', ''];

export function BriefRoadmap({ roadmap }: { roadmap: RoadmapPhase[] }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-label text-glow">PHASED ROADMAP</div>
      <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {roadmap.map((phase, i) => (
          <div key={phase.phase} className={cn('rounded-control border p-3', PHASE_BORDER[i], PHASE_BG[i])}>
            <div className="font-display text-sm font-semibold text-text-strong">{phase.phase}</div>
            <div className="mt-1.5 font-sans text-xs leading-[1.5] text-muted">{phase.items}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
