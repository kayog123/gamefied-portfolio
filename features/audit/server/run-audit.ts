import 'server-only';
import { cacheLife } from 'next/cache';
import { AUDIT_CHECKS } from '@/content/audit-checks';
import type { AuditResult } from '@/types/audit';
import { countFailures, mergeFindings, scoreFindings } from '../audit.utils';
import type { AuditContext } from './checks/check-helpers';
import { MAINTAINABILITY_CHECKS } from './checks/maintainability-checks';
import { SECURITY_CHECKS } from './checks/security-checks';
import { SEO_CHECKS, sitemapsFromRobots } from './checks/seo-checks';
import { parseHtml } from './parse-html';
import { FetchFailedError, safeFetch, type SafeResponse } from './safe-fetch';
import { BlockedUrlError } from './ssrf-guard';

export type AuditFailureReason = 'blocked' | 'unreachable' | 'not-html';

export type AuditOutcome =
  | { ok: true; result: AuditResult }
  | { ok: false; reason: AuditFailureReason; message: string };

const ALL_CHECKS = [...SEO_CHECKS, ...SECURITY_CHECKS, ...MAINTAINABILITY_CHECKS];

/**
 * Runs every deterministic check against a normalized URL (docs/AUDIT.md). Results are cached
 * per URL for about a day, failures for about a minute. Returns the full result: only ever
 * send it to the browser through `toPreview()`.
 */
export async function runAudit(url: string): Promise<AuditOutcome> {
  'use cache';

  const outcome = await execute(url);
  // One cacheLife call per invocation: a good result is reused for about a day, a failure for seconds.
  if (outcome.ok) cacheLife('days');
  else cacheLife('seconds');
  return outcome;
}

/**
 * The same checks, never cached. The full audit uses this so the report describes the site as it is
 * when Jovanni runs it, not as it was when the visitor did the free scan.
 */
export function runAuditUncached(url: string): Promise<AuditOutcome> {
  return execute(url);
}

async function execute(url: string): Promise<AuditOutcome> {
  try {
    return { ok: true, result: await audit(new URL(url)) };
  } catch (error) {
    if (error instanceof BlockedUrlError) return { ok: false, reason: 'blocked', message: error.message };
    if (error instanceof NotHtmlError) return { ok: false, reason: 'not-html', message: error.message };
    if (error instanceof FetchFailedError) return { ok: false, reason: 'unreachable', message: error.message };
    console.error('[audit] unexpected failure', error);
    return { ok: false, reason: 'unreachable', message: 'Couldn’t audit that site.' };
  }
}

class NotHtmlError extends Error {}

async function audit(url: URL): Promise<AuditResult> {
  const page = await safeFetch(url);
  if (page.status >= 400) throw new FetchFailedError(`The site answered with an error (HTTP ${page.status}).`);
  const contentType = String(page.headers['content-type'] ?? '');
  if (contentType && !/html/i.test(contentType)) throw new NotHtmlError('That URL isn’t a web page. Try the home page.');

  const origin = new URL(page.url).origin;
  const httpUrl = new URL(url);
  httpUrl.protocol = 'http:';

  // Time budget (route maxDuration = 30 s): page ≤ 10 s + one DNS lookup (≤ 3 s), then two rounds of
  // secondary fetches at ≤ 4 s + DNS each ≈ 27 s worst case.
  const [robotsTxt, httpVersion, defaultSitemap] = await Promise.all([
    fetchOptional(new URL('/robots.txt', origin), 256 * 1024),
    url.protocol === 'http:' ? page : fetchOptional(httpUrl, 64 * 1024),
    fetchOptional(new URL('/sitemap.xml', origin), 256 * 1024),
  ]);
  const sitemap = await findSitemap(origin, robotsTxt, defaultSitemap);

  const context: AuditContext = { page, html: parseHtml(page.body), robotsTxt, sitemap, httpVersion };
  const findings = mergeFindings(
    AUDIT_CHECKS,
    ALL_CHECKS.map((check) => check(context)),
  );

  return {
    url: url.toString(),
    finalUrl: page.url,
    auditedAt: new Date().toISOString(),
    scores: scoreFindings(findings),
    counts: countFailures(findings),
    findings,
  };
}

/** Fetches a secondary resource; any failure (blocked, timeout, refused) just means "not available". */
async function fetchOptional(url: URL, maxBytes: number): Promise<SafeResponse | null> {
  try {
    return await safeFetch(url, { maxBytes, timeoutMs: 4_000 });
  } catch {
    return null;
  }
}

/** /sitemap.xml if it exists, otherwise the first sitemap listed in robots.txt (one extra fetch at most). */
async function findSitemap(
  origin: string,
  robotsTxt: SafeResponse | null,
  defaultSitemap: SafeResponse | null,
): Promise<SafeResponse | null> {
  if (defaultSitemap?.status === 200) return defaultSitemap;
  const [listed] = robotsTxt?.status === 200 ? sitemapsFromRobots(robotsTxt.body) : [];
  if (!listed) return null;
  let url: URL;
  try {
    url = new URL(listed, origin);
  } catch {
    return null;
  }
  if (url.toString() === `${origin}/sitemap.xml`) return null;
  const response = await fetchOptional(url, 256 * 1024);
  return response?.status === 200 ? response : null;
}
