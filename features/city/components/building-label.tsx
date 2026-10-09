import type { BuildStatus } from '@/types/blueprint';

export type BuildingLabelProps = {
  name: string;
  status: BuildStatus;
  percent?: number;
  variant: 'label' | 'card';
};

const STATUS_META: Record<BuildStatus, { text: string; color: string }> = {
  live: { text: 'Live', color: '#22c55e' },
  building: { text: 'Building', color: '#f59e0b' },
  blueprint: { text: 'Blueprint', color: '#60a5fa' },
};

/**
 * City-scene building tooltip (docs/design-system/02-components.md#tooltip-city-labels).
 * Passive `label` on hover-off buildings when `labels` is set; `card` on the active one.
 */
export function BuildingLabel({ name, status, percent, variant }: BuildingLabelProps) {
  const meta = STATUS_META[status];

  if (variant === 'label') {
    return (
      <div className="flex flex-col items-center whitespace-nowrap">
        <div
          className="flex items-center gap-1.5 rounded-control px-[9px] py-[5px] font-mono text-[11px] font-medium text-text"
          style={{ background: 'rgb(11 18 32 / 0.88)', border: `1px solid ${meta.color}66` }}
        >
          <span className="size-1.5 rounded-full" style={{ background: meta.color }} aria-hidden />
          {name}
        </div>
        <span className="w-px bg-muted/60" style={{ height: 20 }} aria-hidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center whitespace-nowrap">
      <div
        className="flex min-w-[160px] flex-col gap-1.5 rounded-panel bg-glass-modal px-3 py-2.5"
        style={{ border: '1px solid var(--color-glow)', boxShadow: '0 0 24px rgb(59 130 246 / 0.45)' }}
      >
        <span className="font-display text-[15px] font-semibold text-text-strong">{name}</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: meta.color }}>
          <span className="size-1.5 rounded-full" style={{ background: meta.color }} aria-hidden />
          {meta.text.toUpperCase()}
          {status === 'building' && typeof percent === 'number' && ` · ${percent}%`}
        </span>
        <span className="border-t border-glow/25 pt-1.5 font-mono text-[10px] text-muted">
          CLICK TO INSPECT ↵
        </span>
      </div>
      <span className="w-px bg-glow" style={{ height: 32 }} aria-hidden />
    </div>
  );
}
