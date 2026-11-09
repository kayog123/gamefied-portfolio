import { NextResponse } from 'next/server';
import { z } from 'zod';
import { MAX_AUDIT_URL_LENGTH, normalizeAuditUrl } from '@/features/audit';
import { runPageSpeed } from '@/features/audit/server/pagespeed';

/** PageSpeed itself can take up to ~50 s. */
export const maxDuration = 60;

const requestSchema = z.object({
  url: z.string().trim().min(1).max(MAX_AUDIT_URL_LENGTH),
});

const FAILURE = {
  blocked: { status: 400, error: 'That address can’t be measured.' },
  quota: { status: 503, error: 'Speed measurement is busy right now. Try again later.' },
  unavailable: { status: 502, error: 'Couldn’t measure speed for this site right now.' },
} as const;

/**
 * POST /api/audit/performance — mobile PageSpeed score for the audit's 4th card (docs/AUDIT.md).
 * Separate from /preview because it's slow (10–30 s) and uses an external quota; the page shows the
 * rest of the results first. No AI tokens.
 * TODO(docs/AUDIT.md#phases): verify a Turnstile token here in Phase 3.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  const url = parsed.success ? normalizeAuditUrl(parsed.data.url) : null;
  if (!url) return NextResponse.json({ error: 'That doesn’t look like a website address.' }, { status: 400 });

  const outcome = await runPageSpeed(url.toString());
  if (!outcome.ok) {
    const { status, error } = FAILURE[outcome.reason];
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ performance: outcome.result });
}
