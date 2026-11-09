import 'server-only';
import { createClient } from 'next-sanity';
import type { AuditPreview } from '@/types/audit';
import type { AuditRequestRecord, AuditRequestStatus, AuditSnapshotRecord, FullAuditReport, PreviewSummary } from '../audit.types';
import { isRunStale } from '../audit.utils';
import {
  CLAIM_RUN_QUERY,
  PENDING_REQUEST_QUERY,
  RECENT_SNAPSHOT_QUERY,
  REPORT_BY_ID_QUERY,
  REQUEST_BY_ID_QUERY,
  SNAPSHOT_BY_ID_QUERY,
} from './audit-queries';
import { parseReportJson } from './report-schema';
import { parsePreviewJson } from './snapshot-schema';

/**
 * Private Sanity dataset for audit requests (docs/AUDIT.md#data-sanity-private-dataset-audits).
 * It holds emails, so it must be a PRIVATE dataset, separate from the blog's, written with a
 * server-only token. `null` until all three env vars are set; callers then fall back to email only.
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_AUDIT_DATASET ?? 'audits';
const token = process.env.SANITY_AUDIT_TOKEN;

const client =
  projectId && token
    ? createClient({ projectId, dataset, apiVersion: '2025-01-01', token, useCdn: false, perspective: 'raw' })
    : null;

export function isAuditStoreConfigured(): boolean {
  return client !== null;
}

type RequestDoc = {
  _id: string;
  _createdAt: string;
  url: string;
  domain: string;
  name: string;
  email: string;
  message?: string;
  status: AuditRequestStatus;
  previewSummary?: PreviewSummary | null;
  sharedFrom?: string;
  reportGeneratedAt?: string;
  reportModel?: string;
  reportUsedAi?: boolean;
  tokensUsed?: number;
  reportExpiresAt?: string;
  sentAt?: string;
  sendError?: string;
  reportError?: string;
  reportStartedAt?: string;
};

function toRecord(doc: RequestDoc): AuditRequestRecord {
  return {
    id: doc._id,
    createdAt: doc._createdAt,
    url: doc.url,
    domain: doc.domain,
    name: doc.name,
    email: doc.email,
    message: doc.message ?? '',
    status: doc.status,
    previewSummary: doc.previewSummary ?? null,
    sharedFrom: doc.sharedFrom ?? null,
    report: doc.reportGeneratedAt
      ? {
          generatedAt: doc.reportGeneratedAt,
          usedAi: doc.reportUsedAi ?? false,
          model: doc.reportModel ?? null,
          tokensUsed: doc.tokensUsed ?? null,
          expiresAt: doc.reportExpiresAt ?? null,
          sentAt: doc.sentAt ?? null,
          sendError: doc.sendError ?? null,
        }
      : null,
    reportError: doc.reportError ?? null,
    runStartedAt: doc.reportStartedAt ?? null,
  };
}

export type NewAuditRequest = {
  url: string;
  domain: string;
  name: string;
  email: string;
  message: string;
  previewSummary: PreviewSummary | null;
  /** Share ID of the shared audit they came from, if any. */
  sharedFrom?: string;
};

/** Saves a request as `pending`. Throws if the store isn't configured or Sanity rejects the write. */
export async function createAuditRequest(input: NewAuditRequest): Promise<string> {
  if (!client) throw new Error('Audit store is not configured.');
  const doc = await client.create({
    _type: 'auditRequest',
    ...input,
    // Lowercased so the duplicate check in `hasPendingAuditRequest` matches however it was typed.
    email: input.email.toLowerCase(),
    // The form's consent checkbox is required, so a stored request always has it.
    consent: true,
    status: 'pending' satisfies AuditRequestStatus,
  });
  return doc._id;
}

/** True when this email already has a pending request for this domain (so a double-submit doesn't email twice). */
export async function hasPendingAuditRequest(email: string, domain: string): Promise<boolean> {
  if (!client) return false;
  const found = await client.fetch<string | null>(
    PENDING_REQUEST_QUERY,
    { email: email.toLowerCase(), domain },
  );
  return found !== null;
}

export async function getAuditRequest(id: string): Promise<AuditRequestRecord | null> {
  if (!client) return null;
  const doc = await client.fetch<RequestDoc | null>(REQUEST_BY_ID_QUERY, { id });
  return doc ? toRecord(doc) : null;
}

export async function setAuditRequestStatus(id: string, status: AuditRequestStatus): Promise<void> {
  if (!client) throw new Error('Audit store is not configured.');
  await client.patch(id).set({ status }).commit();
}

// ── Shared audits (auditSnapshot) ───────────────────────────────────────────

type SnapshotDoc = {
  shareId: string;
  url: string;
  domain: string;
  _createdAt: string;
  expiresAt: string;
  preparedFor?: string;
  views?: number;
  previewJson?: string;
};

const snapshotId = (shareId: string) => `auditSnapshot-${shareId}`;

export type NewSnapshot = { shareId: string; url: string; domain: string; expiresAt: string; preview: AuditPreview };

/** Stores the PUBLIC preview projection of a scan under an unguessable ID. Throws if the store isn't configured. */
export async function createSnapshot({ shareId, url, domain, expiresAt, preview }: NewSnapshot): Promise<void> {
  if (!client) throw new Error('Audit store is not configured.');
  await client.create({
    _id: snapshotId(shareId),
    _type: 'auditSnapshot',
    shareId,
    url,
    domain,
    expiresAt,
    views: 0,
    // A JSON string, not nested fields: it is read back through a strict zod schema, never trusted as-is.
    previewJson: JSON.stringify(preview),
  });
}

