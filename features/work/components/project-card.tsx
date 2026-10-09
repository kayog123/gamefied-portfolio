import Link from 'next/link';
import type { Project } from '@/content/projects';

export type ProjectCardProps = {
  project: Project;
  /** The mobile card (Sheet 07b): shorter, no eyebrow/result footer. */
  compact?: boolean;
};

/** Project card (Sheet 07 "Shipped work" grid). */
export function ProjectCard({ project, compact = false }: ProjectCardProps) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="focus-blueprint group flex flex-col overflow-hidden rounded-panel border border-wire/30 bg-glass-strong text-text transition-[border-color,box-shadow] hover:border-glow hover:shadow-[0_0_30px_rgb(59,130,246,0.2)]"
    >
      <div
        className={compact ? 'grid h-[150px] place-items-center bg-image font-mono text-[10px] text-muted' : 'grid aspect-[16/10] place-items-center border-b border-glow/25 bg-image font-mono text-[11px] text-muted'}
        style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgb(59 130 246 / 0.07) 0 10px, transparent 10px 20px)' }}
      >
        {project.shot}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4 md:p-5">
        {!compact && (
          <span className="font-mono text-[11px] tracking-label text-glow">
            {project.idx} · {project.kind}
          </span>
        )}
        <span className="font-display text-lg font-semibold text-text-strong md:text-xl">{project.title}</span>
        <span className="font-sans text-sm leading-[1.5] text-muted md:leading-[1.55]">{project.problem}</span>
        <span className="flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <span key={tech} className="rounded-tag border border-muted/35 px-2 py-[3px] font-mono text-[10px] text-text-soft md:text-[11px]">
              {tech}
            </span>
          ))}
        </span>
        {!compact && (
          <span className="mt-auto flex gap-2 border-t border-glow/18 pt-3 font-sans text-[13px] leading-[1.45] text-text">
            <span className="font-mono text-[11px] text-live">RESULT</span>
            {project.result}
          </span>
        )}
      </div>
    </Link>
  );
}
