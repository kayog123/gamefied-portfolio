'use server';

import 'server-only';
import { after } from 'next/server';
import { REPORT_LINK_TTL_SECONDS } from '../audit.constants';
import { sendReportEmail } from './audit-emails';
import { claimReportRun, getStoredReport, markReportSendFailed, markReportSent, setAuditRequestStatus } from './audit-store';
import { generateFullReport } from './full-audit';
import { createReportUrl, SigningUnavailableError, verifyToken } from './signing';

const STATUS_INTENTS = ['contacted', 'declined'] as const;
type StatusIntent = (typeof STATUS_INTENTS)[number];

/**
 * Every action here is a Server Action, which is a public POST endpoint, so each one re-checks the signed review token
 * from the form. Returns the request ID only when the token is valid for exactly that request.
 */
function authorize(formData: FormData): string | null {
  const requestId = formData.get('requestId');
  const token = formData.get('token');
  if (typeof requestId !== 'string' || typeof token !== 'string') return null;
  try {
    return verifyToken('review', requestId, token) ? requestId : null;
  } catch (error) {
    if (error instanceof SigningUnavailableError) return null;
    throw error;
  }
}

/**
 * Marks a request "contacted" or "declined" from the review page. A POST on purpose: email scanners prefetch
 * links with GET, so opening the review link must never change anything.
 */
export async function updateReviewStatusAction(formData: FormData): Promise<void> {
  const requestId = authorize(formData);
  const intent = formData.get('intent');
  if (!requestId || typeof intent !== 'string' || !(STATUS_INTENTS as readonly string[]).includes(intent)) return;
  await setAuditRequestStatus(requestId, intent as StatusIntent);
}

/**
 * "Run full audit" (docs/AUDIT.md#full-audit-phase-4): fresh checks plus the Grok analysis, which costs tokens, so it
 * only ever starts from this button. It takes a lock first (a second click or tab changes nothing), answers right away,
 * and does the slow work in `after()`; the review page refreshes itself until the report is ready.
 * The route's `maxDuration` (set on the review page) bounds the whole run.
 */
export async function runFullAuditAction(formData: FormData): Promise<void> {
  const requestId = authorize(formData);
  if (!requestId) return;
  if (!(await claimReportRun(requestId))) return;
  after(() => generateFullReport(requestId));
}

/**
 * Emails the finished report to the person who asked for it. Separate from running it on purpose: the site promises
 * "reviewed by me before it reaches you", so nothing is sent until Jovanni has read it. A failure is recorded on the
 * request (the review page then shows the link to send by hand), never thrown at the page.
 */
export async function sendReportAction(formData: FormData): Promise<void> {
  const requestId = authorize(formData);
  if (!requestId) return;

  const stored = await getStoredReport(requestId);
  if (!stored) return;

  const sent = await sendReportEmail({ to: stored.email, name: stored.name, domain: stored.domain, reportUrl: createReportUrl(requestId) });
  if (sent.ok) {
    await markReportSent(requestId, new Date(Date.now() + REPORT_LINK_TTL_SECONDS * 1000).toISOString());
    return;
  }
  await markReportSendFailed(
    requestId,
    sent.reason === 'unconfigured'
      ? 'Email isn’t configured (no RESEND_API_KEY).'
      : 'The email provider refused it. With Resend’s shared sender, mail only reaches your own address until you verify a domain and set CONTACT_FROM_EMAIL.',
  );
}
