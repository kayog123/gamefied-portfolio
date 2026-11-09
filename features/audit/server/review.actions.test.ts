import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { signToken } from './signing';

const calls = vi.hoisted(() => ({
  claim: [] as string[],
  claimResult: true,
  scheduled: [] as (() => unknown)[],
  generated: [] as string[],
  stored: null as null | { email: string; name: string; domain: string },
  emailed: [] as { to: string; name: string; domain: string; reportUrl: string }[],
  emailResult: { ok: true } as { ok: true } | { ok: false; reason: 'unconfigured' | 'failed' },
  sent: [] as { id: string; expiresAt: string }[],
  sendFailed: [] as { id: string; message: string }[],
  status: [] as { id: string; status: string }[],
}));

vi.mock('next/server', () => ({ after: (callback: () => unknown) => calls.scheduled.push(callback) }));
vi.mock('./full-audit', () => ({ generateFullReport: async (id: string) => void calls.generated.push(id) }));
vi.mock('./audit-emails', () => ({
  sendReportEmail: async (args: { to: string; name: string; domain: string; reportUrl: string }) => {
    calls.emailed.push(args);
    return calls.emailResult;
  },
}));
vi.mock('./audit-store', () => ({
  claimReportRun: async (id: string) => {
    calls.claim.push(id);
    return calls.claimResult;
  },
  getStoredReport: async () => calls.stored,
  markReportSent: async (id: string, expiresAt: string) => void calls.sent.push({ id, expiresAt }),
  markReportSendFailed: async (id: string, message: string) => void calls.sendFailed.push({ id, message }),
  setAuditRequestStatus: async (id: string, status: string) => void calls.status.push({ id, status }),
}));

const { runFullAuditAction, sendReportAction, updateReviewStatusAction } = await import('./review.actions');

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};

const validToken = (id: string) => signToken('review', id, 3600);

beforeEach(() => {
  vi.stubEnv('AUDIT_SIGNING_SECRET', 'test-secret-with-enough-length');
  vi.stubEnv('SITE_URL', '');
  Object.assign(calls, {
    claim: [],
    claimResult: true,
    scheduled: [],
    generated: [],
    stored: { email: 'maria@example.com', name: 'Maria Santos', domain: 'example.com' },
    emailed: [],
    emailResult: { ok: true },
    sent: [],
    sendFailed: [],
    status: [],
  });
});
afterEach(() => vi.unstubAllEnvs());

describe('runFullAuditAction', () => {
  it('takes the lock and schedules the run to start after the response', async () => {
    await runFullAuditAction(form({ requestId: 'req-1', token: validToken('req-1') }));
    expect(calls.claim).toEqual(['req-1']);
    expect(calls.scheduled).toHaveLength(1);
    expect(calls.generated).toEqual([]); // nothing runs until after() fires
    await calls.scheduled[0]();
    expect(calls.generated).toEqual(['req-1']);
  });

  it('does nothing when another run holds the lock (a second click or tab)', async () => {
    calls.claimResult = false;
    await runFullAuditAction(form({ requestId: 'req-1', token: validToken('req-1') }));
    expect(calls.claim).toEqual(['req-1']);
    expect(calls.scheduled).toHaveLength(0);
  });

  it.each([
    ['no token', { requestId: 'req-1' }],
    ['a forged token', { requestId: 'req-1', token: '9999999999.forged' }],
    ['a token for a different request', { requestId: 'req-1', token: signToken('review', 'req-2', 3600) }],
    ['a token for another purpose', { requestId: 'req-1', token: signToken('report', 'req-1', 3600) }],
    ['an expired token', { requestId: 'req-1', token: signToken('review', 'req-1', -10) }],
    ['no request id', { token: signToken('review', 'req-1', 3600) }],
  ])('refuses %s, without touching the store or spending tokens', async (_label, fields) => {
    await runFullAuditAction(form(fields));
    expect(calls.claim).toEqual([]);
    expect(calls.scheduled).toHaveLength(0);
  });
});

describe('sendReportAction', () => {
  it('emails the requester a signed report link and records it as sent for another 30 days', async () => {
    await sendReportAction(form({ requestId: 'req-1', token: validToken('req-1') }));

    expect(calls.emailed).toHaveLength(1);
    expect(calls.emailed[0]).toMatchObject({ to: 'maria@example.com', name: 'Maria Santos', domain: 'example.com' });
    const link = new URL(calls.emailed[0].reportUrl);
    expect(link.pathname).toBe('/audit/report/req-1');
    expect(link.searchParams.get('token')).toMatch(/^\d+\.[\w-]+$/);
    expect(calls.sent).toHaveLength(1);
    expect(Date.parse(calls.sent[0].expiresAt) - Date.now()).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
    expect(calls.sendFailed).toEqual([]);
  });

  it('records why it failed, and does not mark it sent, when the email provider refuses', async () => {
    calls.emailResult = { ok: false, reason: 'failed' };
    await sendReportAction(form({ requestId: 'req-1', token: validToken('req-1') }));
    expect(calls.sent).toEqual([]);
    expect(calls.sendFailed).toHaveLength(1);
    expect(calls.sendFailed[0].message).toContain('verify a domain');
  });

  it('says so plainly when email is not configured', async () => {
    calls.emailResult = { ok: false, reason: 'unconfigured' };
    await sendReportAction(form({ requestId: 'req-1', token: validToken('req-1') }));
    expect(calls.sendFailed[0].message).toContain('RESEND_API_KEY');
  });

  it('sends nothing when there is no report yet', async () => {
    calls.stored = null;
    await sendReportAction(form({ requestId: 'req-1', token: validToken('req-1') }));
    expect(calls.emailed).toEqual([]);
  });

  it('refuses a forged token', async () => {
    await sendReportAction(form({ requestId: 'req-1', token: '9999999999.forged' }));
    expect(calls.emailed).toEqual([]);
    expect(calls.sent).toEqual([]);
  });
});

describe('updateReviewStatusAction', () => {
  it('sets contacted or declined with a valid token', async () => {
    await updateReviewStatusAction(form({ requestId: 'req-1', token: validToken('req-1'), intent: 'declined' }));
    expect(calls.status).toEqual([{ id: 'req-1', status: 'declined' }]);
  });

  it.each(['completed', 'running', 'pending', 'failed', '', 'DROP'])('refuses the status "%s", which only the system may set', async (intent) => {
    await updateReviewStatusAction(form({ requestId: 'req-1', token: validToken('req-1'), intent }));
    expect(calls.status).toEqual([]);
  });

  it('refuses a forged token', async () => {
    await updateReviewStatusAction(form({ requestId: 'req-1', token: 'x.y', intent: 'contacted' }));
    expect(calls.status).toEqual([]);
  });
});
