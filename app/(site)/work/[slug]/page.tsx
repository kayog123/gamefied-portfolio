import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCaseStudy } from '@/content/case-studies';
import { PROJECTS } from '@/content/projects';
import { CaseStudyPage } from '@/features/case-study';

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

// All 6 known slugs prerender statically (and so navigate instantly), but an
// unknown slug takes the `notFound()` branch below, which Cache Components'
// dev-only `instant` validation can't prove ahead of time. See
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/instant.md.
export const instant = false;

export async function generateMetadata({ params }: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const entry = getCaseStudy(slug);
  if (!entry) return {};

  return {
    title: entry.project.title,
    description: entry.caseStudy.lead,
    alternates: { canonical: `/work/${slug}` },
  };
}

/** "/work/[slug]" — a case study (Sheet 08), one template for all 6 projects. */
export default async function Page({ params }: PageProps<'/work/[slug]'>) {
  const { slug } = await params;
  const entry = getCaseStudy(slug);
  if (!entry) notFound();

  return <CaseStudyPage project={entry.project} caseStudy={entry.caseStudy} />;
}
