import type { AuditCategory, Severity } from '@/types/audit';

export const AUDIT_CATEGORIES = ['seo', 'security', 'maintainability'] as const satisfies readonly AuditCategory[];

/** Score weight of a check by severity (docs/AUDIT.md#open-vs-locked-checks). */
export const SEVERITY_WEIGHT: Record<Severity, number> = { critical: 3, warning: 2, info: 1 };

export const MAX_AUDIT_URL_LENGTH = 2048;

/** How long a preview for the same URL is reused. */
export const PREVIEW_CACHE_SECONDS = 60 * 60 * 24;

// Check thresholds
export const TITLE_LENGTH = { min: 10, max: 60 };
export const DESCRIPTION_LENGTH = { min: 50, max: 160 };
export const MAX_HTML_BYTES = 500 * 1024;
export const SLOW_RESPONSE_MS = 800;
export const CERT_EXPIRY_WARNING_DAYS = 14;
export const HSTS_MIN_MAX_AGE = 60 * 60 * 24 * 180;

// Lead capture (Phase 3, docs/AUDIT.md#links)
export const REVIEW_LINK_TTL_SECONDS = 7 * 24 * 60 * 60;
export const SCAN_TICKET_TTL_SECONDS = 15 * 60;

/** Public Cloudflare Turnstile site key. Unset means no widget (fine in development; production fails closed on the server). */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
