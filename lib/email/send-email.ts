import 'server-only';
import { Resend } from 'resend';
import { SOCIAL_LINKS } from '@/lib/site';

/** `unconfigured` = no `RESEND_API_KEY` yet; `failed` = the provider rejected or errored. */
export type SendResult = { ok: true } | { ok: false; reason: 'unconfigured' | 'failed' };

export type OutgoingEmail = {
  subject: string;
  /** Plain text only: nothing a visitor typed is ever rendered as HTML. */
  text: string;
  /** Defaults to `CONTACT_TO_EMAIL`, then the public email in `lib/site.ts`. */
  to?: string;
  replyTo?: string;
};

/** Sends one plain-text email through Resend. Shared by the contact form and the website audit. */
export async function sendEmail({ subject, text, to, replyTo }: OutgoingEmail): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: 'unconfigured' };

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    // Resend's shared sender works without a verified domain, but only delivers to the account owner's address.
    from: process.env.CONTACT_FROM_EMAIL ?? 'Portfolio contact <onboarding@resend.dev>',
    to: to ?? process.env.CONTACT_TO_EMAIL ?? SOCIAL_LINKS.email,
    replyTo,
    subject,
    text,
  });

  return error ? { ok: false, reason: 'failed' } : { ok: true };
}
