import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

type Pulse = {
  axis: 'x' | 'y';
  /** Grid-line index (multiples of the minor cell). */
  line: number;
  /** Streak length in px. */
  len: number;
  /** Seconds per cycle, including the resting gap. */
  dur: number;
  /** Negative so streaks are already mid-flight on load. */
  delay: number;
  /** Runs right-to-left / bottom-to-top. */
  reverse?: boolean;
};

const PULSES: Pulse[] = [
  { axis: 'x', line: 3, len: 160, dur: 9, delay: -2 },
  { axis: 'x', line: 7, len: 120, dur: 12, delay: -7, reverse: true },
  { axis: 'x', line: 11, len: 200, dur: 10, delay: -4 },
  { axis: 'x', line: 15, len: 140, dur: 14, delay: -9, reverse: true },
  { axis: 'x', line: 19, len: 180, dur: 11, delay: -1 },
  { axis: 'y', line: 4, len: 140, dur: 10, delay: -3 },
  { axis: 'y', line: 9, len: 180, dur: 13, delay: -8, reverse: true },
  { axis: 'y', line: 13, len: 120, dur: 9, delay: -5 },
  { axis: 'y', line: 20, len: 160, dur: 12, delay: -6, reverse: true },
  { axis: 'y', line: 27, len: 140, dur: 11, delay: -2 },
  { axis: 'y', line: 33, len: 200, dur: 14, delay: -11, reverse: true },
];

/**
 * Decorative light streaks that run along the bg-blueprint grid lines, like
 * blood through veins. Sits behind the screens, ignores the pointer, and is
 * hidden under `prefers-reduced-motion`. Pure CSS, so it's SSR-safe.
 */
export function GridPulses() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden [--cell:24px] motion-reduce:hidden md:[--cell:32px]"
    >
      {PULSES.map((p) => (
        <span
          key={`${p.axis}-${p.line}`}
          data-pulse=""
          data-axis={p.axis}
          data-reverse={p.reverse ? '' : undefined}
          className={cn(p.axis === 'x' ? 'grid-pulse-x' : 'grid-pulse-y', 'will-change-transform')}
          style={
            {
              '--line': p.line,
              '--len': `${p.len}px`,
              '--dur': `${p.dur}s`,
              '--delay': `${p.delay}s`,
              rotate: p.reverse ? '180deg' : undefined,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
