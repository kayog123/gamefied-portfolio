'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/** Dispatched on `window` by <PulseShooter> when a bug is hit; `detail` is `{ id }`. */
export const BUG_KILL_EVENT = 'bug:kill';
/** Points for squashing a bug. */
export const SCORE_BUG = 50;
/** Radius (px) around a bug's centre that counts as a hit. Read by <PulseShooter>. */
export const BUG_HIT_RADIUS = 30;

const SIZE = 44;
const DYING_MS = 450;
/** Delay before the first bug / the second bug first shows up. */
const FIRST_SPAWN_MS: [number, number] = [1500, 3000];
const SECOND_SPAWN_MS: [number, number] = [8000, 15000];
/** Delay before a killed bug's slot respawns. Slot 0 is the "always there" bug. */
const RESPAWN_MS: [number, number] = [1500, 3500];
const RESPAWN_SECOND_MS: [number, number] = [9000, 20000];

type Sim = {
  x: number;
  y: number;
  /** Radians; 0 = moving right. */
  heading: number;
  speed: number;
  /** Radians per second, re-rolled every so often so the path wanders. */
  turn: number;
  turnLeft: number;
  /** Seconds left of a stop-and-twitch pause. */
  pause: number;
};

type Bug = { id: number; slot: 0 | 1; dying: boolean };

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const randMs = ([min, max]: [number, number]) => rand(min, max);

function spawnSim(): Sim {
  const w = window.innerWidth;
  const h = window.innerHeight;
  // Enter from a random edge, heading roughly toward the middle.
  const side = Math.floor(Math.random() * 4);
  const x = side === 0 ? -SIZE : side === 1 ? w + SIZE : rand(0, w);
  const y = side === 2 ? -SIZE : side === 3 ? h + SIZE : rand(0, h);
  const heading = Math.atan2(h / 2 - y, w / 2 - x) + rand(-0.6, 0.6);
  return { x, y, heading, speed: rand(70, 120), turn: 0, turnLeft: 0, pause: 0 };
}

function place(el: HTMLElement, s: Sim) {
  el.style.transform = `translate(${s.x - SIZE / 2}px, ${s.y - SIZE / 2}px) rotate(${s.heading + Math.PI / 2}rad)`;
}

/**
 * Landing-page mini game: one or two bugs crawl around the whole viewport. Shoot one for +50
 * (the hit test lives in <PulseShooter>, which owns the score). Movement runs in a single
 * requestAnimationFrame loop that writes transforms straight to the DOM, so React only
 * re-renders when a bug spawns or dies. Decorative, `aria-hidden`, pointer-transparent, and
 * not mounted under `prefers-reduced-motion`.
 */
export function BugCrawler() {
  const reducedMotion = useReducedMotion();
  const [bugs, setBugs] = useState<Bug[]>([]);
  const sims = useRef(new Map<number, Sim>());
  const els = useRef(new Map<number, HTMLElement>());
  const nextId = useRef(0);
  const timers = useRef(new Set<number>());

  const later = useEffectEvent((ms: number, fn: () => void) => {
    const t = window.setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  });

  const spawn = useEffectEvent((slot: 0 | 1) => {
    const id = nextId.current++;
    sims.current.set(id, spawnSim());
    setBugs((list) => [...list, { id, slot, dying: false }]);
  });

  const kill = useEffectEvent((id: number) => {
    const bug = bugs.find((b) => b.id === id);
    if (!bug || bug.dying) return;
    setBugs((list) => list.map((b) => (b.id === id ? { ...b, dying: true } : b)));
    later(DYING_MS, () => {
      sims.current.delete(id);
      els.current.delete(id);
      setBugs((list) => list.filter((b) => b.id !== id));
    });
    later(randMs(bug.slot === 0 ? RESPAWN_MS : RESPAWN_SECOND_MS), () => spawn(bug.slot));
  });

  useEffect(() => {
    if (reducedMotion) return;
    const pending = timers.current;
    const live = sims.current;
    later(randMs(FIRST_SPAWN_MS), () => spawn(0));
    later(randMs(SECOND_SPAWN_MS), () => spawn(1));

    const onKill = (e: Event) => kill((e as CustomEvent<{ id: number }>).detail.id);
    window.addEventListener(BUG_KILL_EVENT, onKill);

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (const [id, s] of live) {
        const el = els.current.get(id);
        if (!el) continue;
        if (s.pause > 0) {
          s.pause -= dt;
        } else {
          s.turnLeft -= dt;
          if (s.turnLeft <= 0) {
            s.turnLeft = rand(0.4, 1.4);
            s.turn = rand(-1.8, 1.8);
            if (Math.random() < 0.12) s.pause = rand(0.25, 0.7);
          }
          s.heading += s.turn * dt;
          // Near an edge, steer back toward the middle so bugs roam but stay on screen.
          const m = SIZE;
          if (s.x < m || s.x > w - m || s.y < m || s.y > h - m) {
            const want = Math.atan2(h / 2 - s.y, w / 2 - s.x);
            const diff = Math.atan2(Math.sin(want - s.heading), Math.cos(want - s.heading));
            s.heading += diff * Math.min(1, 4 * dt);
          }
          s.x = Math.min(Math.max(s.x + Math.cos(s.heading) * s.speed * dt, -SIZE), w + SIZE);
          s.y = Math.min(Math.max(s.y + Math.sin(s.heading) * s.speed * dt, -SIZE), h + SIZE);
        }
        place(el, s);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(BUG_KILL_EVENT, onKill);
      for (const t of pending) clearTimeout(t);
      pending.clear();
      live.clear();
      setBugs([]);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {bugs.map((b) => (
        <div
          key={b.id}
          ref={(el) => {
            if (!el) return;
            els.current.set(b.id, el);
            const s = sims.current.get(b.id);
            if (s) place(el, s);
          }}
          data-bug=""
          data-bug-id={b.id}
          data-dying={b.dying ? '' : undefined}
          className="absolute left-0 top-0 will-change-transform"
          style={{ width: SIZE, height: SIZE }}
        >
          <svg viewBox="0 0 44 44" className="bug-body size-full text-danger-text" fill="none">
            <g className="bug-legs-a" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M16 18 L6 12" />
              <path d="M15 24 L4 24" />
              <path d="M16 31 L7 38" />
            </g>
            <g className="bug-legs-b" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M28 18 L38 12" />
              <path d="M29 24 L40 24" />
              <path d="M28 31 L37 38" />
            </g>
            <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M19 9 L15 2" />
              <path d="M25 9 L29 2" />
            </g>
            <circle cx="22" cy="11" r="4.5" fill="currentColor" />
            <ellipse cx="22" cy="26" rx="8.5" ry="12" fill="currentColor" fillOpacity="0.85" />
            <path d="M22 16 V38" stroke="var(--color-navy)" strokeWidth="1.2" strokeOpacity="0.6" />
          </svg>
        </div>
      ))}
    </div>
  );
}
