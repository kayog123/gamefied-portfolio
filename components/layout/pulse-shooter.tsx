'use client';

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { BUG_HIT_RADIUS, BUG_KILL_EVENT, SCORE_BUG } from './bug-crawler';

type Burst = {
  id: number;
  x: number;
  y: number;
  kind: 'miss' | 'hit' | 'head' | 'bug';
};

/** Extra px around a streak that still counts as a hit, so thin 2px lines stay shootable. */
const HIT_PAD = 16;
/** Radius around the glowing head that earns the bonus. */
const HEAD_RADIUS = 30;
const SCORE_HIT = 10;
const SCORE_HEAD = 25;

/**
 * Landing-page mini game: click (or tap) the light pulses running along the grid to shoot them.
 * Hitting a streak scores, hitting its glowing head scores more. Reads the `[data-pulse]` streaks
 * rendered by <GridPulses> from the DOM, so the pulses stay pure CSS. Decorative and optional:
 * hidden from assistive tech, and not mounted under `prefers-reduced-motion`.
 */
export function PulseShooter() {
  const reducedMotion = useReducedMotion();
  const [score, setScore] = useState(0);
  // Closed by default so it never covers page content; the `?` button opens it on demand.
  const [showHelp, setShowHelp] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(0);

  const shoot = useEffectEvent((e: PointerEvent) => {
    if (e.button !== 0) return;
    if (e.target instanceof Element && e.target.closest('[data-shooter-ui]')) return;
    const { clientX: x, clientY: y } = e;

    // Bugs sit on top of the grid, so they win over the pulses beneath them.
    for (const bug of document.querySelectorAll<HTMLElement>('[data-bug]:not([data-dying])')) {
      const r = bug.getBoundingClientRect();
      if (Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) > BUG_HIT_RADIUS) {
        continue;
      }
      bug.setAttribute('data-dying', '');
      window.dispatchEvent(
        new CustomEvent(BUG_KILL_EVENT, { detail: { id: Number(bug.dataset.bugId) } }),
      );
      setScore((s) => s + SCORE_BUG);
      setShowHelp(false);
      const id = nextId.current++;
      setBursts((list) => [...list.slice(-8), { id, x, y, kind: 'bug' }]);
      window.setTimeout(() => setBursts((list) => list.filter((b) => b.id !== id)), 800);
      return;
    }

    let best: 'hit' | 'head' | null = null;
    let target: HTMLElement | null = null;

    for (const el of document.querySelectorAll<HTMLElement>('[data-pulse]')) {
      if (el.hasAttribute('data-shot')) continue;
      if (Number(getComputedStyle(el).opacity) < 0.25) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const inside =
        x >= r.left - HIT_PAD &&
        x <= r.right + HIT_PAD &&
        y >= r.top - HIT_PAD &&
        y <= r.bottom + HIT_PAD;
      if (!inside) continue;

      const horizontal = el.dataset.axis === 'x';
      const reverse = el.hasAttribute('data-reverse');
      const headX = horizontal ? (reverse ? r.left : r.right) : r.left + r.width / 2;
      const headY = horizontal ? r.top + r.height / 2 : reverse ? r.top : r.bottom;
      const onHead = Math.hypot(x - headX, y - headY) <= HEAD_RADIUS;

      if (onHead || best === null) {
        best = onHead ? 'head' : 'hit';
        target = el;
      }
      if (onHead) break;
    }

    let kind: Burst['kind'] = 'miss';
    if (best && target) {
      kind = best;
      // Hidden for the rest of this run; <GridPulses> pulses reset on the next animation cycle.
      target.setAttribute('data-shot', '');
      setScore((s) => s + (best === 'head' ? SCORE_HEAD : SCORE_HIT));
    }
    setShowHelp(false);

    const id = nextId.current++;
    setBursts((list) => [...list.slice(-8), { id, x, y, kind }]);
    window.setTimeout(() => setBursts((list) => list.filter((b) => b.id !== id)), 800);
  });

  useEffect(() => {
    if (reducedMotion) return;
    const onIteration = (e: AnimationEvent) => {
      if (e.target instanceof HTMLElement) e.target.removeAttribute('data-shot');
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowHelp(false);
    };
    window.addEventListener('pointerdown', shoot, { passive: true });
    window.addEventListener('keydown', onKey);
    document.addEventListener('animationiteration', onIteration);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', shoot);
      document.removeEventListener('animationiteration', onIteration);
    };
  }, [reducedMotion]);

  // Drag the whole score/help container from anywhere on it. Pointer capture only starts once the
  // pointer moves past a small threshold, so the `?` and "GOT IT" buttons still click normally.
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; moved: boolean; suppressClick: boolean } | null>(
    null,
  );

  const onDragStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, moved: false, suppressClick: false };
  };
  const onDragMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    let dx = e.clientX - d.x;
    let dy = e.clientY - d.y;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < 4) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    // Keep the container inside the viewport.
    const r = e.currentTarget.getBoundingClientRect();
    const pad = 4;
    dx = Math.min(Math.max(dx, pad - r.left), window.innerWidth - pad - r.right);
    dy = Math.min(Math.max(dy, pad - r.top), window.innerHeight - pad - r.bottom);
    d.x += dx;
    d.y += dy;
    setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
  };
  const onDragEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d?.moved) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      d.suppressClick = true;
      // The click that follows a drag must not toggle the help button.
      window.setTimeout(() => {
        drag.current = null;
      }, 0);
    } else {
      drag.current = null;
    }
  };
  const onClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    if (drag.current?.suppressClick) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div aria-hidden>
        {bursts.map((b) => (
          <span
            key={b.id}
            className="shot-burst"
            data-kind={b.kind}
            style={{ left: b.x, top: b.y }}
          >
            <span className="shot-burst-ring" />
            {b.kind !== 'miss' && (
              <span className="shot-burst-pop">
                {b.kind === 'bug'
                  ? `BUG +${SCORE_BUG}`
                  : b.kind === 'head'
                    ? `HEAD +${SCORE_HEAD}`
                    : `+${SCORE_HIT}`}
              </span>
            )}
          </span>
        ))}
      </div>
      <div
        data-shooter-ui
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
        onClickCapture={onClickCapture}
        style={{ translate: `${pos.x}px ${pos.y}px` }}
        className="pointer-events-auto absolute left-4 top-[4.25rem] flex cursor-grab touch-none select-none flex-col items-start gap-2 active:cursor-grabbing md:left-8 md:top-20"
      >
        <div className="flex items-center gap-3 rounded-control border border-grid bg-navy/70 px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] text-muted backdrop-blur-[10px]">
          <span>SCORE</span>
          <span className="min-w-[4ch] text-right text-glow-pale tabular-nums">
            {String(score).padStart(4, '0')}
          </span>
          {score === 0 && (
            <span className="hidden text-text-faint lg:inline">· SHOOT THE LIGHT PULSES</span>
          )}
          <button
            type="button"
            data-shooter-ui
            aria-label="How to play the light pulse mini game"
            aria-expanded={showHelp}
            onClick={() => setShowHelp((v) => !v)}
            className="focus-blueprint -mr-1 grid size-5 place-items-center rounded-full border border-grid text-[11px] text-glow hover:border-glow"
          >
            ?
          </button>
        </div>
        {showHelp && (
          <div
            role="note"
            className="w-[min(280px,calc(100vw-2rem))] rounded-control border border-grid bg-navy/85 p-3 font-mono text-[11px] leading-relaxed tracking-[0.04em] text-text-soft backdrop-blur-[10px]"
          >
            <p className="mb-1.5 tracking-[0.12em] text-glow">HOW TO PLAY</p>
            <ul className="space-y-1">
              <li>
                <span className="text-glow-pale">CLICK / TAP</span> the light pulses running along
                the grid.
              </li>
              <li>
                Hit a line: <span className="text-glow-pale">+{SCORE_HIT}</span>. Hit its glowing
                head: <span className="text-cta-hover">+{SCORE_HEAD}</span>.
              </li>
              <li>
                Squash a crawling bug: <span className="text-danger-text">+{SCORE_BUG}</span>.
              </li>
              <li>Shot lines and bugs come back. Optional, just for fun.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="focus-blueprint mt-2 text-muted underline-offset-2 hover:text-text hover:underline"
            >
              GOT IT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
