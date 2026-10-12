import { ExternalLink, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { SiteTopBar } from '@/components/layout/site-top-bar';
import { getNextProject } from '@/content/case-studies';
import { PLATFORM_LABEL, SCOPE_LABEL, type Project } from '@/content/projects';
import { SectionRow } from './section-row';

/**
 * Plain project page for a project with no written case study yet. It uses
 * only the real fields in `content/projects.ts`, so nothing on it is invented.
 */
export function ProjectSummaryPage({ project }: { project: Project }) {
  const next = getNextProject(project.slug);
  const cells = [
    { k: 'PLATFORM', v: PLATFORM_LABEL[project.platform] },
    { k: 'SCOPE', v: SCOPE_LABEL[project.scope] },
    { k: 'STACK', v: project.stack.join(' · ') },
  ];

  return (
    <>
      <SiteTopBar variant="case-study" />

      <div className="px-5 pb-10 pt-12 md:px-40 md:pb-14 md:pt-20">
        <div className="font-mono text-xs tracking-eyebrow text-glow">
          PROJECT {project.idx}
          <span className="hidden md:inline"> · {project.kind}</span>
        </div>
        <h1 className="mt-3 text-balance font-display text-[38px] font-semibold leading-[1.02] tracking-[-0.03em] text-text-strong md:mt-4.5 md:text-[80px] md:leading-[1] md:tracking-[-0.035em]">
          {project.title}
        </h1>
        <p className="mt-4 max-w-[760px] text-pretty font-sans text-base leading-[1.6] text-muted md:mt-5 md:text-xl md:leading-[1.55]">
          {project.result}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-glow/35 py-4 md:mt-10 md:grid-cols-[160px_160px_1fr] md:gap-6">
          {cells.map((cell) => (
            <div key={cell.k} className={cell.k === 'STACK' ? 'col-span-2 md:col-span-1' : undefined}>
              <div className="font-mono text-[10px] tracking-label text-muted">{cell.k}</div>
              <div className="mt-1.5 font-sans text-[15px] text-text">{cell.v}</div>
            </div>
          ))}
        </div>

        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-blueprint mt-6 inline-flex items-center gap-2 rounded-control border border-wire bg-wire/12 px-[18px] py-3 font-sans text-[15px] text-text transition-colors hover:border-glow hover:bg-wire/24 hover:text-white"
          >
            {project.urlKind === 'video' ? (
              <>
                Watch the demo video <Play className="size-3.5" aria-hidden />
              </>
            ) : (
              <>
                Visit the live site <ExternalLink className="size-3.5" aria-hidden />
              </>
            )}
          </a>
        )}
      </div>

      <div className="px-5 pb-12 md:px-40 md:pb-[72px]">
        {project.image ? (
          <div className="relative h-[220px] overflow-hidden rounded-control border border-glow/40 md:h-[480px]">
            <Image src={project.image} alt={`${project.title} screenshot`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 1160px" priority />
          </div>
        ) : (
          <div
            className="grid h-[220px] place-items-center rounded-control border border-glow/40 bg-image font-mono text-xs text-muted md:h-[480px]"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgb(59 130 246 / 0.07) 0 10px, transparent 10px 20px)' }}
          >
            product screenshot — {project.shot.replace('screenshot — ', '')}
          </div>
        )}
      </div>

      <SectionRow label="01 — PROBLEM">
        <p className="max-w-[760px] text-pretty font-sans text-lg leading-[1.6] text-text-soft md:text-xl">{project.problem}</p>
      </SectionRow>

      <div className="flex flex-col gap-2 border-t border-grid px-5 py-8 md:flex-row md:items-center md:justify-between md:px-40 md:py-10">
        <span className="font-mono text-xs tracking-label text-muted">NEXT PROJECT</span>
        <Link href={`/work/${next.slug}`} className="focus-blueprint font-display text-xl font-semibold text-text-strong md:text-[28px]">
          {next.title} →
        </Link>
      </div>
    </>
  );
}
