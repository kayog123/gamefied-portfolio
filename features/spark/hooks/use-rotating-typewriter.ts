import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export type UseRotatingTypewriterOptions = {
  lines: readonly string[];
  /** Freezes on the full current line, e.g. while the visitor is typing. */
  paused?: boolean;
  typeMs?: number;
  eraseMs?: number;
  /** How long a finished line stays before it is erased. */
  holdMs?: number;
};

type Phase = 'hold' | 'erase' | 'type';
type State = { line: number; length: number; phase: Phase };

export type UseRotatingTypewriterResult = {
  text: string;
  /** True while characters are being typed or erased (drives the caret blink). */
  isAnimating: boolean;
};

/**
 * Types a line, holds it, erases it, then types the next. Starts on the full
 * first line so the server render matches. With reduced motion (or when paused)
 * it shows the full current line and never animates.
 */
export function useRotatingTypewriter({
  lines,
  paused = false,
  typeMs = 45,
  eraseMs = 22,
  holdMs = 2800,
}: UseRotatingTypewriterOptions): UseRotatingTypewriterResult {
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<State>({ line: 0, length: lines[0].length, phase: 'hold' });
  const frozen = paused || reducedMotion || lines.length < 2;

  useEffect(() => {
    if (frozen) return;

    const full = lines[state.line].length;
    let delay: number;
    let next: State;

    if (state.phase === 'hold') {
      delay = holdMs;
      next = { ...state, phase: 'erase' };
    } else if (state.phase === 'erase') {
      delay = eraseMs;
      next =
        state.length > 0
          ? { ...state, length: state.length - 1 }
          : { line: (state.line + 1) % lines.length, length: 0, phase: 'type' };
    } else {
      delay = typeMs;
      next =
        state.length < full
          ? { ...state, length: state.length + 1 }
          : { ...state, phase: 'hold' };
    }

    const id = window.setTimeout(() => setState(next), delay);
    return () => window.clearTimeout(id);
  }, [state, frozen, lines, typeMs, eraseMs, holdMs]);

  const line = lines[state.line];
  return {
    text: frozen ? line : line.slice(0, state.length),
    isAnimating: !frozen && state.phase !== 'hold',
  };
}
