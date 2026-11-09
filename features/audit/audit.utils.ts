import type {
  AuditCheck,
  AuditPreview,
  AuditResult,
  CategoryScores,
  Finding,
  FullFinding,
  PreviewFinding,
  SeverityCounts,
} from '@/types/audit';
import { AUDIT_CATEGORIES, MAX_AUDIT_URL_LENGTH, SEVERITY_WEIGHT } from './audit.constants';

/**
 * Turns what a visitor typed ("example.com", "https://example.com/pricing#faq") into an
 * auditable URL, or `null`. Only http(s), no credentials, no fragment. Network-level safety
 * (private IPs, ports) is enforced separately by the SSRF guard.
 */
export function normalizeAuditUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_AUDIT_URL_LENGTH) return null;

  const withScheme = hasScheme(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (url.username || url.password) return null;
  if (!url.hostname.includes('.') && !url.hostname.startsWith('[')) return null;
  url.hash = '';
  return url;
}

/** True when the visitor typed a scheme ("http://…"); otherwise https is assumed. */
export function hasScheme(input: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(input.trim());
}

/** Locked checks, and every failing critical check, hide their details until the full audit. */
export function isLocked(check: AuditCheck, status: Finding['status'], severity = check.severity): boolean {
  return status === 'fail' && (check.tier === 'locked' || severity === 'critical');
}

/** Joins check results with their catalog entries. Results for unknown checks are dropped. */
export function mergeFindings(catalog: readonly AuditCheck[], findings: readonly Finding[]): FullFinding[] {
  const byId = new Map(catalog.map((check) => [check.id, check]));
  return findings.flatMap((finding) => {
    const check = byId.get(finding.checkId);
    if (!check) return [];
    const severity = finding.severity ?? check.severity;
    return [
      {
        ...check,
        severity,
        status: finding.status,
        evidence: finding.evidence,
        isLocked: isLocked(check, finding.status, severity),
      },
    ];
  });
}

/** Per category: round(100 × passed weight ÷ total weight). A category with no checks scores 100. */
export function scoreFindings(findings: readonly FullFinding[]): CategoryScores {
  const scores = {} as CategoryScores;
  for (const category of AUDIT_CATEGORIES) {
    let total = 0;
    let passed = 0;
    for (const finding of findings) {
      if (finding.category !== category) continue;
      const weight = SEVERITY_WEIGHT[finding.severity];
      total += weight;
      if (finding.status === 'pass') passed += weight;
    }
    scores[category] = total === 0 ? 100 : Math.round((100 * passed) / total);
  }
  return scores;
}

export function countFailures(findings: readonly FullFinding[]): SeverityCounts {
  const counts: SeverityCounts = { critical: 0, warning: 0, info: 0 };
  for (const finding of findings) if (finding.status === 'fail') counts[finding.severity] += 1;
  return counts;
}

/**
 * The only shape that may leave the server for the free preview or a shared link.
 * Locked failures keep their title and severity (the hook) and lose evidence, why and fix.
 */
export function toPreview(result: AuditResult): AuditPreview {
  const findings = result.findings.map((finding): PreviewFinding => {
    if (finding.isLocked) {
      const { id, category, title, severity, status } = finding;
      return { id, category, title, severity, status, isLocked: true };
    }
    return { ...finding, isLocked: false };
  });
  return { ...result, findings };
}

export type PerformanceLevel = 'good' | 'fair' | 'poor';

export const PERFORMANCE_LEVEL_LABEL: Record<PerformanceLevel, string> = {
  good: 'Fast',
  fair: 'Needs improvement',
  poor: 'Slow',
};

/** Lighthouse's own bands: 90–100 good, 50–89 needs improvement, 0–49 poor. */
export function performanceLevel(score: number): PerformanceLevel {
  if (score >= 90) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

/** 10 URL-safe characters (see `generateShareId`). Checked before anything is looked up. */
const SHARE_ID_PATTERN = /^[A-Za-z0-9_-]{10}$/;

export function isValidShareId(value: string): boolean {
  return SHARE_ID_PATTERN.test(value);
}

/** True once an ISO timestamp is in the past. An unparseable date counts as expired, so a corrupted snapshot never stays open. */
export function isExpired(expiresAtIso: string, now: number = Date.now()): boolean {
  const expiresAt = Date.parse(expiresAtIso);
  return Number.isNaN(expiresAt) || expiresAt <= now;
}
