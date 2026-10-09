'use client';

import { cn } from '@/lib/cn';
import { WIRE_NODES } from '../mini-game.constants';

export type WireGameTapListProps = {
  linksMade: number;
  shake: boolean;
  onTapNode: (nodeIndex: number) => void;
};

const STATE_CLASSES = {
  linked: 'border-live text-live-text',
  next: 'border-cta bg-cta/10 text-cta-hover',
  idle: 'border-glow/40 bg-input text-glow-soft',
} as const;

/** Mobile tap-based board: tap nodes in order (Sheet 05c). */
export function WireGameTapList({ linksMade, shake, onTapNode }: WireGameTapListProps) {
  return (
    <div className={cn('mt-5.5 flex flex-col items-stretch', shake && 'animate-shake')}>
      {WIRE_NODES.map((node, i) => {
        const state = i <= linksMade ? 'linked' : i === linksMade + 1 ? 'next' : 'idle';
        return (
          <div key={node.name} className="flex flex-col items-center">
            {i > 0 && <span className={cn('h-[22px] w-0.5', state === 'idle' ? 'bg-glow/30' : 'bg-cta')} />}
            <button
              type="button"
              onClick={() => onTapNode(i)}
              className={cn(
                'focus-blueprint box-border flex h-[76px] w-full items-center gap-3.5 rounded-lg border px-4',
                STATE_CLASSES[state],
                state === 'next' && 'shadow-[0_0_24px_rgb(245,158,11,0.25)]',
              )}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full border border-current font-mono text-xs font-semibold">
                {i + 1}
              </span>
              <span className="flex-1 text-left">
                <span className="block font-display text-base font-semibold text-text-strong">{node.name}</span>
                <span className="block font-mono text-[11px] text-muted">{node.tech}</span>
              </span>
              <span className="font-mono text-[10px] tracking-label">
                {state === 'linked' ? 'LINKED ✓' : state === 'next' ? 'TAP NEXT' : ''}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
