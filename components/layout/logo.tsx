import Link from 'next/link';
import { cn } from '@/lib/cn';
import { KayogMark } from './kayog-logo';

export type LogoProps = {
  /** Muted mono context after the wordmark, e.g. "BLUEPRINT" or a project name. */
  context?: string;
  className?: string;
};

/** The animated `</>` mark + "JOVANNI JUNGCO" wordmark used in every top bar. */
export function Logo({ context, className }: LogoProps) {
  return (
    <Link href="/" className={cn('flex shrink-0 items-center gap-3 focus-blueprint', className)}>
      <KayogMark size={28} alt="" />
      <span className="font-display text-[15px] font-semibold tracking-[0.06em] text-text-strong">JOVANNI JUNGCO</span>
      {context && (
        <span className="hidden font-mono text-[11px] text-muted md:inline">/ {context}</span>
      )}
    </Link>
  );
}
