'use client';

import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { ICONS } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { NODE_LEFT, REQUIRED_LINK_PAIRS, WIRE_NODES, WIRE_PORTS } from '../mini-game.constants';
import { portVisualState } from '../mini-game.utils';
import type { Point, UseWireGameResult } from '../hooks/use-wire-game';

export type WireGameBoardProps = Pick<
  UseWireGameResult,
  'linksMade' | 'shake' | 'pendingPortId' | 'dragFromPortId' | 'dragPoint' | 'startDrag' | 'updateDrag' | 'endDrag' | 'selectPort'
>;

const BOARD_WIDTH = 570;
const BOARD_HEIGHT = 230;

function portById(id: string) {
  return WIRE_PORTS.find((p) => p.id === id)!;
}

/** Desktop board: drag a wire between ports, or Tab + Enter to link (Sheet 05a). */
export function WireGameBoard({ linksMade, shake, pendingPortId, dragFromPortId, dragPoint, startDrag, updateDrag, endDrag, selectPort }: WireGameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);

  function pointFromEvent(e: { clientX: number; clientY: number }): Point {
    const rect = boardRef.current?.getBoundingClientRect();
    return { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) };
  }

  function handlePointerUp(e: ReactPointerEvent) {
    const target = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-port-id]');
    endDrag(target?.dataset.portId ?? null);
  }

  const dragFrom = dragFromPortId ? portById(dragFromPortId) : null;

  return (
    <div
      ref={boardRef}
      className={cn(
        'relative mx-6 mt-5 rounded-panel border border-dashed border-glow/35 bg-[length:16px_16px]',
        shake && 'animate-shake',
      )}
      style={{
        width: BOARD_WIDTH,
        height: BOARD_HEIGHT,
        backgroundImage:
          'linear-gradient(rgb(59 130 246 / 0.1) 1px, transparent 1px), linear-gradient(90deg, rgb(59 130 246 / 0.1) 1px, transparent 1px)',
      }}
      onPointerMove={(e) => dragFromPortId && updateDrag(pointFromEvent(e))}
      onPointerUp={dragFromPortId ? handlePointerUp : undefined}
      onPointerLeave={() => dragFromPortId && endDrag(null)}
    >
      <svg width={BOARD_WIDTH} height={BOARD_HEIGHT} className="absolute inset-0" aria-hidden>
        {REQUIRED_LINK_PAIRS.slice(0, linksMade).map(([aId, bId], i) => {
          const a = portById(aId);
          const b = portById(bId);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--color-live)"
              strokeWidth={2.5}
              style={{ filter: 'drop-shadow(0 0 4px rgb(34 197 94 / 0.7))' }}
            />
          );
        })}
        {dragFrom && dragPoint && (
          <line x1={dragFrom.x} y1={dragFrom.y} x2={dragPoint.x} y2={dragPoint.y} stroke="var(--color-cta)" strokeWidth={2} strokeDasharray="5 4" />
        )}
      </svg>

      {WIRE_NODES.map((node, i) => {
        const Icon = ICONS[node.icon];
        const connected = i <= linksMade;
        return (
          <div
            key={node.name}
            className="absolute top-[70px] flex h-[90px] w-[130px] flex-col items-center justify-center gap-1 rounded-panel bg-glass-modal"
            style={{
              left: NODE_LEFT[i],
              border: `1px solid ${connected ? 'var(--color-glow)' : 'rgb(96 165 250 / 0.45)'}`,
              boxShadow: connected ? '0 0 20px rgb(59 130 246 / 0.3)' : 'none',
              color: connected ? 'var(--color-glow)' : 'var(--color-glow-soft)',
            }}
          >
            {Icon && <Icon className="size-[22px]" aria-hidden />}
            <span className="font-display text-sm font-semibold text-text-strong">{node.name}</span>
            <span className="font-mono text-[10px] text-muted">{node.tech}</span>
          </div>
        );
      })}

      {WIRE_PORTS.map((port) => {
        const state = portVisualState(port, linksMade);
        const isPending = pendingPortId === port.id;
        return (
          <button
            key={port.id}
            type="button"
            data-port-id={port.id}
            aria-label={`${port.side === 'out' ? 'Source' : 'Target'} port, ${WIRE_NODES[port.nodeIndex].name}`}
            onPointerDown={(e) => {
              e.preventDefault();
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              startDrag(port.id, pointFromEvent(e));
            }}
            onClick={() => selectPort(port.id)}
            className={cn(
              'focus-blueprint absolute size-3 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full',
              state === 'done' && 'bg-glow',
              state === 'next-source' && (isPending ? 'bg-cta' : 'bg-cta/90'),
              state === 'next-target' && 'border-2 border-glow bg-navy',
              state === 'future' && 'bg-glow/30',
            )}
            style={{
              left: port.x,
              top: port.y,
              boxShadow: state === 'done' ? '0 0 10px var(--color-glow)' : state === 'next-source' ? '0 0 10px var(--color-cta)' : undefined,
              outline: isPending ? '2px solid var(--color-glow)' : undefined,
              outlineOffset: isPending ? 3 : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
