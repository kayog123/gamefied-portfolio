import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUDIT_CHECKS } from '@/content/audit-checks';
import { countFailures, mergeFindings, scoreFindings } from '@/features/audit/audit.utils';
import type { AuditResult } from '@/types/audit';

// Plain recording functions rather than vi.fn(): vitest reports rejected promises from spies as "unhandled" even when
// the code under test handles them.
const world = vi.hoisted(() => ({
  turnstile: 'ok' as 'ok' | 'failed' | 'unconfigured',
  turnstileCalls: 0,
  storeConfigured: false,
  pending: false,
  pendingThrows: false,
  createThrows: false,
  created: [] as Record<string, unknown>[],
  scanOutcome: null as unknown,
  emailResult: { ok: true } as { ok: true } | { ok: false; reason: 'unconfigured' | 'failed' },
  emails: [] as Record<string, unknown>[],
}));

vi.mock('@/features/audit/server/turnstile', () => ({
  verifyTurnstile: async () => {
    world.turnstileCalls += 1;
    return world.turnstile;
  },
  clientIp: () => null,
}));
vi.mock('@/features/audit/server/audit-store', () => ({
  isAuditStoreConfigured: () => world.storeConfigured,
  hasPendingAuditRequest: async () => {
    if (world.pendingThrows) throw new Error('sanity down');
    return world.pending;
  },
  createAuditRequest: async (input: Record<string, unknown>) => {
    if (world.createThrows) throw new Error('sanity down');
    world.created.push(input);
    return 'req-new';
  },
}));
vi.mock('@/features/audit/server/run-audit', () => ({ runAudit: async () => world.scanOutcome }));
vi.mock('@/features/audit/server/audit-emails', () => ({
  sendAuditRequestEmail: async (email: Record<string, unknown>) => {
    world.emails.push(email);
    return world.emailResult;
  },
}));

const { POST } = await import('./route');

function scanResult(): AuditResult {
  const findings = mergeFindings(
    AUDIT_CHECKS,
    AUDIT_CHECKS.map((check, index) => ({ checkId: check.id, status: index % 3 === 0 ? ('pass' as const) : ('fail' as const) })),
  );
  return {
    url: 'https://example.com/',
    finalUrl: 'https://example.com/',
    auditedAt: '2026-11-09T02:00:00.000Z',
    scores: scoreFindings(findings),
    counts: countFailures(findings),
    findings,
  };
}

const valid = { url: 'example.com', name: 'Maria Santos', email: 'maria@example.com', message: 'Not on Google', consent: true, turnstileToken: 'tok' };

