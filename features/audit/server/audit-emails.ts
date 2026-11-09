import 'server-only';
import { sendEmail, type SendResult } from '@/lib/email/send-email';
import { BOOK_A_CALL_URL, SOCIAL_LINKS } from '@/lib/site';
import type { PreviewSummary } from '../audit.types';

export type RequestEmail = {
  name: string;
  email: string;
  url: string;
  domain: string;
  message: string;
  previewSummary: PreviewSummary | null;
  /** Signed link to the review page; absent when the request couldn't be stored. */
  reviewUrl?: string;
  /** Share ID of the shared audit they came from, if any. */
  sharedFrom?: string;
};

/** Visitor-supplied text goes in headers, so strip anything that could break one. */
function oneLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Tells Jovanni a visitor asked for the full audit. `Reply-To` is the visitor, so "Reply" answers them.
 * Plain text only; the review link is the only thing in here that can trigger anything (and it needs a click + confirm).
 */
export function sendAuditRequestEmail({ name, email, url, domain, message, previewSummary, reviewUrl, sharedFrom }: RequestEmail): Promise<SendResult> {
  const lines = [
    `${oneLine(name)} <${email}> asked for the full audit of ${domain}.`,
    '',
    `Site: ${url}`,
    sharedFrom ? `Came from the shared audit link /audit/s/${sharedFrom}` : '',
    previewSummary
      ? `Free scan: SEO ${previewSummary.scores.seo} · Security ${previewSummary.scores.security} · Maintainability ${previewSummary.scores.maintainability} ` +
        `(${previewSummary.counts.critical} critical, ${previewSummary.lockedCount} locked)`
      : 'Free scan: not available',
    '',
    message ? `Their message:\n${message}` : 'They left no message.',
    '',
    reviewUrl ? `Review it (link valid 7 days):\n${reviewUrl}` : 'This request could not be saved to the audits dataset, so there is no review link. Reply to this email.',
  ];

  return sendEmail({ replyTo: email, subject: `Audit request: ${oneLine(domain)} (${oneLine(name)})`, text: lines.join('\n') });
}

/** "Opened your audit": sent once, the first time a link you personalised (`preparedFor`) is opened by something that looks like a person. */
export function sendSnapshotOpenedEmail({ domain, preparedFor, shareUrl }: { domain: string; preparedFor: string; shareUrl: string }): Promise<SendResult> {
  return sendEmail({
    subject: `Opened: audit of ${oneLine(domain)} (${oneLine(preparedFor)})`,
    text: [
      `${oneLine(preparedFor)} just opened the audit you shared for ${domain}.`,
      '',
      shareUrl,
      '',
      'This is a best-effort signal: link-preview bots are filtered out, but some email scanners can still look like a visit.',
    ].join('\n'),
  });
}

/**
 * Sends the finished report to the person who asked for it. `Reply-To` is Jovanni, so "Reply" reaches him.
 * With Resend's shared sender this only delivers to the account owner, so until a domain is verified
 * (`CONTACT_FROM_EMAIL`) it fails and the review page shows the link to send by hand.
 */
export function sendReportEmail({ to, name, domain, reportUrl }: { to: string; name: string; domain: string; reportUrl: string }): Promise<SendResult> {
  const firstName = oneLine(name).split(' ')[0] || 'there';
  return sendEmail({
    to,
    replyTo: process.env.CONTACT_TO_EMAIL ?? SOCIAL_LINKS.email,
    subject: `Your website audit for ${oneLine(domain)}`,
    text: [
      `Hi ${firstName},`,
      '',
      `The full audit of ${oneLine(domain)} is ready:`,
      reportUrl,
      '',
      'It includes every finding with what it means and how to fix it, plus a suggested order to tackle them in. The link works for 30 days.',
      '',
      `If you would like me to walk you through it, just reply to this email or book a call: ${BOOK_A_CALL_URL}`,
      '',
      'Jovanni Jungco',
    ].join('\n'),
  });
}
