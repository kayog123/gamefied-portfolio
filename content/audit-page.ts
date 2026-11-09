import type { AuditCategory } from '@/types/audit';

/** How well a category scored: `good` ≥ 80, `fair` ≥ 50, otherwise `attention`. */
export type ScoreLevel = 'good' | 'fair' | 'attention';

export const AUDIT_UPDATED = '2026-11-09';

/** `/audit` hero copy (server-rendered, so crawlers and AI answers can quote it). */
export const AUDIT_HERO = {
  eyebrow: 'FREE WEBSITE AUDIT',
  title: 'How healthy is your website?',
  lead: 'A free check of SEO, security and maintainability by Jovanni Jungco, a full-stack engineer. It loads your page the way a browser would, runs 30 checks and shows what to fix first. Read-only: it never logs in, changes or probes anything.',
};

export const CATEGORY_INFO: Record<AuditCategory, { label: string; question: string; blurb: string }> = {
  seo: {
    label: 'SEO',
    question: 'Can people find you?',
    blurb: 'Titles, descriptions, headings, indexing, sitemap, social previews and structured data.',
  },
  security: {
    label: 'Security',
    question: 'Is it safe to visit?',
    blurb: 'HTTPS, certificate, security headers, cookies and mixed content.',
  },
  maintainability: {
    label: 'Maintainability',
    question: 'Is it built to last?',
    blurb: 'Page weight, compression, caching, response time and outdated markup.',
  },
};

export const LEVEL_LABEL: Record<ScoreLevel, string> = {
  good: 'IN GOOD SHAPE',
  fair: 'WORTH FIXING',
  attention: 'NEEDS ATTENTION',
};

/** Plain-English verdict fragments: "Your site {strong}, but it {weak}." */
export const VERDICT_PHRASE: Record<AuditCategory, { strong: string; weak: string }> = {
  seo: { strong: 'is easy to find', weak: 'is easy to miss on Google' },
  security: { strong: 'is well protected', weak: 'is less protected than it should be' },
  maintainability: { strong: 'is built on a solid foundation', weak: 'will be harder to maintain than it should be' },
};

/** One short title + explanation per category and level, written for a non-technical reader. */
export const SUMMARY_CARDS: Record<AuditCategory, Record<ScoreLevel, { title: string; body: string }>> = {
  seo: {
    attention: {
      title: 'Harder to find and click on Google',
      body: 'Search engines get very little to work with, so your pages are harder to find and your listing looks bare. That means fewer clicks and less traffic from Google.',
    },
    fair: {
      title: 'Findable, with gaps',
      body: 'Search engines can find you, but some basics are missing. Fixing them helps your listing stand out and earns more clicks.',
    },
    good: {
      title: 'Easy for search engines to read',
      body: 'Search engines get what they need to understand and show your pages. Keep it up as your content grows.',
    },
  },
  security: {
    attention: {
      title: 'Visitors are less protected',
      body: 'Several safeguards that browsers rely on are missing. That can trigger security warnings, hurt visitor trust, and leave more room for attackers to tamper with what visitors see.',
    },
    fair: {
      title: 'The basics, with a few gaps',
      body: 'The key protections are mostly in place, but a few are missing. They are worth adding before they become a problem.',
    },
    good: {
      title: 'Well protected',
      body: 'The key protections are in place, so visitors are shielded from the most common attacks.',
    },
  },
  maintainability: {
    attention: {
      title: 'Costlier to change than it should be',
      body: 'The page is heavier or older than it should be, which makes it slower to load and costlier to update. Cleaning it up pays off with every future change.',
    },
    fair: {
      title: 'Fine, with room to tidy',
      body: 'The foundation is fine, with a few settings missing. Small fixes keep the site fast and easy to update.',
    },
    good: {
      title: 'A solid foundation',
      body: 'The page is light and quick to respond, so improvements can build on what is already there.',
    },
  },
};
