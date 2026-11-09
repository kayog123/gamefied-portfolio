import 'server-only';
import { sendEmail, type SendResult } from './send-email';

export type { SendResult };

export type ContactEmail = { email: string; message: string };

/**
 * Emails a contact-form message to Jovanni. The visitor's address goes in `Reply-To`, so
 * hitting "Reply" answers them. Plain text only: nothing the visitor typed is rendered as HTML.
 */
export function sendContactEmail({ email, message }: ContactEmail): Promise<SendResult> {
  return sendEmail({ replyTo: email, subject: `New message from ${email}`, text: `From: ${email}\n\n${message}` });
}
