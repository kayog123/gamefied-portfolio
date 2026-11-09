import { NextResponse } from 'next/server';
import { z } from 'zod';
import { MAX_AUDIT_URL_LENGTH, normalizeAuditUrl } from '@/features/audit';
import { runPageSpeed } from '@/features/audit/server/pagespeed';
import { SigningUnavailableError, verifyScanTicket } from '@/features/audit/server/signing';

/** PageSpeed itself can take up to ~50 s. */
export const maxDuration = 60;

const requestSchema = z.object({
  url: z.string().trim().min(1).max(MAX_AUDIT_URL_LENGTH),
  /** From `/api/audit/preview`: proof that this URL's scan passed the bot check. */
  ticket: z.string().max(256),
});

const FAILURE = {
  blocked: { status: 400, error: 'That address can’t be measured.' },
  quota: { status: 503, error: 'Speed measurement is busy right now. Try again later.' },
  unavailable: { status: 502, error: 'Couldn’t measure speed for this site right now.' },
} as const;

/**
 * POST /api/audit/performance — mobile PageSpeed score for the audit's 4th card (docs/AUDIT.md).
 * Separate from /preview because it's slow (10–30 s) and uses an external quota; the page shows the
 * rest of the results first. Needs the ticket from /preview, so it can't be hit directly. No AI tokens.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Run the audit first, then measure speed.' }, { status: 400 });
  const url = normalizeAuditUrl(parsed.data.url);
  if (!url) return NextResponse.json({ error: 'That doesn’t look like a website address.' }, { status: 400 });

  try {
    if (!verifyScanTicket(parsed.data.url, parsed.data.ticket)) {
      return NextResponse.json({ error: 'Run the audit first, then measure speed.' }, { status: 403 });
    }
  } catch (error) {
    if (error instanceof SigningUnavailableError) {
      console.error('[audit]', error.message);
      return NextResponse.json({ error: 'Speed measurement isn’t available right now.' }, { status: 503 });
    }
    throw error;
  }

  const outcome = await runPageSpeed(url.toString());
  if (!outcome.ok) {
    const { status, error } = FAILURE[outcome.reason];
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ performance: outcome.result });
}
