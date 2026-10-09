import type { CaseStudy } from './case-study.types';

export const codaComplianceTool: CaseStudy = {
  slug: 'coda-compliance-tool',
  lead:
    'An AI-assisted review tool that checks long documents against compliance rules and points reviewers to the exact clauses that need attention.',
  meta: { role: 'Full-stack + AI engineering', stack: 'NestJS · BullMQ · pgvector · Claude', timeline: '[x weeks]', type: 'Client project' },
  problem:
    'Compliance reviewers read long documents line by line against a rulebook that keeps changing. Reviews were slow, findings were inconsistent between reviewers, and there was no record of why a clause was flagged.',
  architecture: [
    { name: 'Upload UI', tech: 'documents + rulesets' },
    { name: 'NestJS API', tech: 'auth · jobs · results' },
    { name: 'BullMQ', tech: 'review queue' },
    { name: 'Workers', tech: 'parse · chunk' },
    { name: 'PostgreSQL + pgvector', tech: 'chunks · embeddings · rules' },
    { name: 'Claude API', tech: 'clause-level review', accent: true },
    { name: 'Findings report', tech: 'clause · rule · citation' },
  ],
  decisions: [
    {
      title: 'Queue every review instead of answering in-request',
      why: 'Documents can be hundreds of pages. BullMQ workers process chunks in parallel, retry failures and report progress to the UI.',
      cost: 'More moving parts: Redis, worker scaling and job-state UI.',
    },
    {
      title: 'pgvector inside Postgres, not a separate vector DB',
      why: 'Rules, documents, embeddings and findings live in one database with one backup and transactional writes.',
      cost: 'Less tuning headroom than a dedicated vector store at very large scale.',
    },
    {
      title: 'Claude reviews clause by clause, with citations',
      why: 'Small, retrieved context per clause keeps answers grounded and lets reviewers see exactly which rule triggered a flag.',
      cost: 'More API calls per document; mitigated with caching and batching.',
    },
  ],
  stack: [
    { name: 'NestJS', role: 'API + job orchestration' },
    { name: 'BullMQ', role: 'Review queue + workers' },
    { name: 'pgvector', role: 'Rule ↔ clause retrieval' },
    { name: 'Claude API', role: 'Clause-level review' },
  ],
  results: [
    { metric: '[metric]', description: 'Review time per document, before vs after.' },
    { metric: '[metric]', description: 'Share of findings accepted by reviewers.' },
    { metric: '[metric]', description: 'Documents processed per week.' },
  ],
};
