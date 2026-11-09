import { beforeEach, describe, expect, it, vi } from 'vitest';

type Sent = { subject: string; text: string; replyTo?: string; to?: string };

const outbox = vi.hoisted(() => ({ sent: [] as { subject: string; text: string; replyTo?: string; to?: string }[] }));

vi.mock('@/lib/email/send-email', () => ({
  sendEmail: async (email: Sent) => {
    outbox.sent.push(email);
    return { ok: true };
  },
}));

const { sendAuditRequestEmail, sendReportEmail, sendSnapshotOpenedEmail } = await import('./audit-emails');

const request = {
  name: 'Maria Santos',
  email: 'maria@example.com',
  url: 'https://example.com/',
  domain: 'example.com',
  message: 'Not on Google',
  previewSummary: { scores: { seo: 50, security: 45, maintainability: 91 }, counts: { critical: 1, warning: 7, info: 7 }, lockedCount: 3 },
};

beforeEach(() => {
  outbox.sent = [];
});

describe('sendAuditRequestEmail', () => {
  it('with storage: includes the review link and the scan numbers, and replies go to the requester', async () => {
    await sendAuditRequestEmail({ ...request, reviewUrl: 'https://example.com/audit/review/abc?token=1.sig' });
    const [email] = outbox.sent;
    expect(email.subject).toBe('Audit request: example.com (Maria Santos)');
    expect(email.replyTo).toBe('maria@example.com');
    expect(email.text).toContain('https://example.com/audit/review/abc?token=1.sig');
    expect(email.text).toContain('SEO 50 · Security 45 · Maintainability 91');
    expect(email.text).toContain('1 critical, 3 locked');
    expect(email.text).toContain('Not on Google');
  });

  it('without storage (the launch mode): says plainly that this email is the only record, not that something broke', async () => {
    await sendAuditRequestEmail(request);
    const { text } = outbox.sent[0];
    expect(text).toContain('There is no review link');
    expect(text).toContain('this email is the only record');
    expect(text).not.toContain('could not be saved');
    expect(text).not.toContain('/audit/review/');
  });

  it('still carries everything needed to answer: who, the site, the scan, the message', async () => {
    await sendAuditRequestEmail(request);
    const { text } = outbox.sent[0];
    expect(text).toContain('Maria Santos <maria@example.com> asked for the full audit of example.com.');
    expect(text).toContain('Site: https://example.com/');
    expect(text).toContain('Their message:');
  });

  it('handles a missing scan and a missing message', async () => {
    await sendAuditRequestEmail({ ...request, message: '', previewSummary: null });
    expect(outbox.sent[0].text).toContain('Free scan: not available');
    expect(outbox.sent[0].text).toContain('They left no message.');
  });

  it('records which shared link they came from', async () => {
    await sendAuditRequestEmail({ ...request, sharedFrom: 'k3Fq9xZp2a' });
    expect(outbox.sent[0].text).toContain('/audit/s/k3Fq9xZp2a');
  });

  it('keeps line breaks and extra whitespace out of the subject, whatever the visitor typed', async () => {
    await sendAuditRequestEmail({ ...request, name: 'Maria\r\nBcc: attacker@evil.test\n  Santos' });
    const { subject } = outbox.sent[0];
    expect(subject).not.toMatch(/[\r\n]/);
    expect(subject).toBe('Audit request: example.com (Maria Bcc: attacker@evil.test Santos)');
  });
});

describe('sendReportEmail', () => {
  it('goes to the requester, replies to Jovanni, and carries the link', async () => {
    await sendReportEmail({ to: 'maria@example.com', name: 'Maria Santos', domain: 'example.com', reportUrl: 'https://example.com/audit/report/abc?token=1.sig' });
    const [email] = outbox.sent;
    expect(email.to).toBe('maria@example.com');
    expect(email.replyTo).toBeTruthy();
    expect(email.replyTo).not.toBe('maria@example.com');
    expect(email.subject).toBe('Your website audit for example.com');
    expect(email.text).toContain('Hi Maria,');
    expect(email.text).toContain('https://example.com/audit/report/abc?token=1.sig');
    expect(email.text).toContain('30 days');
  });

  it('copes with a blank name', async () => {
    await sendReportEmail({ to: 'x@example.com', name: '   ', domain: 'example.com', reportUrl: 'https://example.com/r' });
    expect(outbox.sent[0].text).toContain('Hi there,');
  });
});

describe('sendSnapshotOpenedEmail', () => {
  it('names who opened it and links to the shared audit', async () => {
    await sendSnapshotOpenedEmail({ domain: 'example.com', preparedFor: 'Acme Co.', shareUrl: 'https://example.com/audit/s/k3Fq9xZp2a' });
    const [email] = outbox.sent;
    expect(email.subject).toBe('Opened: audit of example.com (Acme Co.)');
    expect(email.text).toContain('Acme Co. just opened the audit');
    expect(email.text).toContain('https://example.com/audit/s/k3Fq9xZp2a');
  });
});
