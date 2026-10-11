'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '@/hooks/use-in-view';

export type RevealOnViewProps = {
  children: ReactNode;
  className?: string;
  /** Stagger offset in ms, for siblings that enter together. */
  delayMs?: number;
};

/**
 * Fades its children up the first time they scroll into view. Descendants
 * marked `.reveal-pop` / `.reveal-line` (globals.css) get a pop / a draw-in.
 * Content is fully visible without JS or under reduced motion.
 */
export function RevealOnView({ children, className, delayMs = 0 }: RevealOnViewProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-reveal
      data-revealed={inView || undefined}
      className={className}
      style={{ '--reveal-delay': `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
