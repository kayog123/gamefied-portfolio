import { ICONS } from '@/lib/icons';
import type { BuildingId, Feature } from '@/types/blueprint';
import { cn } from '@/lib/cn';

const STATUS_BORDER: Record<Feature['status'], string> = {
  live: 'border-live/40',
  building: 'border-cta/40',
  blueprint: 'border-glow/40',
};

const STATUS_TEXT: Record<Feature['status'], string> = {
  live: 'text-live-text',
  building: 'text-cta-hover',
  blueprint: 'text-glow-soft',
};

export type MobileFeatureChipsProps = {
  features: Feature[];
  activeId: BuildingId | null;
  onSelect: (id: BuildingId) => void;
  className?: string;
};

/** Horizontal feature-chip row above the mobile bottom sheet (Sheet 03b). */
export function MobileFeatureChips({ features, activeId, onSelect, className }: MobileFeatureChipsProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto px-4', className)}>
      {features.map((feature) => {
        const Icon = ICONS[feature.icon];
        const isActive = feature.id === activeId;
        return (
          <button
            key={feature.id}
            type="button"
            onClick={() => onSelect(feature.id)}
            className={cn(
              'focus-blueprint flex h-10 shrink-0 items-center gap-1.5 rounded-full border bg-navy/85 px-3 font-sans text-[13px] font-medium',
              isActive ? 'border-glow bg-wire/20' : STATUS_BORDER[feature.status],
              isActive ? 'text-white' : STATUS_TEXT[feature.status],
            )}
          >
            {Icon && <Icon className="size-3.5" aria-hidden />}
            {feature.short}
          </button>
        );
      })}
    </div>
  );
}
