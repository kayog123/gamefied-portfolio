import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { AuditRequestRecord } from '../audit.types';
import { ReviewPanel } from './audit-review-page';
import { FullAuditPanel } from './full-audit-panel';
import { RequestDialog } from './request-dialog';

const record: AuditRequestRecord = {
  id: 'req-1',
  createdAt: '2026-11-09T04:00:00.000Z',
  url: 'https://example.com/',
  domain: 'example.com',
  name: 'Maria Santos',
  email: 'maria@example.com',
  message: 'Not on Google',
  status: 'pending',
  previewSummary: { scores: { seo: 50, security: 45, maintainability: 91 }, counts: { critical: 1, warning: 7, info: 7 }, lockedCount: 3 },
  sharedFrom: null,
};

describe('RequestDialog', () => {
  const html = renderToStaticMarkup(<RequestDialog isOpen={false} onClose={() => {}} url="https://example.com/" domain="example.com" />);

  it('is a labelled dialog with the form fields, consent and submit button', () => {
    expect(html).toContain('<dialog');
    expect(html).toContain('aria-labelledby="request-title"');
    expect(html).toContain('Get the full audit');
    expect(html).toContain('autoComplete="name"');
    expect(html).toContain('type="email"');
    expect(html).toContain('Email me about this audit only. No newsletters.');
    expect(html).toContain('Request full audit');
  });

  it('only the request button submits the form; Cancel must not', () => {
    const form = html.slice(html.indexOf('<form'), html.indexOf('</form>'));
    const buttons = [...form.matchAll(/<button[^>]*>/g)].map((match) => match[0]);
    const submitting = buttons.filter((tag) => !/type="button"/.test(tag));
    expect(buttons.length).toBe(2);
    expect(submitting).toHaveLength(1);
    expect(submitting[0]).toContain('type="submit"');
  });
});

describe('FullAuditPanel', () => {
  it('opens the request form from a button, not a mailto link', () => {
    const html = renderToStaticMarkup(<FullAuditPanel url="https://example.com/" domain="example.com" lockedCount={3} hasCritical />);
    expect(html).toContain('3 findings are locked, including a critical issue');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain('mailto:');
  });
});

describe('ReviewPanel', () => {
  it('shows the request with the signed token only inside the action forms', () => {
    const html = renderToStaticMarkup(<ReviewPanel request={record} token="1799999999.sig" />);
    expect(html).toContain('example.com');
    expect(html).toContain('mailto:maria@example.com');
    expect(html).toContain('SEO');
    expect(html).toContain('3 locked');
    expect(html).toContain('Mark contacted');
    expect(html).toContain('Decline');
    expect((html.match(/name="token"/g) ?? []).length).toBe(2);
  });

  it('escapes a hostile message instead of rendering it', () => {
    const html = renderToStaticMarkup(<ReviewPanel request={{ ...record, message: '<script>alert(1)</script>' }} token="t" />);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('drops the action buttons once a request is declined', () => {
    const html = renderToStaticMarkup(<ReviewPanel request={{ ...record, status: 'declined' }} token="t" />);
    expect(html).toContain('DECLINED');
    expect(html).not.toContain('Mark contacted');
  });

  it('copes with a request that has no scan summary', () => {
    const html = renderToStaticMarkup(<ReviewPanel request={{ ...record, previewSummary: null }} token="t" />);
    expect(html).toContain('free scan wasn&#x27;t available');
  });
});
