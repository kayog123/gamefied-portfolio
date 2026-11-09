import 'server-only';
import { sendEmail, type SendResult } from '@/lib/email/send-email';
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
};

/** Visitor-supplied text goes in headers, so strip anything that could break one. */
function oneLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Tells Jovanni a visitor asked for the full audit. `Reply-To` is the visitor, so "Reply" answers them.
 * Plain text only; the review link is the only thing in here that can trigger anything (and it needs a click + confirm).
 */
export function sendAuditRequestEmail({ name, email, url, domain, message, previewSummary, reviewUrl }: RequestEmail): Promise<SendResult> {
  const lines = [
    `${oneLine(name)} <${email}> asked for the full audit of ${domain}.`,
    '',
    `Site: ${url}`,
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
