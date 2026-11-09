import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createReviewUrl, createScanTicket, signToken, SigningUnavailableError, verifyScanTicket, verifyToken } from './signing';

const NOW = Date.UTC(2026, 10, 9, 12, 0, 0);

beforeEach(() => {
  vi.stubEnv('AUDIT_SIGNING_SECRET', 'test-secret-with-enough-length');
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe('signToken / verifyToken', () => {
  it('accepts a token for the same purpose and value before it expires', () => {
    const token = signToken('review', 'req-1', 60, NOW);
    expect(verifyToken('review', 'req-1', token, NOW)).toBe(true);
    expect(verifyToken('review', 'req-1', token, NOW + 59_000)).toBe(true);
  });

  it('rejects an expired token', () => {
    const token = signToken('review', 'req-1', 60, NOW);
    expect(verifyToken('review', 'req-1', token, NOW + 61_000)).toBe(false);
  });

  it('rejects a different value or purpose (no replaying a scan ticket as a review link)', () => {
    const token = signToken('scan', 'req-1', 60, NOW);
    expect(verifyToken('review', 'req-1', token, NOW)).toBe(false);
    expect(verifyToken('scan', 'req-2', token, NOW)).toBe(false);
  });

  it('rejects a token signed with a different secret', () => {
    const token = signToken('review', 'req-1', 60, NOW);
    vi.stubEnv('AUDIT_SIGNING_SECRET', 'another-secret-with-enough-length');
    expect(verifyToken('review', 'req-1', token, NOW)).toBe(false);
  });

  it('rejects a token whose expiry was extended', () => {
    const [expiry, signature] = signToken('review', 'req-1', 60, NOW).split('.');
    const forged = `${Number(expiry) + 86_400}.${signature}`;
    expect(verifyToken('review', 'req-1', forged, NOW)).toBe(false);
  });

  it.each([undefined, null, '', 'nope', '.', '123.', '.abc', 'abc.def', '1.2.3', '99999999999999.x'])('rejects malformed token %j without throwing', (token) => {
    expect(verifyToken('review', 'req-1', token as string | null | undefined, NOW)).toBe(false);
  });
});

describe('links and tickets', () => {
  it('builds an absolute review URL that verifies for that request only', () => {
    const url = new URL(createReviewUrl('abc 123'));
    expect(url.pathname).toBe('/audit/review/abc%20123');
    const token = url.searchParams.get('token');
    expect(verifyToken('review', 'abc 123', token)).toBe(true);
    expect(verifyToken('review', 'other', token)).toBe(false);
  });

  it('binds a scan ticket to the exact URL', () => {
    const ticket = createScanTicket('https://example.com/');
    expect(verifyScanTicket('https://example.com/', ticket)).toBe(true);
    expect(verifyScanTicket('https://example.org/', ticket)).toBe(false);
    expect(verifyScanTicket('https://example.com/', undefined)).toBe(false);
  });
});

describe('secret handling', () => {
  it('uses a fixed development secret outside production', () => {
    vi.stubEnv('AUDIT_SIGNING_SECRET', '');
    vi.stubEnv('NODE_ENV', 'development');
    expect(verifyToken('review', 'r', signToken('review', 'r', 60))).toBe(true);
  });

  it('fails closed in production when the secret is missing or too short', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('AUDIT_SIGNING_SECRET', '');
    expect(() => signToken('review', 'r', 60)).toThrow(SigningUnavailableError);
    vi.stubEnv('AUDIT_SIGNING_SECRET', 'short');
    expect(() => signToken('review', 'r', 60)).toThrow(SigningUnavailableError);
  });
});
