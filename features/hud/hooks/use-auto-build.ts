import { useEffect, useState } from 'react';
import { useGame } from '@/features/game';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export type UseAutoBuildResult = {
  isRunning: boolean;
  start: () => void;
};

const STEP_MS = 900;

/**
 * "Auto-build" (Sheet 03): brings every remaining building live in sequence,
 * ~900ms apart, each one collecting a shard ("+1 PER BUILDING").
 */
export function useAutoBuild(): UseAutoBuildResult {
  const [{ blueprint }, dispatch] = useGame();
  const [isRunning, setIsRunning] = useState(false);
  const reducedMotion = useReducedMotion();

  function start() {
    const hasRemaining = blueprint?.features.some((f) => f.status !== 'live') ?? false;
    if (hasRemaining) setIsRunning(true);
  }

  useEffect(() => {
    if (!isRunning || !blueprint) return;

    const remaining = blueprint.features.filter((f) => f.status !== 'live').map((f) => f.id);
    let index = 0;

    // Reduced motion still steps through the queue (async, every tick), just
    // with no visible delay between buildings — never a synchronous jump.
    const intervalId = window.setInterval(
      () => {
        dispatch({ type: 'BUILDING_WENT_LIVE', id: remaining[index] });
        index += 1;
        if (index >= remaining.length) {
          window.clearInterval(intervalId);
          setIsRunning(false);
        }
      },
      reducedMotion ? 0 : STEP_MS,
    );

    return () => window.clearInterval(intervalId);
    // `blueprint` is captured once per run as a fixed queue; re-running on every
    // BUILDING_WENT_LIVE dispatch (and its new `blueprint` reference) would restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, reducedMotion]);

  return { isRunning, start };
}
