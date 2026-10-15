/**
 * Site-wide constants that don't belong to one feature.
 *
 * BOOK_A_CALL_URL is the Calendly event link (set `NEXT_PUBLIC_CALENDLY_URL`,
 * e.g. https://calendly.com/<you>/intro-call). Falls back to the contact form
 * until it is set. The "book at least 1 day ahead" rule is Calendly's
 * "Minimum scheduling notice = 1 day" setting on the event type.
 */
export const BOOK_A_CALL_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || '/work#contact';

/**
 * TODO(docs/SEO-GEO-AEO.md#open-decisions): set `NEXT_PUBLIC_SITE_URL` once a
 * production domain is chosen (needed for a correct sitemap and canonical URLs).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Public contact points (Sheet 07 contact section, WebSite JSON-LD `sameAs`). */
export const SOCIAL_LINKS = {
  linkedin: 'https://www.linkedin.com/in/jovanni-jungco/',
  instagram: 'https://www.instagram.com/ivann.jov.07/',
  email: 'jovannijungco27@gmail.com',
};
