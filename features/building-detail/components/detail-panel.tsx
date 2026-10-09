'use client';

import { Zap, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/blueprint';
import { BUILDING_LAYOUT } from '@/features/city';
import { useFocusReturn } from '@/hooks/use-focus-return';
import { useHotkeys } from '@/hooks/use-hotkeys';
import type { Feature } from '@/types/blueprint';
import { DetailBody } from './detail-body';
import { DetailIdentity } from './detail-identity';

export type DetailPanelProps = {
  feature: Feature;
  index: number;
  total: number;
  onClose: () => void;
  onPowerUp: () => void;
  onAutoBuild: () => void;
};

/** Sheet 04 — the right-docked building detail panel (desktop). */
export function DetailPanel({ feature, index, total, onClose, onPowerUp, onAutoBuild }: DetailPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const layout = BUILDING_LAYOUT.find((b) => b.id === feature.id);

  useFocusReturn(true);
  useEffect(() => closeButtonRef.current?.focus(), []);
  useHotkeys({ Escape: onClose });

  return (
    <div
      role="dialog"
      aria-label={`${feature.name} details`}
      className="absolute inset-y-16 right-0 z-50 flex w-[480px] flex-col border-l border-glow/45 bg-glass-strong backdrop-blur-[18px]"
      style={{ boxShadow: 'var(--shadow-panel-dock)' }}
    >
      <div className="flex shrink-0 items-center justify-between px-7 pt-5.5">
        <span className="font-mono text-[11px] tracking-label text-muted">
          BUILDING {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          {layout && ` · X ${layout.x} Y ${layout.y}`}
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="focus-blueprint grid size-9 place-items-center rounded-control border border-muted/35 text-text"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <DetailIdentity feature={feature} className="mt-3.5 shrink-0 px-7" />

      <div className="mt-5.5 flex-1 overflow-y-auto px-7">
        <DetailBody feature={feature} />
      </div>

      <div className="flex shrink-0 flex-col gap-2.5 border-t border-glow/25 px-7 pb-6 pt-4.5">
        <Button size="lg" onClick={onPowerUp} className="justify-center shadow-glow-cta" iconLeft={<Zap className="size-[18px]" aria-hidden />}>
          Power it up
        </Button>
        <div className="flex items-center justify-between font-mono text-[11px] tracking-label text-muted">
          <span>15-SEC MINI-GAME · WIRE THE API</span>
          <button type="button" onClick={onAutoBuild} className="focus-blueprint text-text-soft hover:text-text-strong">
            Auto-build this →
          </button>
        </div>
      </div>
    </div>
  );
}
