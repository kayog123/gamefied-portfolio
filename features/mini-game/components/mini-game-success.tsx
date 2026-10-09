import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/blueprint';
import { ICONS } from '@/lib/icons';
import { WIRE_NODES } from '../mini-game.constants';

export type MiniGameSuccessProps = {
  buildingName: string;
  /** `null` means the timer ran out — "Jovanni finished it for you" instead. */
  wiredSeconds: number | null;
  shardName: string;
  nextBuildingName?: string;
  onBackToCity: () => void;
  onNext: () => void;
};

/** The "Building online ✓" success modal content (Sheet 05b). */
export function MiniGameSuccess({ buildingName, wiredSeconds, shardName, nextBuildingName, onBackToCity, onNext }: MiniGameSuccessProps) {
  return (
    <>
      <div className="relative mx-6 mt-6 flex h-[150px] items-center justify-center gap-0 rounded-panel border border-live/30" style={{ backgroundImage: 'linear-gradient(rgb(34 197 94 / 0.08) 1px, transparent 1px), linear-gradient(90deg, rgb(34 197 94 / 0.08) 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
        {WIRE_NODES.map((node, i) => {
          const Icon = ICONS[node.icon];
          return (
            <div key={node.name} className="flex items-center">
              {i > 0 && <span className="h-0.5 w-10 bg-live" style={{ boxShadow: '0 0 8px var(--color-live)' }} />}
              <div className="flex h-[72px] w-[120px] flex-col items-center justify-center gap-1 rounded-panel border border-live bg-live/10 text-live-text">
                {Icon && <Icon className="size-[18px]" aria-hidden />}
                <span className="font-display text-[13px] font-semibold text-text-strong">{node.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 pt-5.5 text-center">
        <div className="font-display text-[28px] font-semibold text-text-strong md:text-[30px]">
          Building online <span className="text-live">✓</span>
        </div>
        <p className="mt-1.5 font-sans text-sm text-muted">
          {wiredSeconds === null
            ? `${buildingName} is live. Jovanni finished it for you.`
            : `${buildingName} is live. Wired in ${wiredSeconds.toFixed(1)}s.`}
        </p>
        <div
          className="mx-auto mt-4.5 inline-flex items-center gap-3 rounded-panel border border-glow bg-wire/16 px-4 py-2.5"
          style={{ boxShadow: '0 0 30px rgb(59 130 246 / 0.45)' }}
        >
          <span className="font-mono text-xs font-semibold text-glow">+1 SKILL SHARD</span>
          <span className="h-4 w-px bg-glow/50" />
          <span className="inline-flex items-center gap-1.5 font-mono text-sm text-text-strong">
            <span className="size-2 rotate-45 bg-glow" aria-hidden />
            {shardName}
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-2.5 px-6 pb-5.5 pt-5.5">
        <Button variant="secondary" onClick={onBackToCity}>
          Back to city
        </Button>
        <Button onClick={onNext} iconRight={<ArrowRight className="size-[15px]" aria-hidden />}>
          {nextBuildingName ? `Next: ${nextBuildingName}` : 'See my brief'}
        </Button>
      </div>
    </>
  );
}
