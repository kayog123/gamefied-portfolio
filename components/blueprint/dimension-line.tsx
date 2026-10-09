import { cn } from '@/lib/cn';

export type DimensionLineProps = {
  label: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
};

/** Blueprint dimension annotation, e.g. "880 PX · 500 CHAR MAX". Decorative. */
export function DimensionLine({ label, orientation = 'horizontal', className }: DimensionLineProps) {
  if (orientation === 'vertical') {
    return (
      <div
        aria-hidden
        className={cn('flex flex-col items-center gap-2.5 font-mono text-[10px] tracking-label text-glow', className)}
      >
        <span className="h-px w-2.5 bg-wire" />
        <span className="w-px flex-1 bg-wire/55" />
        <span style={{ writingMode: 'vertical-rl' }}>{label}</span>
        <span className="w-px flex-1 bg-wire/55" />
        <span className="h-px w-2.5 bg-wire" />
      </div>
    );
  }

  return (
    <div aria-hidden className={cn('flex w-full items-center gap-2.5 font-mono text-[10px] tracking-label text-glow', className)}>
      <span className="h-2.5 w-px bg-wire" />
      <span className="h-px flex-1 bg-wire/55" />
      <span className="shrink-0">{label}</span>
      <span className="h-px flex-1 bg-wire/55" />
      <span className="h-2.5 w-px bg-wire" />
    </div>
  );
}