const post = (body: unknown) =>
  POST(new Request('http://localhost/api/audit/request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }));

beforeEach(() => {
  Object.assign(world, {
    turnstile: 'ok',
    turnstileCalls: 0,
    storeConfigured: false,
    pending: false,
    pendingThrows: false,
    createThrows: false,
    created: [],
    scanOutcome: { ok: true, result: scanResult() },
    emailResult: { ok: true },
    emails: [],
  });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('POST /api/audit/request · launch mode (no store)', () => {
  it('emails Jovanni the request, with the scan numbers and no review link, and tells the visitor it worked', async () => {
    const response = await post(valid);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });

    expect(world.emails).toHaveLength(1);
    const email = world.emails[0] as { name: string; email: string; domain: string; reviewUrl?: string; previewSummary: { scores: Record<string, number> } | null };
    expect(email).toMatchObject({ name: 'Maria Santos', email: 'maria@example.com', domain: 'example.com' });
    expect(email.reviewUrl).toBeUndefined();
    expect(email.previewSummary?.scores).toBeDefined();
    expect(world.created).toEqual([]);
  });

  it('still emails when the site could not be scanned, just without scan numbers', async () => {
    world.scanOutcome = { ok: false, reason: 'unreachable', message: 'The site refused the connection.' };
    expect((await post(valid)).status).toBe(200);
    expect((world.emails[0] as { previewSummary: unknown }).previewSummary).toBeNull();
  });

  it('tells the visitor to email instead, with your address, when the email cannot be sent', async () => {
    world.emailResult = { ok: false, reason: 'unconfigured' };
    const response = await post(valid);
    expect(response.status).toBe(503);
    expect((await response.json()).error).toContain('jovannijungco27@gmail.com');

    world.emailResult = { ok: false, reason: 'failed' };
    expect((await post(valid)).status).toBe(502);
  });

  it('records which shared link the request came from', async () => {
    await post({ ...valid, shareId: 'k3Fq9xZp2a' });
    expect((world.emails[0] as { sharedFrom?: string }).sharedFrom).toBe('k3Fq9xZp2a');
  });
});

describe('POST /api/audit/request · with a store', () => {
  beforeEach(() => {
    world.storeConfigured = true;
  });

  it('saves the request and emails a review link', async () => {
    expect((await post(valid)).status).toBe(200);
    expect(world.created).toHaveLength(1);
    expect(world.created[0]).toMatchObject({ domain: 'example.com', email: 'maria@example.com' });
    const email = world.emails[0] as { reviewUrl?: string };
    expect(email.reviewUrl).toContain('/audit/review/req-new?token=');
  });

  it('is still a success if it was saved but the notification email failed (you can find it in Studio)', async () => {
    world.emailResult = { ok: false, reason: 'failed' };
    expect((await post(valid)).status).toBe(200);
    expect(world.created).toHaveLength(1);
  });

  it('falls back to email only if saving fails', async () => {
    world.createThrows = true;
    expect((await post(valid)).status).toBe(200);
    expect((world.emails[0] as { reviewUrl?: string }).reviewUrl).toBeUndefined();
  });

  it('fails the visitor only when it was neither saved nor emailed', async () => {
    world.createThrows = true;
    world.emailResult = { ok: false, reason: 'failed' };
    expect((await post(valid)).status).toBe(502);
  });

  it('acknowledges a repeat request for the same site without a second email', async () => {
    world.pending = true;
    const response = await post(valid);
    expect(response.status).toBe(200);
    expect(world.emails).toEqual([]);
    expect(world.created).toEqual([]);
  });

  it('carries on if the duplicate check itself fails', async () => {
    world.pendingThrows = true;
    expect((await post(valid)).status).toBe(200);
    expect(world.emails).toHaveLength(1);
  });
});

describe('POST /api/audit/request · gatekeeping', () => {
  it.each([
    ['no consent', { ...valid, consent: false }],
    ['a bad email', { ...valid, email: 'nope' }],
    ['no name', { ...valid, name: '  ' }],
    ['no url', { ...valid, url: '' }],
    ['a bad share id', { ...valid, shareId: '../../x' }],
  ])('rejects %s before doing anything else', async (_label, body) => {
    const response = await post(body);
    expect(response.status).toBe(400);
    expect(world.turnstileCalls).toBe(0);
    expect(world.emails).toEqual([]);
  });

  it('rejects a body that is not JSON', async () => {
    const response = await POST(new Request('http://localhost/api/audit/request', { method: 'POST', body: 'not json' }));
    expect(response.status).toBe(400);
  });

  it('refuses a failed bot check (403), and a missing Turnstile secret in production (503), sending nothing', async () => {
    world.turnstile = 'failed';
    expect((await post(valid)).status).toBe(403);
    world.turnstile = 'unconfigured';
    expect((await post(valid)).status).toBe(503);
    expect(world.emails).toEqual([]);
  });

  it('rejects a private or internal address as a non-lead', async () => {
    world.scanOutcome = { ok: false, reason: 'blocked', message: 'That address isn’t on the public internet.' };
    const response = await post({ ...valid, url: 'http://127.0.0.1' });
    expect(response.status).toBe(400);
    expect(world.emails).toEqual([]);
  });
});
