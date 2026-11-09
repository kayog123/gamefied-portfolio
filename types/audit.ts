export type AuditCategory = 'seo' | 'security' | 'maintainability';

export type Severity = 'critical' | 'warning' | 'info';

/** `open` checks show full detail in the free preview; `locked` ones only after a full audit. */
export type CheckTier = 'open' | 'locked';

export type CheckStatus = 'pass' | 'fail';

/** One entry of the check catalog (`content/audit-checks.ts`). */
export type AuditCheck = {
  id: string;
  category: AuditCategory;
  title: string;
  severity: Severity;
  tier: CheckTier;
  /** Why it matters, in plain words. */
  why: string;
  /** How to fix it. */
  fix: string;
};

/** A check's result for one site. `evidence` is site-specific detail ("Title is 92 characters"). */
export type Finding = {
  checkId: string;
  status: CheckStatus;
  evidence?: string;
  /** Overrides the catalog severity when the problem is worse/milder than usual (e.g. missing vs too long). */
  severity?: Severity;
};

export type FullFinding = AuditCheck & {
  status: CheckStatus;
  evidence?: string;
  isLocked: boolean;
};

/** What the free preview may show. Locked failures carry no evidence, why or fix. */
export type PreviewFinding =
  | (Omit<FullFinding, 'isLocked'> & { isLocked: false })
  | (Pick<FullFinding, 'id' | 'category' | 'title' | 'severity' | 'status'> & { isLocked: true });

export type SeverityCounts = Record<Severity, number>;

export type CategoryScores = Record<AuditCategory, number>;

export type AuditResult = {
  url: string;
  finalUrl: string;
  auditedAt: string;
  scores: CategoryScores;
  /** Failing checks by severity. */
  counts: SeverityCounts;
  findings: FullFinding[];
};

export type AuditPreview = Omit<AuditResult, 'findings'> & {
  findings: PreviewFinding[];
};

/** Lab metrics from a mobile Lighthouse run (PageSpeed Insights). */
export type PerformanceMetrics = {
  /** Largest Contentful Paint, ms. */
  lcpMs: number;
  /** Cumulative Layout Shift, unitless. */
  cls: number;
  /** Total Blocking Time, ms. */
  tbtMs: number;
};

/** The open part of a PageSpeed result: the score and headline numbers. Root causes stay in the full audit. */
export type PerformanceResult = {
  /** Lighthouse performance score, 0–100. */
  score: number;
  strategy: 'mobile';
  metrics: PerformanceMetrics;
  measuredAt: string;
};
