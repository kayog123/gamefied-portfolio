import type { ComponentType } from 'react';
import type { BuildStatus } from '@/types/blueprint';
import { cn } from '@/lib/cn';

const STATUS_CLASSES: Record<BuildStatus, string> = {
  live: 'border-live bg-live/10 text-live-text',
  building: 'border-cta bg-cta/10 text-cta-hover',
  blueprint: 'border-glow bg-wire/10 text-glow-soft',
};

export type BuildingIconTileProps = {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  status: BuildStatus;
  size?: 44 | 48;
  className?: string;
};

/** The detail panel's status-colored identity icon (Sheet 04), distinct from the Features-list tile. */
export function BuildingIconTile({ icon: Icon, status, size = 48, className }: BuildingIconTileProps) {
  return (
    <span
      className={cn('grid shrink-0 place-items-center rounded-panel border', STATUS_CLASSES[status], className)}
      style={{ width: size, height: size }}
    >
      <Icon className={size === 48 ? 'size-6' : 'size-[22px]'} aria-hidden />
    </span>
  );
}
