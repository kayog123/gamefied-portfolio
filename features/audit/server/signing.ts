import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { SITE_URL } from '@/lib/site';
import { REVIEW_LINK_TTL_SECONDS, SCAN_TICKET_TTL_SECONDS } from '../audit.constants';

/** What a token is for. It's part of the signed text, so a scan ticket can't be replayed as a review link. */
export type TokenPurpose = 'review' | 'scan';

/** Thrown in production when `AUDIT_SIGNING_SECRET` is missing or too short, so we fail closed. */
export class SigningUnavailableError extends Error {
  constructor() {
    super('AUDIT_SIGNING_SECRET is not set (min 16 characters).');
    this.name = 'SigningUnavailableError';
  }
}

/** A fixed secret is fine for local development only; production always needs the real one. */
const DEV_SECRET = 'development-only-signing-secret';

function getSecret(): string {
  const secret = process.env.AUDIT_SIGNING_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV !== 'production') return DEV_SECRET;
  throw new SigningUnavailableError();
}

function mac(purpose: TokenPurpose, value: string, expiresAt: number): string {
  return createHmac('sha256', getSecret()).update(`${purpose}\n${value}\n${expiresAt}`).digest('base64url');
}

/** `"<expiresAtSeconds>.<hmac>"`, valid for `ttlSeconds` from `now`. */
export function signToken(purpose: TokenPurpose, value: string, ttlSeconds: number, now = Date.now()): string {
  const expiresAt = Math.floor(now / 1000) + ttlSeconds;
  return `${expiresAt}.${mac(purpose, value, expiresAt)}`;
}

/** True when `token` was signed for exactly this purpose and value and hasn't expired. Never throws on bad input. */
export function verifyToken(purpose: TokenPurpose, value: string, token: string | null | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const [expiry, signature, ...rest] = token.split('.');
  if (rest.length > 0 || !signature || !/^\d{1,12}$/.test(expiry)) return false;
  const expiresAt = Number(expiry);
  if (expiresAt < Math.floor(now / 1000)) return false;

  const expected = Buffer.from(mac(purpose, value, expiresAt));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Absolute, signed link to the private review page (docs/AUDIT.md#links). Valid 7 days. */
export function createReviewUrl(requestId: string): string {
  const token = signToken('review', requestId, REVIEW_LINK_TTL_SECONDS);
  return `${SITE_URL}/audit/review/${encodeURIComponent(requestId)}?token=${token}`;
}

/** Proof that a scan passed the bot check, so the slow follow-up request needn't spend a second Turnstile token. */
export function createScanTicket(url: string): string {
  return signToken('scan', url, SCAN_TICKET_TTL_SECONDS);
}

export function verifyScanTicket(url: string, ticket: string | null | undefined): boolean {
  return verifyToken('scan', url, ticket);
}
