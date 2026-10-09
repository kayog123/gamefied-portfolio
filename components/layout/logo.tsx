import Link from 'next/link';
import { cn } from '@/lib/cn';

export type LogoProps = {
  /** Muted mono context after the wordmark, e.g. "BLUEPRINT" or a project name. */
  context?: string;
  className?: string;
};

/** The diamond + "JOVANNI" wordmark used in every top bar. */
export function Logo({ context, className }: LogoProps) {
  return (
    <Link href="/" className={cn('flex shrink-0 items-center gap-3 focus-blueprint', className)}>
      <span className="size-[9px] rotate-45 border-[1.5px] border-glow" aria-hidden />
      <span className="font-display text-[15px] font-semibold tracking-[0.06em] text-text-strong">JOVANNI</span>
      {context && (
        <span className="hidden font-mono text-[11px] text-muted md:inline">/ {context}</span>
      )}
    </Link>
  );
}
