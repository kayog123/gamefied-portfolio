import 'server-only';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * - `ok`: the visitor passed, or verification is skipped in development when no secret is set.
 * - `failed`: Cloudflare rejected the token (or didn't answer in time), so treat the visitor as a bot.
 * - `unconfigured`: production without `TURNSTILE_SECRET_KEY`. Fail closed rather than run open to bots.
 */
export type TurnstileResult = 'ok' | 'failed' | 'unconfigured';

/** Verifies a Cloudflare Turnstile token on the server (docs/AUDIT.md#abuse-limits). Tokens are single-use. */
export async function verifyTurnstile(token: string | undefined, remoteIp?: string | null): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV === 'production' ? 'unconfigured' : 'ok';
  if (!token) return 'failed';

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  try {
    const response = await fetch(VERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(5_000), cache: 'no-store' });
    if (!response.ok) return 'failed';
    const result = (await response.json()) as { success?: boolean };
    return result.success === true ? 'ok' : 'failed';
  } catch {
    return 'failed';
  }
}

/** Best-effort client IP behind a proxy (Vercel sets `x-forwarded-for`); only used as a Turnstile hint. */
export function clientIp(request: Request): string | null {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip');
}
