'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Play } from 'lucide-react';
import type { Project } from '@/content/projects';
import { DeviceMockup } from '@/components/device-mockup';

export type ProjectCardProps = {
  project: Project;
  /** The mobile card (Sheet 07b): shorter, no eyebrow/result footer. */
  compact?: boolean;
};

/** Project card (Sheet 07 "Shipped work" grid). */
export function ProjectCard({ project, compact = false }: ProjectCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-panel border border-wire/30 bg-glass-strong text-text transition-[border-color,box-shadow] hover:border-glow hover:shadow-[0_0_30px_rgb(59,130,246,0.2)]">
      {/* Ghost link covers the whole card — the primary tap/click target */}
      <Link href={`/work/${project.slug}`} className="focus-blueprint absolute inset-0 z-0" aria-label={project.title} />

      {project.image && project.mobileImage ? (
        <DeviceMockup title={project.title} desktop={project.image} mobile={project.mobileImage} />
      ) : project.image ? (
        <div className={compact ? 'relative h-[150px] overflow-hidden' : 'relative aspect-[16/10] overflow-hidden border-b border-glow/25'}>
          <Image src={project.image} alt={project.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      ) : (
        <div
          className={compact ? 'grid h-[150px] place-items-center bg-image font-mono text-[10px] text-muted' : 'grid aspect-[16/10] place-items-center border-b border-glow/25 bg-image font-mono text-[11px] text-muted'}
          style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgb(59 130 246 / 0.07) 0 10px, transparent 10px 20px)' }}
        >
          {project.shot}
        </div>
      )}

      <div className="relative z-10 flex flex-1 flex-col gap-2.5 p-4 md:p-5">
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
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-glow/18 pt-3">
            <span className="flex gap-2 font-sans text-[13px] leading-[1.45] text-text">
              <span className="font-mono text-[11px] text-live">RESULT</span>
              {project.result}
            </span>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label={project.urlKind === 'video' ? `Watch ${project.title} demo video` : `View ${project.title} live site`}
                className="focus-blueprint ml-auto flex shrink-0 items-center gap-1.5 rounded-tag border border-muted/35 px-2.5 py-1.5 font-mono text-[10px] tracking-label text-text-soft transition-colors hover:border-glow hover:text-glow"
              >
                {project.urlKind === 'video'
                  ? <><Play className="size-2.5" aria-hidden /> VIDEO</>
                  : <><ExternalLink className="size-2.5" aria-hidden /> LIVE</>
                }
              </a>
            )}
          </div>
        )}
        {compact && project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={project.urlKind === 'video' ? `Watch ${project.title} demo video` : `View ${project.title} live site`}
            className="focus-blueprint flex items-center gap-1.5 font-mono text-[10px] tracking-label text-text-soft hover:text-glow"
          >
            {project.urlKind === 'video'
              ? <><Play className="size-2.5" aria-hidden /> Watch video</>
              : <><ExternalLink className="size-2.5" aria-hidden /> View live</>
            }
          </a>
        )}
      </div>
    </div>
  );
}
