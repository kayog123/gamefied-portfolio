'use client';

import { SPARK_QUESTIONS } from '@/content/spark-questions';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/cn';
import { useRotatingTypewriter } from '../hooks/use-rotating-typewriter';

const LONGEST = SPARK_QUESTIONS.reduce((a, b) => (b.length > a.length ? b : a));

export type TypedHeadlineProps = {
  /** Freezes the rotation, e.g. once the visitor starts typing their idea. */
  paused?: boolean;
  className?: string;
};

/**
 * Sheet 01's H1. Screen readers and crawlers get the one stable question;
 * the visible text cycles through SPARK_QUESTIONS with a typewriter effect.
 * An invisible copy of the longest question reserves the space so nothing jumps.
 */
export function TypedHeadline({ paused, className }: TypedHeadlineProps) {
  const reducedMotion = useReducedMotion();
  const { text, isAnimating } = useRotatingTypewriter({ lines: SPARK_QUESTIONS, paused });

  return (
    <h1 className={className}>
      <span className="sr-only">{SPARK_QUESTIONS[0]}</span>
      <span aria-hidden className="grid">
        <span className="invisible col-start-1 row-start-1">{LONGEST}</span>
        <span className="col-start-1 row-start-1">
          {text}
          {!reducedMotion && (
            <span
              className={cn(
                'ml-1 inline-block h-[0.82em] w-[0.06em] translate-y-[0.06em] bg-glow',
                !isAnimating && !paused && 'animate-caret-blink',
              )}
            />
          )}
        </span>
      </span>
    </h1>
  );
}
