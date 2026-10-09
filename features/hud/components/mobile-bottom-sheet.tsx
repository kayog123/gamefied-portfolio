import { Play } from 'lucide-react';
import { Button, SkillShard } from '@/components/blueprint';

export type MobileBottomSheetProps = {
  shards: string[];
  collectedCount: number;
  onAutoBuild: () => void;
  autoBuildDisabled?: boolean;
};

/** Collapsed bottom sheet (Sheet 03b): shard strip + the two main CTAs. */
export function MobileBottomSheet({ shards, collectedCount, onAutoBuild, autoBuildDisabled }: MobileBottomSheetProps) {
  return (
    <div className="h-[212px] shrink-0 rounded-t-sheet border-t border-glow/45 bg-navy/[0.92] px-4 pb-5 pt-2.5 backdrop-blur-[16px]">
      <div className="mx-auto h-1 w-10 rounded-full bg-slate-line" aria-hidden />
      <div className="mt-3.5 flex items-center justify-between font-mono text-[10px] tracking-label text-muted">
        <span>
          SKILL SHARDS · {collectedCount}/{shards.length}
        </span>
        <span className="text-glow">SWIPE UP FOR DETAILS</span>
      </div>
      <div className="mt-2.5 flex gap-1.5 overflow-x-hidden">
        {shards.map((name, i) => (
          <SkillShard key={name} name={name} state={i < collectedCount ? 'collected' : 'locked'} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button href="/work" variant="ghost" size="lg" className="border border-muted/35 justify-center">
          Skip to my work
        </Button>
        <Button
          size="lg"
          onClick={onAutoBuild}
          disabled={autoBuildDisabled}
          iconRight={<Play className="size-[13px]" aria-hidden />}
        >
          Auto-build
        </Button>
      </div>
    </div>
  );
}
