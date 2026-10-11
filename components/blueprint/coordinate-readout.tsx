'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

export type CoordinateReadoutProps = {
  /** Grid pitch shown in the readout, in px. Defaults to the desktop minor grid (32). */
  grid?: number;
  className?: string;
};

const format = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, '0');

/**
 * Drafting-style coordinates (`X 0720 · Y 0450 · GRID 32`) that follow the
 * pointer in viewport pixels. Updates the text node directly (one rAF per
 * frame) so moving the mouse never re-renders React. Decorative. Sheet 01.
 */
export function CoordinateReadout({ grid = 32, className }: CoordinateReadoutProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    let x = 0;
    let y = 0;

    function paint() {
      frame = 0;
      if (ref.current) ref.current.textContent = `X ${format(x)} · Y ${format(y)} · GRID ${grid}`;
    }

    function onMove(e: PointerEvent) {
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = window.requestAnimationFrame(paint);
    }

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.cancelAnimationFrame(frame);
    };
  }, [grid]);

  return (
    <span ref={ref} aria-hidden className={cn('font-mono text-[10px] tracking-label text-muted tabular-nums', className)}>
      X 0720 · Y 0450 · GRID {grid}
    </span>
  );
}
