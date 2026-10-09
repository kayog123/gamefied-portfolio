import type { BuildStatus } from '@/types/blueprint';
import { useGame } from './use-game';

export type BuildProgress = {
  percent: number;
  liveCount: number;
  totalCount: number;
  /** One per feature, in order — feeds <SegmentedProgress>. */
  segments: { status: BuildStatus; percent?: number }[];
  /** Shard N (0-indexed) is collected once N+1 buildings are live — "+1 PER BUILDING". */
  collectedShardCount: number;
  isComplete: boolean;
};

/** Derived build-progress values for the top bar, HUD and shard tray (Sheet 03). */
export function useBuildProgress(): BuildProgress {
  const [{ blueprint }] = useGame();
  const features = blueprint?.features ?? [];
  const totalCount = features.length;
  const liveCount = features.filter((f) => f.status === 'live').length;

  return {
    percent: totalCount === 0 ? 0 : Math.round((liveCount / totalCount) * 100),
    liveCount,
    totalCount,
    segments: features.map((f) => ({ status: f.status, percent: f.percent })),
    collectedShardCount: Math.min(liveCount, blueprint?.shards.length ?? 0),
    isComplete: totalCount > 0 && liveCount === totalCount,
  };
}
