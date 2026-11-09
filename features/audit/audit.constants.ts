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

// Shareable snapshots (Phase 3b, docs/AUDIT.md#links)
export const SNAPSHOT_TTL_DAYS = 30;
/** The same URL shared again within this window reuses the existing snapshot, so one visitor can't mint unlimited documents. */
export const SNAPSHOT_REUSE_HOURS = 24;
export const SHARE_ID_LENGTH = 10;

// Full audit (Phase 4, docs/AUDIT.md#full-audit-phase-4)
/** How long a report link works after it is generated or sent. Edit `reportExpiresAt` in Studio to end one early. */
export const REPORT_LINK_TTL_SECONDS = 30 * 24 * 60 * 60;
/** Total time the server may spend on one run (the page's `maxDuration` is 60 s). Grok gets whatever is left after the checks. */
export const REPORT_RUN_BUDGET_MS = 55_000;
/** The AI is skipped (deterministic report) if less than this remains after the checks. */
export const MIN_AI_BUDGET_MS = 10_000;
/** A run still marked "running" after this long was cut off (e.g. the function timed out), so it can be started again. */
export const REPORT_RUN_STALE_MS = 5 * 60 * 1000;
