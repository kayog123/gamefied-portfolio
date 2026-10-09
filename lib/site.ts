/**
 * Site-wide constants that don't belong to one feature.
 * TODO(docs/PACKAGES.md#open-decisions): swap BOOK_A_CALL_URL for a real
 * scheduling link (Cal.com/Calendly) once one is chosen.
 */
export const BOOK_A_CALL_URL = '/work#contact';

/**
 * TODO(docs/SEO-GEO-AEO.md#open-decisions): set `NEXT_PUBLIC_SITE_URL` once a
 * production domain is chosen (needed for a correct sitemap and canonical URLs).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * Social links (Sheet 07 contact section). Left unset on purpose — the real
 * GitHub/LinkedIn URLs and public contact email are an open question (see
 * docs/GOALS.md#open-questions and docs/SEO-GEO-AEO.md#open-decisions), and
 * none should be invented or filled with the operator's private account email.
 */
export const SOCIAL_LINKS = {
  github: undefined as string | undefined,
  linkedin: undefined as string | undefined,
  email: undefined as string | undefined,
};
