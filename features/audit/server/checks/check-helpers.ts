import 'server-only';
import type { IncomingHttpHeaders } from 'node:http';
import type { AuditCheckId } from '@/content/audit-checks';
import type { Finding, Severity } from '@/types/audit';
import type { ParsedPage } from '../parse-html';
import type { SafeResponse } from '../safe-fetch';

/** Everything the checks may look at. Checks are pure functions of this. */
export type AuditContext = {
  page: SafeResponse;
  html: ParsedPage;
  /** `null` when /robots.txt couldn't be fetched. */
  robotsTxt: SafeResponse | null;
  /** `null` when no sitemap could be fetched. */
  sitemap: SafeResponse | null;
  /** The http:// version of the URL, to see whether it upgrades to HTTPS. `null` when port 80 doesn't answer. */
  httpVersion: SafeResponse | null;
};

export type Check = (context: AuditContext) => Finding;

export function pass(checkId: AuditCheckId, evidence?: string): Finding {
  return { checkId, status: 'pass', evidence };
}

export function fail(checkId: AuditCheckId, evidence?: string, severity?: Severity): Finding {
  return { checkId, status: 'fail', evidence, severity };
}

/** A response header as one string (repeated headers joined with ", "). */
export function getHeader(headers: IncomingHttpHeaders, name: string): string | undefined {
  const value = headers[name.toLowerCase()];
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value.join(', ') : String(value);
}

export function isHttpsUrl(url: string): boolean {
  return url.startsWith('https://');
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** "a, b and 3 more" — keeps evidence short. */
export function listSome(items: readonly string[], max = 3): string {
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  return rest > 0 ? `${shown.join(', ')} and ${rest} more` : shown.join(', ');
}
