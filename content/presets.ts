import type { Blueprint, Feature, RoadmapPhase, StackRow } from '@/types/blueprint';
import { ARCHETYPE_PROOF, ARCHETYPE_SUGGESTED_TECH } from './building-detail';

/** Sheet 01's idea input character limit. */
export const IDEA_MAX_LENGTH = 500;

/**
 * The 5 idea presets (Sheet 01) and their fallback blueprints.
 *
 * Every generated project is drawn from the same 5 building archetypes
 * (see docs/design-system/03-layout-and-patterns.md#default-building-layout-plane-coords).
 * Only the project name, summary and each feature's subtitle/status/why change
 * per idea — names, icons, suggested tech and proof cases stay fixed so the
 * City scene and detail panel (Sheet 04) read consistently.
 */

/** The showcased stack, in collection order. Shard N is "collected" once N buildings are live. */
export const STOCK_SHARDS = [
  'TypeScript',
  'Next.js',
  'PostgreSQL',
  'NestJS',
  'pgvector',
  'AWS',
  'Claude API',
  'React Native',
] as const;

type FeatureCopy = { subtitle: string; why: string };

function features(copy: Record<Feature['id'], FeatureCopy>, buildingPercent: number): Feature[] {
  const base: { id: Feature['id']; name: string; short: string; icon: string }[] = [
    { id: 'auth', name: 'Auth Tower', short: 'Auth', icon: 'lock-keyhole' },
    { id: 'pay', name: 'Payments Bank', short: 'Payments', icon: 'landmark' },
    { id: 'ai', name: 'AI Brain', short: 'AI Brain', icon: 'brain' },
    { id: 'shop', name: 'Marketplace', short: 'Market', icon: 'store' },
    { id: 'notif', name: 'Notification Antenna', short: 'Notify', icon: 'radio-tower' },
  ];

  return base.map(({ id, name, short, icon }, i) => ({
    id,
    name,
    short,
    icon,
    subtitle: copy[id].subtitle,
    status: i < 2 ? 'live' : i === 2 ? 'building' : 'blueprint',
    percent: i === 2 ? buildingPercent : undefined,
    detail: {
      why: copy[id].why,
      suggestedTech: ARCHETYPE_SUGGESTED_TECH[id],
      proof: ARCHETYPE_PROOF[id].proof,
    },
  }));
}

export type Preset = {
  id: string;
  /** Preset chip label (Sheet 01). */
  label: string;
  /** Lucide icon name for the chip. */
  icon: string;
  /** Idea text typed into the input when the chip is tapped. */
  ideaText: string;
  /** Lowercase keywords used to match a visitor's own idea to this preset. */
  keywords: string[];
  /** 3 techs shown in the generating log's "Selecting stack…" line. */
  stackLine: string[];
  /** "Matching shipped projects… N proofs" in the generating log. */
  proofsCount: number;
  blueprint: Blueprint;
};

const ROADMAP_STYLE_HINT = ['MVP', 'v1', 'Scale'] as const;

function roadmap(items: [string, string, string]): RoadmapPhase[] {
  return ROADMAP_STYLE_HINT.map((phase, i) => ({ phase, items: items[i] }));
}

