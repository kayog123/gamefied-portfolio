import { ProgressBar } from '@/components/blueprint';
import { cn } from '@/lib/cn';

export type GenerationProgressProps = {
  percent: number;
  onCancel: () => void;
  className?: string;
};

/** "68% · DRAFTING BLUEPRINT · Cancel" stat block (Sheet 02, desktop). */
export function GenerationProgress({ percent, onCancel, className }: GenerationProgressProps) {
  return (
    <div className={cn('flex flex-col items-end gap-2.5', className)}>
      <div className="font-mono text-[56px] font-semibold leading-none tracking-display text-text-strong">
        {percent}
        <span className="text-2xl text-glow">%</span>
      </div>
      <ProgressBar value={percent} label="Blueprint generation progress" className="w-full" />
      <div className="flex w-full items-center justify-between font-mono text-[11px] tracking-label text-muted">
        <span>DRAFTING BLUEPRINT</span>
        <button type="button" onClick={onCancel} className="focus-blueprint text-text-soft hover:text-text-strong">
          Cancel
        </button>
      </div>
    </div>
  );
}
