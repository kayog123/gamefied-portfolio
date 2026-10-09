import type { BuildingId, FeatureDetail } from '@/types/blueprint';
import { getProject } from './projects';

/**
 * Per-archetype detail content (Sheet 04): suggested tech and a proof case.
 * Shared across every preset — a real business reuses the same handful of
 * shipped projects as proof no matter which idea a visitor types in.
 *
 * Proof cases are derived from `content/projects.ts`, so the detail panel
 * and the "Read case study →" destination can never drift apart. `why` text
 * is preset-specific — see `features()` in `content/presets.ts`.
 */

export const ARCHETYPE_SUGGESTED_TECH: Record<BuildingId, string[]> = {
  auth: ['NextAuth', 'JWT', 'PostgreSQL', 'Resend'],
  pay: ['Stripe', 'Stripe Connect', 'Webhooks', 'PostgreSQL'],
  ai: ['Claude API', 'pgvector', 'PostgreSQL', 'BullMQ'],
  shop: ['PostgreSQL', 'Next.js', 'Search', 'Redis'],
  notif: ['Resend', 'Web Push', 'BullMQ', 'Twilio'],
};

/** Which project is each archetype's proof. */
const ARCHETYPE_PROJECT_SLUG: Record<BuildingId, string> = {
  auth: 'nexus-odm',
  pay: 'filipina-dating-app',
  ai: 'set-dialer',
  shop: 'livelihood-mobile-app',
  notif: 'behold-bohol-trip',
};

function buildArchetypeProof(): Record<BuildingId, Pick<FeatureDetail, 'proof'>> {
  const entries = Object.entries(ARCHETYPE_PROJECT_SLUG) as [BuildingId, string][];
  return Object.fromEntries(
    entries.map(([buildingId, slug]) => {
      const project = getProject(slug)!;
      return [
        buildingId,
        {
          proof: {
            caseNo: `CASE ${project.idx}`,
            title: project.title,
            problem: project.problem,
            stack: project.stack,
            href: `/work/${project.slug}`,
          },
        },
      ];
    }),
  ) as Record<BuildingId, Pick<FeatureDetail, 'proof'>>;
}

export const ARCHETYPE_PROOF = buildArchetypeProof();
