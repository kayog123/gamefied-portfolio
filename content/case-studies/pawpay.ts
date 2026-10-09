import type { CaseStudy } from './case-study.types';

export const pawpay: CaseStudy = {
  slug: 'pawpay',
  lead: "A marketing site and authenticated claims portal, so pet owners can file and track an insurance claim online instead of by email and paper forms.",
  meta: { role: 'Full-stack engineering', stack: 'Next.js · TypeScript · PostgreSQL', timeline: '[x weeks]', type: 'Client project' },
  problem:
    "Filing a claim meant emailing photos and a paper form, then waiting with no way to check status. Support fielded the same “where's my claim” question by phone, because there was nowhere for an owner to look it up themselves.",
  architecture: [
    { name: 'Sign up / log in', tech: 'NextAuth' },
    { name: 'File a claim', tech: 'photos · vet invoice' },
    { name: 'Claim record', tech: 'PostgreSQL', accent: true },
    { name: 'Status updates', tech: 'email' },
    { name: 'Adjuster review', tech: 'internal dashboard' },
  ],
  decisions: [
    {
      title: 'A real authenticated portal, not a form-to-email',
      why: 'Every claim becomes a record an owner can log back in and check, instead of a one-way email that disappears into an inbox.',
      cost: 'Needed real auth, sessions and account recovery — far more than a static contact form.',
    },
    {
      title: 'Structured claim data from the start',
      why: 'Vet, pet, incident and invoice details are captured as real fields, not free text, so adjusters can filter and triage claims instead of reading every email.',
      cost: 'The claim form is longer than a simple upload — worth it for what it saves adjusters later.',
    },
    {
      title: 'Status updates via email, not an in-app inbox',
      why: "Owners already check email for everything else about their pet's care; a status email meets them where they already look.",
      cost: "No in-app notification center yet, so the portal itself doesn't show a live activity feed.",
    },
  ],
  stack: [
    { name: 'Next.js', role: 'Marketing site + portal' },
    { name: 'TypeScript', role: 'End-to-end types' },
    { name: 'Auth', role: 'Owner accounts & sessions' },
    { name: 'PostgreSQL', role: 'Claims & policy data' },
  ],
  results: [
    { metric: '[metric]', description: 'Claims filed online vs by email.' },
    { metric: '[metric]', description: "“Where's my claim” support calls per week." },
    { metric: '[metric]', description: 'Time from filed to first adjuster response.' },
  ],
};
