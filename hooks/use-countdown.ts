import { useEffect, useEffectEvent, useState } from 'react';
import { useReducedMotion } from './use-reduced-motion';

export type UseCountdownOptions = {
  running?: boolean;
  onExpire?: () => void;
};

export type UseCountdownResult = {
  /** Seconds remaining, fractional. */
  remaining: number;
  /** 1 → 0, drives the timer ring. */
  progress: number;
  isExpired: boolean;
};

/**
 * Drift-free countdown for the mini-game timer ring (Sheet 05).
 * Under reduced motion it still counts down (so `onExpire` still fires
 * predictably) — it just doesn't matter visually, since `TimerRing`
 * skips its own sweep animation in that case.
 */
export function useCountdown(seconds: number, { running = true, onExpire }: UseCountdownOptions = {}): UseCountdownResult {
  const [remaining, setRemaining] = useState(seconds);
  // Resets `remaining` when `seconds` changes, without an Effect — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.
  const [prevSeconds, setPrevSeconds] = useState(seconds);
  if (seconds !== prevSeconds) {
    setPrevSeconds(seconds);
    setRemaining(seconds);
  }

  const reducedMotion = useReducedMotion();
  const handleExpire = useEffectEvent(() => onExpire?.());

  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const id = window.setInterval(
      () => {
        const left = Math.max(0, seconds - (performance.now() - start) / 1000);
        setRemaining(left);
        if (left === 0) {
          window.clearInterval(id);
          handleExpire();
        }
      },
      reducedMotion ? 250 : 100,
    );
    return () => window.clearInterval(id);
  }, [running, seconds, reducedMotion]);

  return { remaining, progress: remaining / seconds, isExpired: remaining === 0 };
}
