import { PROJECTS } from '@/content/projects';
import { ShippedWorkGrid } from './shipped-work-grid';

/** Sheet 07 "Shipped work": filterable by platform (and scope, once projects differ). */
export function ShippedWork() {
  return (
    <section id="work" className="px-5 py-12 md:px-12 md:py-20">
      <div className="hidden items-baseline justify-between md:flex">
        <h2 className="font-display text-[44px] font-semibold tracking-[-0.02em] text-text-strong">Shipped work</h2>
        <span className="font-mono text-xs tracking-label text-muted">{PROJECTS.length.toString().padStart(2, '0')} PROJECTS</span>
      </div>
      <h2 className="font-display text-[26px] font-semibold text-text-strong md:hidden">Shipped work</h2>

      <ShippedWorkGrid />
    </section>
  );
}
