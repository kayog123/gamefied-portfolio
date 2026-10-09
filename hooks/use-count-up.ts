import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './use-reduced-motion';

export type UseCountUpOptions = {
  /** Total animation duration in ms. Defaults to 900. */
  duration?: number;
};

/**
 * Animates a number toward `target` (e.g. the "68%" generation stat, or a
 * progress percentage). Jumps straight to `target` under reduced motion.
 */
export function useCountUp(target: number, { duration = 900 }: UseCountUpOptions = {}): number {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (reducedMotion || from === target) {
      setValue(target);
      fromRef.current = target;
      return;
    }

    let frame: number;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(from + (target - from) * progress));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reducedMotion]);

  return value;
}