export const PRESETS: Preset[] = [
  {
    id: 'saas-marketplace',
    label: 'SaaS Marketplace',
    icon: 'store',
    ideaText: 'A marketplace where creators bid on brand campaigns',
    keywords: ['marketplace', 'bid', 'bidding', 'creator', 'creators', 'campaign', 'campaigns', 'two-sided', 'escrow'],
    stackLine: ['Next.js', 'NestJS', 'Postgres'],
    proofsCount: 4,
    blueprint: {
      projectName: 'CreatorBid',
      summary:
        'A two-sided marketplace where creators bid on brand campaigns, with escrow payments and AI matching between brands and creators.',
      features: features(
        {
          auth: { subtitle: 'Sign-up, roles, sessions', why: 'Brands and creators need separate roles, verified profiles and secure sessions before any money or campaign data changes hands.' },
          pay: { subtitle: 'Escrow & creator payouts', why: 'Brands need to know funds are held safely until work is approved, and creators need predictable, fast payouts once it is.' },
          ai: { subtitle: 'Creator ↔ campaign matching', why: "Brands shouldn't scroll through thousands of creators. Embeddings rank creators by audience, tone and past campaigns, and an LLM writes a short reason for every match so brands can decide fast." },
          shop: { subtitle: 'Campaigns, bids, offers', why: 'The core marketplace loop: brands post campaigns, creators bid, and both sides negotiate terms before work begins.' },
          notif: { subtitle: 'Email, push, in-app', why: 'Bids expire and offers get countered in hours, not days — creators and brands need to know the moment something moves.' },
        },
        52,
      ),
      shards: [...STOCK_SHARDS],
      roadmap: roadmap([
        'Auth, campaign posting, bidding, Stripe escrow, email alerts',
        'AI creator matching, in-app chat, push notifications, analytics',
        'React Native app, payouts in more regions, queue sharding',
      ]),
      stackTable: stackTable('Next.js · TypeScript', 'NestJS · BullMQ', 'PostgreSQL · pgvector', 'Claude API', 'AWS', 'React Native (Scale)'),
    },
  },
  {
    id: 'ai-chatbot',
    label: 'AI Chatbot',
    icon: 'bot',
    ideaText: 'An AI chatbot that answers customer support questions from our docs and order history',
    keywords: ['chatbot', 'bot', 'support', 'customer', 'faq', 'rag', 'assistant'],
    stackLine: ['Next.js', 'NestJS', 'pgvector'],
    proofsCount: 3,
    blueprint: {
      projectName: 'SupportPilot',
      summary:
        'An AI chatbot that answers customer support questions by combining your docs with live order history, and hands off to a human when it is unsure.',
      features: features(
        {
          auth: { subtitle: 'Sign-up, team roles, sessions', why: 'Support teams need their own logins and permissions, separate from the customers the bot is actually answering.' },
          pay: { subtitle: 'Plan billing & usage limits', why: 'Usage-based pricing means metering conversations per plan and billing teams automatically as they grow.' },
          ai: { subtitle: 'RAG answers over docs & orders', why: 'Customers ask in their own words. Retrieval over your docs and live order data lets the bot answer specifically, not generically, and cite where it got the answer.' },
          shop: { subtitle: 'Saved replies & ticket queue', why: 'When the bot hands off, agents need the full conversation, saved replies and a queue — not a cold start.' },
          notif: { subtitle: 'Email & Slack alerts', why: 'A customer waiting on a human handoff should never wait in silence — agents get pinged the moment one is needed.' },
        },
        61,
      ),
      shards: [...STOCK_SHARDS],
      roadmap: roadmap([
        'Auth, docs ingestion, RAG answers, saved replies, email handoff',
        'Order-data lookups, Slack alerts, sentiment escalation, analytics',
        'Multi-language support, voice channel, usage-based billing at scale',
      ]),
      stackTable: stackTable('Next.js · TypeScript', 'NestJS · BullMQ', 'PostgreSQL · pgvector', 'Claude API', 'AWS', 'React Native (Scale)'),
    },
  },
  {
    id: 'booking-app',
    label: 'Booking App',
    icon: 'calendar-check',
    ideaText: 'A booking app for appointment-based businesses like salons and clinics',
    keywords: ['booking', 'appointment', 'appointments', 'salon', 'clinic', 'schedule', 'scheduling'],
    stackLine: ['Next.js', 'NestJS', 'Postgres'],
    proofsCount: 3,
    blueprint: {
      projectName: 'SlotWise',
      summary:
        'A booking app for appointment-based businesses, with staff calendars, deposits and reminders that cut no-shows.',
      features: features(
        {
          auth: { subtitle: 'Staff & client accounts', why: 'Staff need calendars and permissions; clients just need to book — two different accounts sharing one schedule.' },
          pay: { subtitle: 'Deposits & no-show fees', why: 'A small deposit at booking time is what actually cuts no-shows, so payments have to happen before the slot is held.' },
          ai: { subtitle: 'Smart scheduling suggestions', why: 'Instead of a blank calendar grid, the assistant suggests times that fit the client’s request and the business’s gaps.' },
          shop: { subtitle: 'Services, slots & packages', why: 'The business needs to define services, durations and package deals once, and have slots generate themselves.' },
          notif: { subtitle: 'SMS & email reminders', why: 'Reminders sent the day before and the hour before are the single biggest lever on reducing no-shows.' },
        },
        45,
      ),
      shards: [...STOCK_SHARDS],
      roadmap: roadmap([
        'Auth, service catalog, calendar booking, Stripe deposits, reminders',
        'Smart scheduling suggestions, staff payroll exports, analytics',
        'Multi-location support, loyalty packages, native mobile app',
      ]),
      stackTable: stackTable('Next.js · TypeScript', 'NestJS · BullMQ', 'PostgreSQL', 'Claude API', 'AWS', 'React Native (Scale)'),
    },
  },
  {
    id: 'fintech-dashboard',
    label: 'Fintech Dashboard',
    icon: 'wallet',
    ideaText: 'A dashboard that gives small businesses a live view of cash flow across accounts',
    keywords: ['fintech', 'finance', 'dashboard', 'cash', 'cashflow', 'accounting', 'bank', 'banking'],
    stackLine: ['Next.js', 'NestJS', 'Postgres'],
    proofsCount: 3,
    blueprint: {
      projectName: 'LedgerView',
      summary:
        'A dashboard that gives small businesses a live view of cash flow across every connected account, with forecasts and low-balance alerts.',
      features: features(
        {
          auth: { subtitle: 'Owner & accountant roles', why: 'An owner and their accountant need different levels of access to the same numbers, with a clear audit trail.' },
          pay: { subtitle: 'Bank & card account sync', why: 'The dashboard is only as good as its data — every connected bank and card account needs to sync reliably, every day.' },
          ai: { subtitle: 'Cash-flow forecasting', why: 'Raw transactions don’t answer "can I make payroll next month?" — a forecast model turns history into a real answer.' },
          shop: { subtitle: 'Transactions & categories', why: 'Every transaction needs a category to be useful, and most of that categorizing should happen automatically.' },
          notif: { subtitle: 'Low-balance alerts', why: 'An overdraft is the one thing a business owner needs to know about before it happens, not after.' },
        },
        38,
      ),
      shards: [...STOCK_SHARDS],
      roadmap: roadmap([
        'Auth, bank sync, transaction feed, categorization, low-balance alerts',
        'Cash-flow forecasting, accountant seats, exportable reports',
        'Multi-entity support, bill pay, native mobile app',
      ]),
      stackTable: stackTable('Next.js · TypeScript', 'NestJS · BullMQ', 'PostgreSQL', 'Claude API', 'AWS', 'React Native (Scale)'),
    },
  },
  {
    id: 'mobile-app',
    label: 'Mobile App',
    icon: 'smartphone',
    ideaText: 'A mobile app that helps hikers plan routes and share trail conditions',
    keywords: ['mobile', 'app', 'hiker', 'hiking', 'trail', 'trails', 'outdoors'],
    stackLine: ['React Native', 'NestJS', 'Postgres'],
    proofsCount: 2,
    blueprint: {
      projectName: 'TrailMate',
      summary:
        'A mobile app that helps hikers plan routes and share live trail conditions, with offline maps for when there is no signal.',
      features: features(
        {
          auth: { subtitle: 'Hiker profiles & sessions', why: 'Saved routes, gear lists and posted conditions all need to be tied to a profile that works offline and syncs later.' },
          pay: { subtitle: 'Premium maps subscription', why: 'Offline topo maps and route planning are the premium tier — billing has to work even when the phone has no signal to confirm it.' },
          ai: { subtitle: 'Route difficulty & condition summaries', why: 'Dozens of trip reports don’t help at a trailhead — a short, current summary of difficulty and conditions does.' },
          shop: { subtitle: 'Trail listings & reviews', why: 'Every trail needs a canonical listing that trip reports, photos and reviews attach to.' },
          notif: { subtitle: 'Weather & condition alerts', why: 'A storm warning or a reported washout needs to reach hikers with that trail saved, before they leave the trailhead.' },
        },
        57,
      ),
      shards: [...STOCK_SHARDS],
      roadmap: roadmap([
        'Auth, trail listings, offline maps, route planning, condition posts',
        'Premium subscriptions, weather alerts, AI condition summaries',
        'Social trip reports, gear marketplace, Scale for multi-region tiles',
      ]),
      stackTable: stackTable('React Native · TypeScript', 'NestJS · BullMQ', 'PostgreSQL', 'Claude API', 'AWS', 'React Native'),
    },
  },
];

function stackTable(web: string, api: string, data: string, ai: string, infra: string, mobile: string): StackRow[] {
  return [
    { k: 'WEB', v: web },
    { k: 'API', v: api },
    { k: 'DATA', v: data },
    { k: 'AI', v: ai },
    { k: 'INFRA', v: infra },
    { k: 'MOBILE', v: mobile },
  ];
}
