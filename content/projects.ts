/**
 * The 6 shipped projects (Sheet 07 "Shipped work" grid).
 * Each links to a full case study at `/work/[slug]` (Sheet 08).
 */
export type Project = {
  slug: string;
  /** "01"–"06" — also used as the case study's CASE number. */
  idx: string;
  kind: string;
  title: string;
  /** Placeholder label for the screenshot slot until a real one is supplied. */
  shot: string;
  problem: string;
  stack: string[];
  result: string;
};

export const PROJECTS: Project[] = [
  {
    slug: 'ai-customer-service-agent',
    idx: '01',
    kind: 'AI AGENT',
    title: 'AI Customer Service Agent',
    shot: 'screenshot — support inbox',
    problem: 'Support teams buried in repeat order and subscription questions across channels.',
    stack: ['RAG', 'Claude API', 'Shopify', 'Recharge'],
    result: 'Answers on email and chat using live order and subscription data.',
  },
  {
    slug: 'coda-compliance-tool',
    idx: '02',
    kind: 'AI / COMPLIANCE',
    title: 'CODA Compliance Tool',
    shot: 'screenshot — review dashboard',
    problem: 'Reviewers checked long documents against changing rules by hand.',
    stack: ['NestJS', 'BullMQ', 'pgvector', 'Claude API'],
    result: 'Clause-level findings, each with a cited rule.',
  },
  {
    slug: 'mapbox-fare-payment-system',
    idx: '03',
    kind: 'MAPS / PAYMENTS',
    title: 'Mapbox Fare & Payment System',
    shot: 'screenshot — fare quote map',
    problem: 'Riders needed a reliable price before booking a trip.',
    stack: ['Search Box API', 'Directions API', 'Payments'],
    result: 'Distance-based fares quoted at search time, paid in-app.',
  },
  {
    slug: 'pawpay',
    idx: '04',
    kind: 'INSURTECH',
    title: 'PawPay',
    shot: 'screenshot — claims portal',
    problem: 'Pet owners filed insurance claims by email and paper forms.',
    stack: ['Next.js', 'TypeScript', 'Auth', 'PostgreSQL'],
    result: 'Marketing site plus an authenticated claims portal.',
  },
  {
    slug: 'automated-video-pipeline',
    idx: '05',
    kind: 'AUTOMATION',
    title: 'Automated Video Pipeline',
    shot: 'screenshot — pipeline runs',
    problem: 'Producing and posting short videos took hours per clip.',
    stack: ['NestJS', 'Queue workers', 'Social APIs'],
    result: 'Render-to-publish with no manual steps.',
  },
  {
    slug: 'browser-automation-agent',
    idx: '06',
    kind: 'AI AGENT',
    title: 'Browser Automation Agent',
    shot: 'screenshot — agent session',
    problem: 'Repetitive web tasks on sites with no API to call.',
    stack: ['LLM', 'browser-use', 'Next.js', 'Vercel'],
    result: 'Agent completes multi-step tasks in a real browser.',
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
