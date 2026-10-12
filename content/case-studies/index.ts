import { PROJECTS } from '../projects';
import type { CaseStudy } from './case-study.types';

export type { CaseStudy, ArchitectureStep, Decision, ResultMetric } from './case-study.types';

/**
 * Written case studies (Sheet 08), keyed by project slug. A project with no
 * entry here gets the plain project page built from `content/projects.ts`.
 * Add an entry only once it describes that real project.
 */
export const CASE_STUDIES: Partial<Record<string, CaseStudy>> = {};

export function getCaseStudy(slug: string) {
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return undefined;
  return { project, caseStudy: CASE_STUDIES[slug] };
}

/** The next project in `content/projects.ts` order, wrapping to the first. */
export function getNextProject(slug: string) {
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  return PROJECTS[(index + 1) % PROJECTS.length];
}
