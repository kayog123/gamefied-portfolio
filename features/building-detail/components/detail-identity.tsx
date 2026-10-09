import { StatusTag } from '@/components/blueprint';
import { ICONS } from '@/lib/icons';
import type { Feature } from '@/types/blueprint';
import { cn } from '@/lib/cn';
import { BuildingIconTile } from './building-icon-tile';

export type DetailIdentityProps = {
  feature: Feature;
  size?: 44 | 48;
  className?: string;
};

/** Icon tile + name + status tag (Sheet 04). */
export function DetailIdentity({ feature, size = 48, className }: DetailIdentityProps) {
  const Icon = ICONS[feature.icon];

  return (
    <div className={cn('flex items-center gap-3.5', className)}>
      {Icon && <BuildingIconTile icon={Icon} status={feature.status} size={size} />}
      <div className="min-w-0 flex-1">
        <h2
          className={
            size === 48
              ? 'font-display text-[30px] font-semibold leading-[1.1] text-text-strong'
              : 'font-display text-2xl font-semibold text-text-strong'
          }
        >
          {feature.name}
        </h2>
        <StatusTag status={feature.status} percent={feature.percent} className="mt-1.5" />
      </div>
    </div>
  );
}
