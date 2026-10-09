import { NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  email: z.email('Enter a valid email.'),
  projectName: z.string().min(1),
  consent: z.literal(true, { error: 'Consent is required.' }),
});

/**
 * POST /api/brief — "Send brief to Jovanni Jungco" (Sheet 06).
 *
 * TODO(docs/PACKAGES.md#open-decisions): wire a real email provider (Resend
 * is the current leaning) once chosen. Until then this validates and
 * acknowledges receipt only — nothing is actually emailed or stored yet, so
 * don't present this as "live" to real visitors before that's wired in.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}
