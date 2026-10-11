import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export type UseTypeOnViewOptions = {
  /** Total characters to reveal. */
  length: number;
  /** ms per character. Defaults to 45. */
  charMs?: number;
  /** Pause after the element scrolls into view, before the first character. */
  startDelayMs?: number;
  /** Fraction of the element that must be visible to start. Defaults to 0.4. */
  threshold?: number;
};

export type UseTypeOnViewResult<T extends HTMLElement> = {
  ref: React.RefObject<T | null>;
  /** Characters currently revealed. */
  count: number;
  /** True until hydration: the server HTML holds the full text, and CSS hides it so it can type in. */
  pending: boolean;
  isDone: boolean;
};

const noopSubscribe = () => () => {};

/**
 * Reveals text one character at a time, once, when the element first scrolls
 * into view. The server render and reduced-motion visitors get the full text
 * (nothing is ever hidden behind JavaScript), so the text stays indexable.
 */
export function useTypeOnView<T extends HTMLElement>({
  length,
  charMs = 45,
  startDelayMs = 200,
  threshold = 0.4,
}: UseTypeOnViewOptions): UseTypeOnViewResult<T> {
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [started, setStarted] = useState(false);
  const [typed, setTyped] = useState(0);
  const animates = hydrated && !reducedMotion;

  useEffect(() => {
    const el = ref.current;
    if (!animates || !el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animates, threshold]);

  useEffect(() => {
    if (!animates || !started || typed >= length) return;
    const id = window.setTimeout(() => setTyped(typed + 1), typed === 0 ? startDelayMs : charMs);
    return () => window.clearTimeout(id);
  }, [animates, started, typed, length, charMs, startDelayMs]);

  const count = animates ? Math.min(typed, length) : length;
  return { ref, count, pending: !hydrated, isDone: count >= length };
}
