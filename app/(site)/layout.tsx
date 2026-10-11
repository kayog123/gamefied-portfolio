import type { ReactNode } from 'react';
import { ScrollToTop } from '@/components/scroll-to-top';

/**
 * Shell for the static, scrollable content pages (Sheets 07–08).
 * A plain `children` type, not `LayoutProps<Route>` — this route-group
 * layout wraps multiple/nested pages, not one exact routed segment.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-blueprint-flat min-h-dvh">
      {children}
      <ScrollToTop />
    </div>
  );
}
