/** Public Sanity settings. Names are listed in `.env.example`; none of these are secrets. */
export const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
export const SANITY_API_VERSION = '2025-01-01';

/** Topic filter chips on `/blog`, and the options in the Studio's `topic` field. */
export const BLOG_TOPICS = ['AI agents', 'Payments', 'Maps', 'Mobile', 'Automation', 'Case notes'] as const;

/** Single-author blog: the byline isn't a Sanity document. */
export const BLOG_AUTHOR = {
  name: 'Jovanni Jungco',
  bio: 'Full-stack & AI engineer. I build products end to end: web and mobile apps, AI agents, payments, maps and automation.',
};

/** Reading speed used for the "X min read" label. */
export const WORDS_PER_MINUTE = 200;

/** Posts shown before "Show more" on `/blog`. */
export const BLOG_PAGE_SIZE = 9;

/** Cache tag shared by every Sanity read; `/api/revalidate` invalidates it on publish. */
export const BLOG_CACHE_TAG = 'blog';
