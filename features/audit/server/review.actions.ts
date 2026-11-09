'use server';

import 'server-only';
import { setAuditRequestStatus } from './audit-store';
import { SigningUnavailableError, verifyToken } from './signing';

const ALLOWED = ['contacted', 'declined'] as const;
type ReviewIntent = (typeof ALLOWED)[number];

/**
 * Marks a request "contacted" or "declined" from the review page. A Server Action (POST) on purpose:
 * email scanners prefetch links with GET, so opening the review link must never change anything.
 * The signed token is checked again here, because a Server Action is a public endpoint.
 */
export async function updateReviewStatusAction(formData: FormData): Promise<void> {
  const requestId = formData.get('requestId');
  const token = formData.get('token');
  const intent = formData.get('intent');
  if (typeof requestId !== 'string' || typeof token !== 'string' || typeof intent !== 'string') return;
  if (!(ALLOWED as readonly string[]).includes(intent)) return;

  try {
    if (!verifyToken('review', requestId, token)) return;
  } catch (error) {
    if (error instanceof SigningUnavailableError) return;
    throw error;
  }

  await setAuditRequestStatus(requestId, intent as ReviewIntent);
}
