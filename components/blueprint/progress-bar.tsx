import { cn } from '@/lib/cn';

export type ProgressBarProps = {
  /** 0–100 */
  value: number;
  label?: string;
  className?: string;
};

/** Continuous progress track (Sheet 00 / Generating screen). */
export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-1 rounded-tag bg-grid', className)}
    >
      <div
        className="h-full rounded-tag bg-glow transition-[width] duration-500 ease-out"
        style={{ width: `${clamped}%`, boxShadow: '0 0 10px var(--color-glow)' }}
      />
    </div>
  );
}
