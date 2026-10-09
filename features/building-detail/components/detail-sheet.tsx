'use client';

import { Zap, X } from 'lucide-react';
import { Button } from '@/components/blueprint';
import { useFocusReturn } from '@/hooks/use-focus-return';
import { useHotkeys } from '@/hooks/use-hotkeys';
import type { Feature } from '@/types/blueprint';
import { DetailBody } from './detail-body';
import { DetailIdentity } from './detail-identity';

export type DetailSheetProps = {
  feature: Feature;
  onClose: () => void;
  onPowerUp: () => void;
  onAutoBuild: () => void;
};

/** Sheet 04b — the expanded building detail sheet (mobile). */
export function DetailSheet({ feature, onClose, onPowerUp, onAutoBuild }: DetailSheetProps) {
  useFocusReturn(true);
  useHotkeys({ Escape: onClose });

  return (
    <div
      role="dialog"
      aria-label={`${feature.name} details`}
      className="absolute inset-x-0 bottom-0 top-[240px] z-50 flex flex-col gap-4 overflow-y-auto rounded-t-sheet border-t border-glow/50 bg-navy/[0.95] p-5"
    >
      <div className="flex items-center gap-3">
        <DetailIdentity feature={feature} size={44} className="flex-1" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="focus-blueprint grid size-11 shrink-0 place-items-center rounded-control border border-muted/35 text-text"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <DetailBody feature={feature} compact />

      <div className="mt-auto flex flex-col gap-2 pt-2">
        <Button size="lg" onClick={onPowerUp} className="justify-center" iconLeft={<Zap className="size-[18px]" aria-hidden />}>
          Power it up
        </Button>
        <button type="button" onClick={onAutoBuild} className="focus-blueprint h-10 font-sans text-[13px] text-text-soft">
          Auto-build this instead
        </button>
      </div>
    </div>
  );
}
