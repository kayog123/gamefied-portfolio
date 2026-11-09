import type { AuditPreview, AuditResult, CategoryScores, SeverityCounts } from '@/types/audit';

/** `pending` until Jovanni acts. `running`/`completed`/`failed` belong to the full audit (Phase 4). */
export type AuditRequestStatus = 'pending' | 'running' | 'completed' | 'failed' | 'contacted' | 'declined';

/** Only scores and counts: never findings, so nothing locked is copied into the lead record. */
export type PreviewSummary = {
  scores: CategoryScores;
  counts: SeverityCounts;
  lockedCount: number;
};

/** A "Get the full audit" request as stored in the private `audits` dataset. Contains personal data: server-only. */
export type AuditRequestRecord = {
  id: string;
  createdAt: string;
  url: string;
  domain: string;
  name: string;
  email: string;
  message: string;
  status: AuditRequestStatus;
  previewSummary: PreviewSummary | null;
  /** Share ID of the shared audit they came from, if any. */
  sharedFrom: string | null;
  /** Metadata of the generated full report (never its content), or null before one exists. */
  report: ReportMeta | null;
  /** Why the last run of the full audit failed, if it did. */
  reportError: string | null;
  /** When the current run started; used to tell a live run from one that was cut off. */
  runStartedAt: string | null;
};

/** How much effort a fix takes, and how much it matters. The AI proposes these; without AI the effort is unknown (`null`). */
export type FixEffort = 'quick' | 'moderate' | 'involved';
export type FixImpact = 'high' | 'medium' | 'low';

export type FixPlanItem = {
  /** The id of a failing check in the report (`seo.title`, …). */
  findingId: string;
  action: string;
  effort: FixEffort | null;
  impact: FixImpact;
};

/** The full audit as delivered to the requester (`/audit/report/…`). Contains every finding, nothing locked. */
export type FullAuditReport = {
  generatedAt: string;
  /** The model that wrote the analysis, or null when it is the deterministic version. */
  model: string | null;
  result: AuditResult;
  /** Plain-English verdict from `buildSummary`, always present, so the report never depends on the AI. */
  headline: string;
  lead: string;
  ai: { summary: string; businessImpact: string } | null;
  /** Ordered: do the first one first. */
  plan: FixPlanItem[];
};

export type ReportMeta = {
  generatedAt: string;
  usedAi: boolean;
  model: string | null;
  tokensUsed: number | null;
  /** After this the report link stops working. Edit it in Studio to revoke early. */
  expiresAt: string | null;
  sentAt: string | null;
  /** Why the last attempt to email the requester failed, if it did. */
  sendError: string | null;
};

/** A shared audit as stored in the private `audits` dataset (`auditSnapshot`). Holds the public preview only, never full findings. */
export type AuditSnapshotRecord = {
  shareId: string;
  url: string;
  domain: string;
  createdAt: string;
  expiresAt: string;
  /** Set by Jovanni in Studio. Shown as "Prepared for …" and turns on the first-open email. */
  preparedFor: string | null;
  views: number;
  preview: AuditPreview;
};
