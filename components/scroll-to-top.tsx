'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/cn';

export type ScrollToTopProps = {
  /** Scroll distance in px before the button appears. Defaults to 600. */
  threshold?: number;
};

/** Floating "back to top" button for long, scrolling pages. Hidden (and unfocusable) near the top. */
export function ScrollToTop({ threshold = 600 }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const update = () => setVisible(window.scrollY > threshold);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [threshold]);

  return (
    <button
      type="button"
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })}
      className={cn(
        'focus-blueprint fixed bottom-5 right-5 z-40 grid size-11 place-items-center rounded-control border border-wire bg-glass-strong text-glow backdrop-blur-[10px] transition-[opacity,translate,box-shadow,color] duration-300 ease-blueprint hover:border-glow hover:text-white hover:shadow-glow-blue md:bottom-8 md:right-8',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <ArrowUp className="size-[18px]" aria-hidden />
    </button>
  );
}
