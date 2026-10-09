import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type PanelProps = {
  /** Two-corner (top-left + bottom-right) is the HUD default; four-corner is for modals/sheets. */
  ticks?: 2 | 4;
  tone?: 'blue' | 'green';
  tickSize?: number;
  title?: ReactNode;
  action?: ReactNode;
  /** Mono footer hint, e.g. "↑↓ NAVIGATE · ↵ INSPECT". */
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
};

const TONE_COLOR: Record<NonNullable<PanelProps['tone']>, string> = {
  blue: 'var(--color-glow)',
  green: 'var(--color-live)',
};

const TONE_FILL: Record<NonNullable<PanelProps['tone']>, string> = {
  blue: 'var(--color-glass)',
  green: 'rgb(34 197 94 / 0.05)',
};

const TONE_BORDER: Record<NonNullable<PanelProps['tone']>, string> = {
  blue: 'rgb(59 130 246 / 0.3)',
  green: 'rgb(34 197 94 / 0.45)',
};

function tickBackground(tone: NonNullable<PanelProps['tone']>, ticks: 2 | 4, size: number) {
  const color = TONE_COLOR[tone];
  const corners =
    ticks === 2
      ? (['0 0', '100% 100%'] as const)
      : (['0 0', '100% 0', '0 100%', '100% 100%'] as const);

  const layers = corners.flatMap((pos) => [
    `linear-gradient(${color},${color}) ${pos} / ${size}px 1px no-repeat`,
    `linear-gradient(${color},${color}) ${pos} / 1px ${size}px no-repeat`,
  ]);

  return [...layers, TONE_FILL[tone]].join(', ');
}

/** Glass panel with corner ticks (Sheet 00). The HUD's default surface. */
export function Panel({
  ticks = 2,
  tone = 'blue',
  tickSize = ticks === 4 ? 12 : 10,
  title,
  action,
  footer,
  className,
  bodyClassName,
  children,
}: PanelProps) {
  return (
    <div
      className={cn('rounded-panel backdrop-blur-[14px]', className)}
      style={{
        border: `1px solid ${TONE_BORDER[tone]}`,
        background: tickBackground(tone, ticks, tickSize),
      }}
    >
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-glow/22 px-4 py-3.5">
          <span className="font-mono text-[11px] tracking-label text-muted">{title}</span>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
      {footer && <div className="font-mono text-[11px] text-muted">{footer}</div>}
    </div>
  );
}
