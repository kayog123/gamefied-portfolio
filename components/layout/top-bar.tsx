import { MessageCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/blueprint';
import { cn } from '@/lib/cn';
import { Logo } from './logo';

export type GameTopBarProps = {
  /** Muted mono context next to the logo (desktop only), e.g. "BLUEPRINT" or the project name. */
  context?: string;
  /** Desktop-only center slot — the 420px segmented progress block on HUD screens. */
  center?: ReactNode;
  /** Replaces the logo on mobile (HUD only), e.g. "40% · 2/5". */
  mobileLeft?: ReactNode;
  className?: string;
};

/**
 * The fixed top bar shared by every game screen (Sheets 01–06).
 * See docs/design-system/03-layout-and-patterns.md#top-bar.
 */
export function GameTopBar({ context, center, mobileLeft, className }: GameTopBarProps) {
  return (
    <header
      className={cn(
        'relative z-40 flex h-14 shrink-0 items-center justify-between border-b border-grid bg-navy/70 px-4 backdrop-blur-[10px] md:h-16 md:bg-navy/60 md:px-8',
        center && 'md:grid md:grid-cols-[1fr_auto_1fr] md:justify-normal',
        className,
      )}
    >
      {mobileLeft ? (
        <>
          <span className="md:hidden">{mobileLeft}</span>
          <span className="hidden md:flex">
            <Logo context={context} />
          </span>
        </>
      ) : (
        <Logo context={context} />
      )}

      {center && <div className="hidden w-[420px] md:block">{center}</div>}

      <div className="flex items-center gap-1 md:gap-2 md:justify-self-end">
        <Button href="/work" variant="ghost" size="sm" className="px-2.5 md:px-3.5">
          <span className="md:hidden">My work</span>
          <span className="hidden md:inline">Skip → See my work</span>
        </Button>
        <Button
          href="/work#contact"
          variant="secondary"
          size="sm"
          iconLeft={<MessageCircle className="hidden size-[15px] animate-nudge md:inline" aria-hidden />}
        >
          Talk to me
        </Button>
      </div>
    </header>
  );
}
