import { PROJECTS } from '@/content/projects';
import { MobileShippedWork } from './mobile-shipped-work';
import { ProjectCard } from './project-card';

/** Sheet 07 "Shipped work" — all 6 on desktop, top 2 + a link on mobile. */
export function ShippedWork() {
  return (
    <section id="work" className="px-5 py-12 md:px-12 md:py-20">
      <div className="hidden items-baseline justify-between md:flex">
        <h2 className="font-display text-[44px] font-semibold tracking-[-0.02em] text-text-strong">Shipped work</h2>
        <span className="font-mono text-xs tracking-label text-muted">{PROJECTS.length.toString().padStart(2, '0')} PROJECTS</span>
      </div>
      <h2 className="font-display text-[26px] font-semibold text-text-strong md:hidden">Shipped work</h2>

      <div className="mt-5 hidden grid-cols-3 gap-5 md:mt-9 md:grid">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>

      <div className="mt-3.5">
        <MobileShippedWork />
      </div>
    </section>
  );
}
