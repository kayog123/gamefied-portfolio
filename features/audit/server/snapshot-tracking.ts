import 'server-only';
import { SITE_URL } from '@/lib/site';
import { sendSnapshotOpenedEmail } from './audit-emails';
import { recordSnapshotView } from './audit-store';

/**
 * Counts a view of a shared audit and, the very first time a link Jovanni personalised
 * (`preparedFor`) is opened, emails him. Runs in `after()`, so it never slows the page, and every
 * failure is only logged: tracking must never break a visitor's page.
 */
export async function trackSnapshotView(shareId: string): Promise<void> {
  try {
    const view = await recordSnapshotView(shareId);
    if (!view || view.views !== 1 || !view.preparedFor) return;
    const sent = await sendSnapshotOpenedEmail({ domain: view.domain, preparedFor: view.preparedFor, shareUrl: `${SITE_URL}/audit/s/${shareId}` });
    if (!sent.ok) console.error('[audit] could not send the opened-audit email', sent.reason);
  } catch (error) {
    console.error('[audit] could not record a snapshot view', error);
  }
}
