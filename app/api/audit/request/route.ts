import { NextResponse } from 'next/server';
import { auditRequestSchema, normalizeAuditUrl } from '@/features/audit';
import { sendAuditRequestEmail } from '@/features/audit/server/audit-emails';
import { createAuditRequest, hasPendingAuditRequest, isAuditStoreConfigured } from '@/features/audit/server/audit-store';
import { runAudit, type AuditOutcome } from '@/features/audit/server/run-audit';
import { createReviewUrl } from '@/features/audit/server/signing';
import { clientIp, verifyTurnstile } from '@/features/audit/server/turnstile';
import type { PreviewSummary } from '@/features/audit/audit.types';
import { SOCIAL_LINKS } from '@/lib/site';

export const maxDuration = 30;

/** The scan is normally cached from the visitor's own run; if it isn't, don't make them wait for a full re-scan. */
const SUMMARY_TIMEOUT_MS = 8_000;

/** Our own run of the free scan (never trusted from the browser). `null` if it didn't finish in time. */
function scan(url: string): Promise<AuditOutcome | null> {
  return Promise.race([runAudit(url), new Promise<null>((resolve) => setTimeout(() => resolve(null), SUMMARY_TIMEOUT_MS))]);
}

/** Scores and counts only, so nothing locked is copied into the lead record. */
function summarize(outcome: AuditOutcome | null): PreviewSummary | null {
  if (!outcome?.ok) return null;
  const { scores, counts, findings } = outcome.result;
  return { scores, counts, lockedCount: findings.filter((finding) => finding.isLocked).length };
}

/**
 * POST /api/audit/request — "Get the full audit" (docs/AUDIT.md#flow).
 * Bot check → save as `pending` in the private dataset → email Jovanni a signed review link.
 * Each step degrades instead of failing the visitor: no store → email only; no email but stored → still a success.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = auditRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }
  const { url: rawUrl, name, email, message, turnstileToken, shareId: sharedFrom } = parsed.data;

  const target = normalizeAuditUrl(rawUrl);
  if (!target) return NextResponse.json({ error: 'That doesn’t look like a website address.' }, { status: 400 });

  const human = await verifyTurnstile(turnstileToken, clientIp(request));
  if (human === 'unconfigured') return NextResponse.json({ error: 'Requests aren’t available right now.' }, { status: 503 });
  if (human === 'failed') {
    return NextResponse.json({ error: 'The human check didn’t pass. Please reload and try again.' }, { status: 403 });
  }

  const url = target.toString();
  const domain = target.hostname;

  // Same person asking again for the same site: acknowledge without a second email.
  try {
    if (await hasPendingAuditRequest(email, domain)) return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[audit] duplicate check failed', error);
  }

  const outcome = await scan(url);
  // Private or internal addresses are never a real lead. Other failures (down, slow, not HTML) still are.
  if (outcome && !outcome.ok && outcome.reason === 'blocked') {
    return NextResponse.json({ error: outcome.message }, { status: 400 });
  }
  const previewSummary = summarize(outcome);

  let reviewUrl: string | undefined;
  let isStored = false;
  if (isAuditStoreConfigured()) {
    try {
      const id = await createAuditRequest({ url, domain, name, email, message, previewSummary, sharedFrom });
      isStored = true;
      reviewUrl = createReviewUrl(id);
    } catch (error) {
      console.error('[audit] could not store request', error);
    }
  }

  const sent = await sendAuditRequestEmail({ name, email, url, domain, message, previewSummary, reviewUrl, sharedFrom });
  if (!sent.ok && !isStored) {
    console.error('[audit] request neither stored nor emailed', sent.reason);
    return NextResponse.json(
      { error: `I couldn’t send your request. Please email me at ${SOCIAL_LINKS.email}.` },
      { status: sent.reason === 'unconfigured' ? 503 : 502 },
    );
  }
  if (!sent.ok) console.error('[audit] stored request but could not email the notification', sent.reason);

  return NextResponse.json({ received: true });
}
