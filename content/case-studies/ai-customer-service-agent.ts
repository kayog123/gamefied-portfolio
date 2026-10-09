import type { CaseStudy } from './case-study.types';

export const aiCustomerServiceAgent: CaseStudy = {
  slug: 'ai-customer-service-agent',
  lead: 'An AI support agent that answers customer questions using live order and subscription data, so customers get the same answer a human agent would — immediately.',
  meta: { role: 'Full-stack + AI engineering', stack: 'NestJS · pgvector · Claude API · Shopify', timeline: '[x weeks]', type: 'Client project' },
  problem:
    "Support teams were buried in the same handful of questions — where's my order, why was I charged, how do I pause my subscription — spread across email, chat and social. Every answer meant opening three different dashboards to piece together one customer's history.",
  architecture: [
    { name: 'Customer message', tech: 'email · chat' },
    { name: 'NestJS API', tech: 'auth · routing' },
    { name: 'Shopify + Recharge', tech: 'orders · subscriptions' },
    { name: 'Embed + retrieve', tech: 'pgvector' },
    { name: 'Claude API', tech: 'drafts the reply', accent: true },
    { name: 'Reply or handoff', tech: 'agent review' },
  ],
  decisions: [
    {
      title: 'Retrieve live order data, not just docs',
      why: "A generic FAQ bot can't tell a customer why their charge happened. Each reply pulls that customer's real orders and subscription state before drafting an answer.",
      cost: "Every reply needs a live Shopify/Recharge lookup, adding latency the docs-only version didn't have.",
    },
    {
      title: 'Draft-then-send, not auto-send',
      why: 'Billing questions are high-stakes. Claude drafts a reply and a cited reason; an agent approves or edits before anything reaches the customer.',
      cost: 'Caps how much the bot can fully automate — it speeds up agents rather than replacing the queue.',
    },
    {
      title: 'One retrieval pipeline for docs and order data',
      why: "Policies and a customer's own order history are embedded into the same pgvector store, so one retrieval step finds whichever is relevant.",
      cost: 'Order data changes constantly, so embeddings need refreshing far more often than static docs do.',
    },
  ],
  stack: [
    { name: 'NestJS', role: 'API + orchestration' },
    { name: 'pgvector', role: 'Docs & order-data retrieval' },
    { name: 'Claude API', role: 'Drafts grounded replies' },
    { name: 'Shopify + Recharge', role: 'Orders & subscriptions' },
  ],
  results: [
    { metric: '[metric]', description: 'First-response time, before vs after.' },
    { metric: '[metric]', description: 'Replies sent without an edit.' },
    { metric: '[metric]', description: 'Tickets resolved without escalation.' },
  ],
};
