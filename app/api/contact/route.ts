import { NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  email: z.email('Enter a valid email.'),
  message: z.string().min(1, 'Tell me what you’re building.'),
});

/**
 * POST /api/contact — "Have an idea? Let's build it for real." (Sheet 07).
 *
 * TODO(docs/PACKAGES.md#open-decisions): wire a real email provider once
 * chosen (same provider as `/api/brief`). Until then this validates and
 * acknowledges receipt only — nothing is actually emailed or stored yet.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}
