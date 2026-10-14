'use client';

import { useEffect, useRef } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const INTERACTIVE = 'a, button, summary, label, select, [role="button"], [data-cursor="hover"]';
const TEXT_FIELD = 'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';

/**
 * Blueprint cursor: a glowing dot that tracks the pointer exactly, plus a drafting-style ring
 * with crosshair ticks that trails behind, swells over interactive elements and presses in on
 * click. Only for fine pointers with motion allowed; everyone else keeps the native cursor.
 * Styles live in globals.css (`.cursor-*`).
 */
export function CustomCursor() {
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const root = document.documentElement;
    root.classList.add('custom-cursor-on');

    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let frame = 0;

    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    const setState = (state: string) => {
      dot.dataset.state = state;
      ring.dataset.state = state;
    };

    const onMove = (e: PointerEvent) => {
      if (dot.dataset.ready !== 'true') {
        // First move: snap the ring to the pointer so it doesn't fly in from the corner.
        rx = e.clientX;
        ry = e.clientY;
        dot.dataset.ready = 'true';
        ring.dataset.ready = 'true';
      }
      x = e.clientX;
      y = e.clientY;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(TEXT_FIELD)) setState('text');
      else if (target?.closest(INTERACTIVE)) setState('hover');
      else setState('idle');
    };
    const onDown = () => {
      dot.dataset.pressed = 'true';
      ring.dataset.pressed = 'true';
    };
    const onUp = () => {
      delete dot.dataset.pressed;
      delete ring.dataset.pressed;
    };
    const onLeave = () => {
      delete dot.dataset.ready;
      delete ring.dataset.ready;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      root.classList.remove('custom-cursor-on');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div ref={ringRef} className="cursor-ring" data-state="idle">
        <span className="cursor-ring-body" />
      </div>
      <div ref={dotRef} className="cursor-dot" data-state="idle" />
    </div>
  );
}
