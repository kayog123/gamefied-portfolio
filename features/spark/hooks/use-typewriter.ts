import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export type UseTypewriterOptions = {
  /** ms per character. Defaults to 18. */
  charDelayMs?: number;
  /** Called on every revealed character, including the final (full-text) tick. */
  onTick: (partialText: string) => void;
  onDone?: (fullText: string) => void;
};

export type UseTypewriterResult = {
  isTyping: boolean;
  /** Types `fullText` via `onTick`, replacing anything already typing. */
  start: (fullText: string) => void;
};

/**
 * Drives a typewriter effect without owning the text itself — the caller's
 * controlled input state is the single source of truth (Sheet 01 presets).
 *
 * `onTick`/`onDone` are read directly rather than via `useEffectEvent`: both
 * callers only ever forward to stable setters (`setState`/`dispatch`), so a
 * closure captured once per `start()` call can't go stale in practice, and
 * `useEffectEvent` output can't be called outside an Effect/Effect Event anyway.
 */
export function useTypewriter({ charDelayMs = 18, onTick, onDone }: UseTypewriterOptions): UseTypewriterResult {
  const [isTyping, setIsTyping] = useState(false);
  const reducedMotion = useReducedMotion();
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearInterval(intervalRef.current), []);

  function start(fullText: string) {
    window.clearInterval(intervalRef.current);

    if (reducedMotion) {
      setIsTyping(false);
      onTick(fullText);
      onDone?.(fullText);
      return;
    }

    setIsTyping(true);
    let i = 0;
    intervalRef.current = window.setInterval(() => {
      i += 1;
      onTick(fullText.slice(0, i));
      if (i >= fullText.length) {
        window.clearInterval(intervalRef.current);
        setIsTyping(false);
        onDone?.(fullText);
      }
    }, charDelayMs);
  }

  return { isTyping, start };
}
