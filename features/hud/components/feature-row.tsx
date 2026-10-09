import { StatusTag } from '@/components/blueprint';
import { ICONS } from '@/lib/icons';
import type { Feature } from '@/types/blueprint';
import { cn } from '@/lib/cn';

export type FeatureRowProps = {
  feature: Feature;
  active: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
};

/** One row in the Features panel (Sheet 03). Linked both ways with its City building. */
export function FeatureRow({ feature, active, onHover, onLeave, onSelect }: FeatureRowProps) {
  const Icon = ICONS[feature.icon];

  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      onClick={onSelect}
      className={cn(
        'focus-blueprint flex w-full items-center gap-3 rounded-control border px-2.5 py-[9px] text-left transition-colors',
        active ? 'border-glow bg-wire/14' : 'border-transparent hover:bg-wire/14',
      )}
      style={active ? { boxShadow: '0 0 18px rgb(59 130 246 / 0.25)' } : undefined}
    >
      <span className="flex size-[34px] shrink-0 items-center justify-center rounded-control border border-glow/35 text-glow">
        {Icon && <Icon className="size-4" aria-hidden />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-sans text-sm font-medium text-text">{feature.name}</span>
        <span className="mt-0.5 block truncate font-sans text-xs text-muted">{feature.subtitle}</span>
      </span>
      <StatusTag status={feature.status} percent={feature.percent} />
    </button>
  );
}
