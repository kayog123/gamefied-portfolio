import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hasScheme, MAX_AUDIT_URL_LENGTH, normalizeAuditUrl, toPreview } from '@/features/audit';
import { runAudit } from '@/features/audit/server/run-audit';
import { createScanTicket, SigningUnavailableError } from '@/features/audit/server/signing';
import { clientIp, verifyTurnstile } from '@/features/audit/server/turnstile';

export const maxDuration = 30;

const requestSchema = z.object({
  url: z.string().trim().min(1, 'Enter a website address.').max(MAX_AUDIT_URL_LENGTH, 'That address is too long.'),
  turnstileToken: z.string().max(4096).optional(),
});

const FAILURE_STATUS = { blocked: 400, 'not-html': 422, unreachable: 422 } as const;

/**
 * Typed without a scheme, https is tried first. If it fails fast (refused, TLS error), the site is
 * probably HTTP-only, so try http://. Slow failures aren't retried: a second run wouldn't fit in maxDuration.
 */
const HTTP_FALLBACK_WINDOW_MS = 2_500;

/**
 * POST /api/audit/preview — the free website audit (docs/AUDIT.md). Code-only checks, no AI.
 * Behind a Turnstile check. Responds with the preview projection only (locked findings carry just a
 * title and severity), plus a short-lived `ticket` that lets the follow-up speed test skip a second bot check.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }

  const url = normalizeAuditUrl(parsed.data.url);
  if (!url) return NextResponse.json({ error: 'That doesn’t look like a website address.' }, { status: 400 });

  const human = await verifyTurnstile(parsed.data.turnstileToken, clientIp(request));
  if (human === 'unconfigured') return NextResponse.json({ error: 'The audit isn’t available right now.' }, { status: 503 });
  if (human === 'failed') {
    return NextResponse.json({ error: 'The human check didn’t pass. Please reload and try again.' }, { status: 403 });
  }

  const startedAt = Date.now();
  let outcome = await runAudit(url.toString());
  if (
    !outcome.ok &&
    outcome.reason === 'unreachable' &&
    !hasScheme(parsed.data.url) &&
    Date.now() - startedAt < HTTP_FALLBACK_WINDOW_MS
  ) {
    url.protocol = 'http:';
    outcome = await runAudit(url.toString());
  }
  if (!outcome.ok) return NextResponse.json({ error: outcome.message }, { status: FAILURE_STATUS[outcome.reason] });

  try {
    return NextResponse.json({ preview: toPreview(outcome.result), ticket: createScanTicket(outcome.result.finalUrl) });
  } catch (error) {
    if (error instanceof SigningUnavailableError) {
      console.error('[audit]', error.message);
      return NextResponse.json({ error: 'The audit isn’t available right now.' }, { status: 503 });
    }
    throw error;
  }
}
