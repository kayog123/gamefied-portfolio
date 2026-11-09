import { NextResponse } from 'next/server';
import { z } from 'zod';
import { MAX_AUDIT_URL_LENGTH, normalizeAuditUrl, toPreview } from '@/features/audit';
import { SNAPSHOT_REUSE_HOURS, SNAPSHOT_TTL_DAYS } from '@/features/audit/audit.constants';
import { createSnapshot, findRecentSnapshot, isAuditStoreConfigured } from '@/features/audit/server/audit-store';
import { runAudit } from '@/features/audit/server/run-audit';
import { generateShareId } from '@/features/audit/server/share-id';
import { SigningUnavailableError, verifyScanTicket } from '@/features/audit/server/signing';
import { SITE_URL } from '@/lib/site';

export const maxDuration = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

const requestSchema = z.object({
  url: z.string().trim().min(1).max(MAX_AUDIT_URL_LENGTH),
  /** From `/api/audit/preview`: proof that this URL's scan passed the bot check. */
  ticket: z.string().max(256),
});

/**
 * POST /api/audit/share — turns a scan into a shareable link (docs/AUDIT.md#links).
 * The server re-runs the checks itself and stores only the public preview projection, so a visitor
 * can't publish forged scores under this domain. Needs the ticket from /preview, so each link
 * traces back to a scan that passed the bot check. The same URL shared again within a day reuses its snapshot.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Run the audit first, then share it.' }, { status: 400 });

  const target = normalizeAuditUrl(parsed.data.url);
  if (!target) return NextResponse.json({ error: 'That doesn’t look like a website address.' }, { status: 400 });

  try {
    if (!verifyScanTicket(parsed.data.url, parsed.data.ticket)) {
      return NextResponse.json({ error: 'That audit has expired. Run it again to share it.' }, { status: 403 });
    }
  } catch (error) {
    if (error instanceof SigningUnavailableError) {
      console.error('[audit]', error.message);
      return NextResponse.json({ error: 'Sharing isn’t available right now.' }, { status: 503 });
    }
    throw error;
  }

  if (!isAuditStoreConfigured()) return NextResponse.json({ error: 'Sharing isn’t available right now.' }, { status: 503 });

  const url = target.toString();
  const now = Date.now();
  const linkFor = (shareId: string) => `${SITE_URL}/audit/s/${shareId}`;

  try {
    const existing = await findRecentSnapshot(url, new Date(now - SNAPSHOT_REUSE_HOURS * 60 * 60 * 1000).toISOString(), new Date(now).toISOString());
    if (existing) return NextResponse.json({ shareId: existing.shareId, expiresAt: existing.expiresAt, link: linkFor(existing.shareId) });

    const outcome = await runAudit(url);
    if (!outcome.ok) return NextResponse.json({ error: outcome.message }, { status: 422 });

    const shareId = generateShareId();
    const expiresAt = new Date(now + SNAPSHOT_TTL_DAYS * DAY_MS).toISOString();
    await createSnapshot({ shareId, url, domain: target.hostname, expiresAt, preview: toPreview(outcome.result) });
    return NextResponse.json({ shareId, expiresAt, link: linkFor(shareId) });
  } catch (error) {
    console.error('[audit] could not create a shared audit', error);
    return NextResponse.json({ error: 'Couldn’t create the link right now. Please try again.' }, { status: 502 });
  }
}
