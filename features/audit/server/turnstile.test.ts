import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clientIp, verifyTurnstile } from './turnstile';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret');
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const answer = (body: unknown, ok = true) => fetchMock.mockResolvedValue({ ok, json: async () => body });

describe('verifyTurnstile', () => {
  it('passes when Cloudflare says success, sending the secret, token and IP', async () => {
    answer({ success: true });
    expect(await verifyTurnstile('token-1', '203.0.113.9')).toBe('ok');
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('challenges.cloudflare.com/turnstile/v0/siteverify');
    const body = init.body as URLSearchParams;
    expect(body.get('secret')).toBe('secret');
    expect(body.get('response')).toBe('token-1');
    expect(body.get('remoteip')).toBe('203.0.113.9');
  });

  it.each([
    ['success false', { success: false }],
    ['success missing', {}],
    ['success not literally true', { success: 'true' }],
  ])('fails on %s', async (_label, body) => {
    answer(body);
    expect(await verifyTurnstile('t')).toBe('failed');
  });

  it('fails without calling Cloudflare when there is no token', async () => {
    expect(await verifyTurnstile(undefined)).toBe('failed');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails (never throws) on an HTTP error or a network error', async () => {
    answer({}, false);
    expect(await verifyTurnstile('t')).toBe('failed');
    fetchMock.mockRejectedValue(new Error('network'));
    expect(await verifyTurnstile('t')).toBe('failed');
  });

  it('skips the check in development when no secret is set', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');
    vi.stubEnv('NODE_ENV', 'development');
    expect(await verifyTurnstile(undefined)).toBe('ok');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails closed in production when no secret is set', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');
    vi.stubEnv('NODE_ENV', 'production');
    expect(await verifyTurnstile('anything')).toBe('unconfigured');
  });
});

describe('clientIp', () => {
  it('takes the first forwarded address', () => {
    const request = new Request('https://x.test', { headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' } });
    expect(clientIp(request)).toBe('203.0.113.9');
  });

  it('is null when there is no proxy header', () => {
    expect(clientIp(new Request('https://x.test'))).toBeNull();
  });
});
