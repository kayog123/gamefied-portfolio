export type ArchitectureStep = {
  name: string;
  tech: string;
  /** Highlights this case study's standout step (green), as CODA's Claude step does. */
  accent?: boolean;
};

export type Decision = {
  title: string;
  why: string;
  cost: string;
};

export type ResultMetric = {
  /** Kept as the literal "[metric]" until real numbers exist — docs/GOALS.md#quality-bar. */
  metric: string;
  description: string;
};

/**
 * One case study's full write-up (Sheet 08). `slug`/`idx`/`kind`/`title`/
 * `problem` (short)/`stack` (chips) come from the matching `content/projects.ts`
 * entry — this only holds what the case-study page adds beyond the card.
 */
export type CaseStudy = {
  slug: string;
  lead: string;
  meta: { role: string; stack: string; timeline: string; type: string };
  problem: string;
  architecture: ArchitectureStep[];
  decisions: [Decision, Decision, Decision];
  stack: { name: string; role: string }[];
  results: [ResultMetric, ResultMetric, ResultMetric];
};