/** A still-valid snapshot of this exact URL created since `sinceIso`, so re-sharing doesn't create duplicates. */
export async function findRecentSnapshot(url: string, sinceIso: string, nowIso: string): Promise<{ shareId: string; expiresAt: string } | null> {
  if (!client) return null;
  return client.fetch<{ shareId: string; expiresAt: string } | null>(RECENT_SNAPSHOT_QUERY, { url, since: sinceIso, now: nowIso });
}

/** `null` when it doesn't exist or its stored preview isn't valid. Expiry is the caller's decision (an expired link gets its own page). */
export async function getSnapshot(shareId: string): Promise<AuditSnapshotRecord | null> {
  if (!client) return null;
  const doc = await client.fetch<SnapshotDoc | null>(SNAPSHOT_BY_ID_QUERY, { id: snapshotId(shareId) });
  if (!doc) return null;
  const preview = parsePreviewJson(doc.previewJson);
  if (!preview) return null;
  return {
    shareId: doc.shareId,
    url: doc.url,
    domain: doc.domain,
    createdAt: doc._createdAt,
    expiresAt: doc.expiresAt,
    preparedFor: doc.preparedFor?.trim() || null,
    views: doc.views ?? 0,
    preview,
  };
}

/** Counts one view atomically. The returned `views` is 1 for exactly one caller, which is how "first open" is detected. */
export async function recordSnapshotView(shareId: string): Promise<{ views: number; domain: string; preparedFor: string | null } | null> {
  if (!client) return null;
  const doc = await client
    .patch(snapshotId(shareId))
    .setIfMissing({ views: 0 })
    .inc({ views: 1 })
    .set({ lastViewedAt: new Date().toISOString() })
    .commit<{ views: number; domain: string; preparedFor?: string }>();
  return { views: doc.views, domain: doc.domain, preparedFor: doc.preparedFor?.trim() || null };
}

// ── Full audit reports (on the auditRequest document) ───────────────────────

/**
 * Takes the "right to run" for a request, or returns false if another run already holds it. A compare-and-set on
 * the document's revision, so two clicks (or two tabs) can't start two runs and spend the AI twice. A run that
 * has been "running" for over five minutes was cut off, so it can be started again.
 */
export async function claimReportRun(id: string, now: number = Date.now()): Promise<boolean> {
  if (!client) return false;
  const doc = await client.fetch<{ _rev: string; status: AuditRequestStatus; reportStartedAt?: string } | null>(CLAIM_RUN_QUERY, { id });
  if (!doc) return false;
  if (doc.status === 'running' && !isRunStale(doc.reportStartedAt, now)) return false;

  try {
    await client
      .patch(id)
      .ifRevisionId(doc._rev)
      .set({ status: 'running' satisfies AuditRequestStatus, reportStartedAt: new Date(now).toISOString() })
      .unset(['reportError'])
      .commit();
    return true;
  } catch {
    // The revision changed under us: someone else got there first.
    return false;
  }
}

export type SavedReport = {
  report: FullAuditReport;
  usedAi: boolean;
  tokensUsed: number | null;
  /** After this the report link stops working. */
  expiresAt: string;
};

/** Stores a finished report and marks the request completed. Replaces any earlier report. */
export async function saveReport(id: string, { report, usedAi, tokensUsed, expiresAt }: SavedReport): Promise<void> {
  if (!client) throw new Error('Audit store is not configured.');
  await client
    .patch(id)
    .set({
      status: 'completed' satisfies AuditRequestStatus,
      reportJson: JSON.stringify(report),
      reportGeneratedAt: report.generatedAt,
      reportUsedAi: usedAi,
      reportModel: report.model ?? '',
      reportExpiresAt: expiresAt,
      ...(tokensUsed !== null ? { tokensUsed } : {}),
    })
    .unset(['reportError', 'reportStartedAt', 'sendError'])
    .commit();
}

export async function saveReportFailure(id: string, message: string): Promise<void> {
  if (!client) throw new Error('Audit store is not configured.');
  await client.patch(id).set({ status: 'failed' satisfies AuditRequestStatus, reportError: message }).unset(['reportStartedAt']).commit();
}

export type StoredReport = {
  id: string;
  domain: string;
  name: string;
  email: string;
  report: FullAuditReport;
  expiresAt: string | null;
};

/** `null` when there is no report, or what is stored isn't a valid report (it can be edited in Studio). */
export async function getStoredReport(id: string): Promise<StoredReport | null> {
  if (!client) return null;
  const doc = await client.fetch<{ _id: string; domain: string; name: string; email: string; reportJson?: string; reportExpiresAt?: string } | null>(
    REPORT_BY_ID_QUERY,
    { id },
  );
  if (!doc) return null;
  const report = parseReportJson(doc.reportJson);
  if (!report) return null;
  return { id: doc._id, domain: doc.domain, name: doc.name, email: doc.email, report, expiresAt: doc.reportExpiresAt ?? null };
}

/** Records that the report was emailed, and restarts its link validity from now. */
export async function markReportSent(id: string, expiresAt: string): Promise<void> {
  if (!client) throw new Error('Audit store is not configured.');
  await client.patch(id).set({ sentAt: new Date().toISOString(), reportExpiresAt: expiresAt }).unset(['sendError']).commit();
}

export async function markReportSendFailed(id: string, message: string): Promise<void> {
  if (!client) throw new Error('Audit store is not configured.');
  await client.patch(id).set({ sendError: message }).commit();
}
