import { Check } from 'lucide-react';
import type { BuildStatus } from '@/types/blueprint';
import { cn } from '@/lib/cn';

export type StatusTagProps = {
  status: BuildStatus;
  /** Shown as "BUILDING · 52%" when present. */
  percent?: number;
  className?: string;
};

const LABEL: Record<BuildStatus, string> = {
  live: 'Live',
  building: 'Building',
  blueprint: 'Blueprint',
};

const CLASSES: Record<BuildStatus, string> = {
  live: 'bg-live/14 text-live-text',
  building: 'bg-cta/14 text-cta-hover',
  blueprint: 'border border-glow/50 text-glow-soft',
};

/** LIVE / BUILDING / BLUEPRINT tag (Sheet 00). Mono, uppercase, tracked. */
export function StatusTag({ status, percent, className }: StatusTagProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-tag px-[7px] py-[3px] font-mono text-[10px] font-medium tracking-label uppercase',
        CLASSES[status],
        status === 'blueprint' && 'py-0.5 px-1.5',
        className,
      )}
    >
      {status === 'live' && <Check className="size-2.5" aria-hidden />}
      {LABEL[status]}
      {status === 'building' && typeof percent === 'number' && ` · ${percent}%`}
    </span>
  );
}
