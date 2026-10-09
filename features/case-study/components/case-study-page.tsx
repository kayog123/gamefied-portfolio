import Link from 'next/link';
import { SiteTopBar } from '@/components/layout/site-top-bar';
import type { CaseStudy } from '@/content/case-studies';
import { getNextProject } from '@/content/case-studies';
import type { Project } from '@/content/projects';
import { ArchitectureDiagram } from './architecture-diagram';
import { CaseStudyMeta } from './case-study-meta';
import { DecisionCards } from './decision-cards';
import { ResultsGrid } from './results-grid';
import { SectionRow } from './section-row';
import { StackGrid } from './stack-grid';

export type CaseStudyPageProps = {
  project: Project;
  caseStudy: CaseStudy;
};

/** Sheet 08 — the case-study template, shared by all 6 projects. */
export function CaseStudyPage({ project, caseStudy }: CaseStudyPageProps) {
  const next = getNextProject(project.slug);

  return (
    <>
      <SiteTopBar variant="case-study" />

      <div className="px-5 pb-10 pt-12 md:px-40 md:pb-14 md:pt-20">
        <div className="font-mono text-xs tracking-eyebrow text-glow">
          CASE STUDY {project.idx}
          <span className="hidden md:inline"> · {project.kind}</span>
        </div>
        <h1 className="mt-3 text-balance font-display text-[38px] font-semibold leading-[1.02] tracking-[-0.03em] text-text-strong md:mt-4.5 md:text-[80px] md:leading-[1] md:tracking-[-0.035em]">
          {project.title}
        </h1>
        <p className="mt-4 max-w-[760px] text-pretty font-sans text-base leading-[1.6] text-muted md:mt-5 md:text-xl md:leading-[1.55]">
          {caseStudy.lead}
        </p>
        <CaseStudyMeta meta={caseStudy.meta} />
      </div>

      <div className="px-5 pb-12 md:px-40 md:pb-[72px]">
        <div
          className="grid h-[220px] place-items-center rounded-control border border-glow/40 bg-image font-mono text-xs text-muted md:h-[480px]"
          style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgb(59 130 246 / 0.07) 0 10px, transparent 10px 20px)' }}
        >
          product screenshot — {project.shot.replace('screenshot — ', '')}
        </div>
      </div>

      <SectionRow label="01 — PROBLEM">
        <p className="max-w-[760px] text-pretty font-sans text-lg leading-[1.6] text-text-soft md:text-xl">{caseStudy.problem}</p>
      </SectionRow>

      <SectionRow label="02 — ARCHITECTURE">
        <ArchitectureDiagram steps={caseStudy.architecture} />
      </SectionRow>

      <SectionRow label="03 — KEY DECISIONS & TRADE-OFFS">
        <DecisionCards decisions={caseStudy.decisions} />
      </SectionRow>

      <SectionRow label="04 — STACK">
        <StackGrid stack={caseStudy.stack} />
      </SectionRow>

      <div className="grid grid-cols-1 gap-4 px-5 pb-16 md:grid-cols-[240px_1fr] md:gap-12 md:px-40 md:pb-24">
        <div className="font-mono text-xs tracking-label text-live">05 — RESULTS</div>
        <ResultsGrid results={caseStudy.results} />
      </div>

      <div className="flex flex-col gap-2 border-t border-grid px-5 py-8 md:flex-row md:items-center md:justify-between md:px-40 md:py-10">
        <span className="font-mono text-xs tracking-label text-muted">NEXT CASE STUDY</span>
        <Link href={`/work/${next.slug}`} className="focus-blueprint font-display text-xl font-semibold text-text-strong md:text-[28px]">
          {next.title} →
        </Link>
      </div>
    </>
  );
}
