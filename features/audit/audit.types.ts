import type { AuditPreview, CategoryScores, SeverityCounts } from '@/types/audit';

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
