'use client';

import { Chip } from '@/components/blueprint';
import { PRESETS, type Preset } from '@/content/presets';
import { ICONS } from '@/lib/icons';
import { cn } from '@/lib/cn';

export type PresetChipsProps = {
  onSelect: (preset: Preset) => void;
  selectedId?: string | null;
  className?: string;
};

/** "OR START FROM A PRESET" chip row (Sheet 01). */
export function PresetChips({ onSelect, selectedId, className }: PresetChipsProps) {
  return (
    <div className={cn('flex flex-wrap justify-start gap-2.5 md:justify-center', className)}>
      {PRESETS.map((preset) => {
        const Icon = ICONS[preset.icon];
        return (
          <Chip
            key={preset.id}
            selected={preset.id === selectedId}
            onClick={() => onSelect(preset)}
            icon={Icon ? <Icon className="size-[15px] shrink-0 text-glow" aria-hidden /> : undefined}
          >
            {preset.label}
          </Chip>
        );
      })}
    </div>
  );
}
