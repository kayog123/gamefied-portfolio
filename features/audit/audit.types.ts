import type { CategoryScores, SeverityCounts } from '@/types/audit';

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
};
