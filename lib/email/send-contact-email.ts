import 'server-only';
import { Resend } from 'resend';
import { SOCIAL_LINKS } from '@/lib/site';

export type ContactEmail = { email: string; message: string };

/** `unconfigured` = no `RESEND_API_KEY` yet; `failed` = the provider rejected or errored. */
export type SendResult = { ok: true } | { ok: false; reason: 'unconfigured' | 'failed' };

/**
 * Emails a contact-form message to Jovanni. The visitor's address goes in `Reply-To`, so
 * hitting "Reply" answers them. Plain text only: nothing the visitor typed is rendered as HTML.
 */
export async function sendContactEmail({ email, message }: ContactEmail): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: 'unconfigured' };

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    // Resend's shared sender works without a verified domain, but only delivers to the account owner's address.
    from: process.env.CONTACT_FROM_EMAIL ?? 'Portfolio contact <onboarding@resend.dev>',
    to: process.env.CONTACT_TO_EMAIL ?? SOCIAL_LINKS.email,
    replyTo: email,
    subject: `New message from ${email}`,
    text: `From: ${email}\n\n${message}`,
  });

  return error ? { ok: false, reason: 'failed' } : { ok: true };
}
