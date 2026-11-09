import 'server-only';
import { createClient } from 'next-sanity';
import type { AuditRequestRecord, AuditRequestStatus, PreviewSummary } from '../audit.types';

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
};

const FIELDS = '_id, _createdAt, url, domain, name, email, message, status, previewSummary';

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
  };
}

export type NewAuditRequest = {
  url: string;
  domain: string;
  name: string;
  email: string;
  message: string;
  previewSummary: PreviewSummary | null;
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
    '*[_type == "auditRequest" && status == "pending" && email == $email && domain == $domain][0]._id',
    { email: email.toLowerCase(), domain },
  );
  return found !== null;
}

export async function getAuditRequest(id: string): Promise<AuditRequestRecord | null> {
  if (!client) return null;
  const doc = await client.fetch<RequestDoc | null>(`*[_type == "auditRequest" && _id == $id][0]{ ${FIELDS} }`, { id });
  return doc ? toRecord(doc) : null;
}

export async function setAuditRequestStatus(id: string, status: AuditRequestStatus): Promise<void> {
  if (!client) throw new Error('Audit store is not configured.');
  await client.patch(id).set({ status }).commit();
}
