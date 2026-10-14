import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { SiteTopBar, type SiteTopBarProps } from './site-top-bar';

export type PageWrapperProps = {
  children: ReactNode;
  /** Top bar flavour: "work" shows the section nav, "case-study" shows "← All work". */
  topBar?: SiteTopBarProps['variant'];
  /** Rendered after `<main>` (e.g. JSON-LD), so it stays outside the landmark. */
  after?: ReactNode;
  className?: string;
};

/**
 * Common frame for every `(site)` page: the top bar plus the single `<main>`
 * landmark. Pages compose their sections inside it instead of repeating this.
 * Content is centred and capped at `max-w-page` (1440) so it doesn't stretch
 * on ultra-wide screens; the top bar's inner row uses the same cap.
 */
export function PageWrapper({ children, topBar = 'work', after, className }: PageWrapperProps) {
  return (
    <>
      <SiteTopBar variant={topBar} />
      <main className={cn('mx-auto w-full max-w-page', className)}>{children}</main>
      {after}
    </>
  );
}
