import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  selected?: boolean;
};

/** Preset chip (Sheet 01) / mobile feature chip base. Pill, 1px blue border. */
export function Chip({ icon, selected = false, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'focus-blueprint inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-[15px] font-sans text-sm font-medium transition-colors',
        selected
          ? 'border-glow bg-wire/20 text-white'
          : 'border-wire/40 bg-navy/70 text-text hover:border-glow hover:bg-wire/14',
        className,
      )}
      {...props}
    >
      {selected ? <Check className="size-3.5 shrink-0 text-white" aria-hidden /> : icon}
      {children}
    </button>
  );
}
