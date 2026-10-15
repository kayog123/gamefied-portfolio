import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactEmail } from '@/lib/email/send-contact-email';

const requestSchema = z.object({
  email: z.email('Enter a valid email.').max(254),
  message: z.string().trim().min(1, 'Tell me what you’re building.').max(5000, 'Keep it under 5,000 characters.'),
});

/** POST /api/contact — "Have an idea? Let's build it for real." (Sheet 07). Emails the message via Resend. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }

  const result = await sendContactEmail(parsed.data);
  if (!result.ok) {
    const unconfigured = result.reason === 'unconfigured';
    return NextResponse.json(
      { error: unconfigured ? 'Email sending isn’t set up yet.' : 'Couldn’t send your message.' },
      { status: unconfigured ? 503 : 502 },
    );
  }

  return NextResponse.json({ received: true });
}
