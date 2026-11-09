import type { IncomingHttpHeaders } from 'node:http';
import { describe, expect, it } from 'vitest';
import { AUDIT_CHECKS } from '@/content/audit-checks';
import { parseHtml } from '../parse-html';
import type { SafeResponse } from '../safe-fetch';
import type { AuditContext } from './check-helpers';
import { MAINTAINABILITY_CHECKS } from './maintainability-checks';
import { SECURITY_CHECKS, cspIssues } from './security-checks';
import { SEO_CHECKS, blocksEverything, sitemapsFromRobots } from './seo-checks';

const ALL_CHECKS = [...SEO_CHECKS, ...SECURITY_CHECKS, ...MAINTAINABILITY_CHECKS];

function response(overrides: Partial<SafeResponse> = {}): SafeResponse {
  return {
    url: 'https://example.com/',
    status: 200,
    headers: {},
    body: '',
    bodyBytes: 0,
    isTruncated: false,
    ttfbMs: 120,
    redirects: [],
    certificate: { isTrusted: true, validTo: new Date(Date.now() + 90 * 864e5).toISOString() },
    ...overrides,
  };
}

function context(html: string, headers: IncomingHttpHeaders = {}, extra: Partial<AuditContext> = {}): AuditContext {
  const page = response({ body: html, bodyBytes: Buffer.byteLength(html), headers });
  return {
    page,
    html: parseHtml(html),
    robotsTxt: response({ url: 'https://example.com/robots.txt', body: 'User-agent: *\nAllow: /' }),
    sitemap: response({ url: 'https://example.com/sitemap.xml', body: '<urlset></urlset>' }),
    httpVersion: response(),
    ...extra,
  };
}

function statuses(ctx: AuditContext) {
  return Object.fromEntries(ALL_CHECKS.map((check) => check(ctx)).map((f) => [f.checkId, f.status]));
}

const GOOD_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Acme Plumbing · Emergency repairs in Austin</title>
  <meta name="description" content="Licensed Austin plumbers for emergency repairs, water heaters and leak detection. Available 24/7 with upfront pricing.">
  <link rel="canonical" href="https://example.com/">
  <meta property="og:title" content="Acme Plumbing">
  <meta property="og:description" content="Emergency plumbing in Austin">
  <meta property="og:image" content="https://example.com/og.png">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Plumber","name":"Acme"}</script>
  <script src="/app.js" defer></script>
</head>
<body><h1>Acme Plumbing</h1><img src="/van.jpg" alt="Our van"><img src="/divider.svg" alt=""></body>
</html>`;

const GOOD_HEADERS: IncomingHttpHeaders = {
  'content-type': 'text/html; charset=utf-8',
  'content-encoding': 'br',
  'cache-control': 'public, max-age=0, must-revalidate',
  'strict-transport-security': 'max-age=63072000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=()',
  'content-security-policy': "default-src 'self'; script-src 'self' 'nonce-abc'; frame-ancestors 'self'",
  'set-cookie': ['sid=1; Secure; HttpOnly; SameSite=Lax'],
};

describe('catalog', () => {
  it('has a check implementation for every catalog entry and vice versa', () => {
    const implemented = Object.keys(statuses(context(GOOD_HTML, GOOD_HEADERS))).sort();
    expect(implemented).toEqual(AUDIT_CHECKS.map((check) => check.id).sort());
  });
});

describe('a well-built site', () => {
  it('passes every check', () => {
    const result = statuses(context(GOOD_HTML, GOOD_HEADERS));
    const failing = Object.entries(result).filter(([, status]) => status === 'fail');
    expect(failing).toEqual([]);
  });
});

describe('a neglected site', () => {
  const html = `<html><head><script src="http://cdn.example.net/jquery.js"></script></head>
    <body><center><h1>A</h1><h1>B</h1><img src="http://example.com/a.png"></center>
    <!-- <h1>commented out</h1> --></body></html>`;
  const headers: IncomingHttpHeaders = {
    'x-powered-by': 'PHP/7.2.1',
    'set-cookie': ['PHPSESSID=abc; path=/'],
    'x-robots-tag': 'noindex',
  };
  const result = statuses(
    context(html, headers, {
      robotsTxt: response({ body: 'User-agent: *\nDisallow: /' }),
      sitemap: null,
      httpVersion: response({ url: 'http://example.com/' }),
    }),
  );

  it.each([
    'seo.title',
    'seo.meta-description',
    'seo.h1',
    'seo.canonical',
    'seo.lang',
    'seo.viewport',
    'seo.open-graph',
    'seo.image-alt',
    'seo.robots-txt',
    'seo.sitemap',
    'seo.indexable',
    'seo.structured-data',
    'security.https',
    'security.hsts',
    'security.csp',
    'security.cookies',
    'security.mixed-content',
    'security.server-disclosure',
    'maintainability.doctype',
    'maintainability.deprecated-html',
    'maintainability.render-blocking',
    'maintainability.cache-control',
  ])('fails %s', (id) => {
    expect(result[id]).toBe('fail');
  });
});

describe('certificates', () => {
  const check = SECURITY_CHECKS[9];

  it('fails an untrusted certificate as critical (catalog default)', () => {
    const ctx = context(GOOD_HTML, GOOD_HEADERS);
    ctx.page = { ...ctx.page, certificate: { isTrusted: false, error: 'CERT_HAS_EXPIRED' } };
    expect(check(ctx)).toMatchObject({ checkId: 'security.tls-certificate', status: 'fail', severity: undefined });
  });

  it('warns when the certificate expires soon', () => {
    const ctx = context(GOOD_HTML, GOOD_HEADERS);
    ctx.page = { ...ctx.page, certificate: { isTrusted: true, validTo: new Date(Date.now() + 3 * 864e5).toISOString() } };
    expect(check(ctx)).toMatchObject({ status: 'fail', severity: 'warning' });
  });
});

describe('robots.txt helpers', () => {
  it('detects a full block for all agents only', () => {
    expect(blocksEverything('User-agent: *\nDisallow: /')).toBe(true);
    expect(blocksEverything('User-agent: Googlebot\nUser-agent: *\nDisallow: /')).toBe(true);
    expect(blocksEverything('User-agent: BadBot\nDisallow: /\n\nUser-agent: *\nDisallow: /admin')).toBe(false);
    expect(blocksEverything('User-agent: *\nDisallow:')).toBe(false);
  });

  it('reads sitemap lines', () => {
    expect(sitemapsFromRobots('User-agent: *\nSitemap: https://example.com/s.xml\nsitemap:https://example.com/b.xml')).toEqual([
      'https://example.com/s.xml',
      'https://example.com/b.xml',
    ]);
  });
});

describe('cspIssues', () => {
  it('accepts nonce-based and strict-dynamic policies', () => {
    expect(cspIssues("script-src 'self' 'nonce-x' 'unsafe-inline'")).toEqual([]);
    expect(cspIssues("script-src 'strict-dynamic' 'nonce-x' https: 'unsafe-inline'")).toEqual([]);
  });

  it('flags weak policies', () => {
    expect(cspIssues("default-src * 'unsafe-inline' 'unsafe-eval'")).toHaveLength(3);
    expect(cspIssues('img-src *')).toEqual(['no script-src or default-src']);
  });
});

describe('parseHtml', () => {
  it('ignores tags inside comments and scripts', () => {
    const page = parseHtml('<!-- <h1>x</h1> --><script>document.write("<h1>y</h1>")</script><h1>z</h1>');
    expect(page.tags.filter((t) => t.name === 'h1')).toHaveLength(1);
  });

  it.each([
    ['unclosed tags', '<a'.repeat(1_000_000)],
    ['unclosed scripts', '<script>'.repeat(250_000)],
    ['unclosed comments', '<!--'.repeat(500_000)],
    ['unclosed titles', '<title>'.repeat(280_000)],
    ['unclosed quotes', '<a b="'.repeat(300_000)],
  ])('stays linear on hostile markup (%s, ~2 MB)', (_label, html) => {
    const started = performance.now();
    parseHtml(html);
    expect(performance.now() - started).toBeLessThan(1_000);
  });

  it('ends the head implicitly when </head> and <body> are omitted', () => {
    const page = parseHtml('<!doctype html><title>x</title><script src="a.js"></script><p>hi</p><script src="b.js"></script>');
    expect(page.scripts.map((s) => [s.attrs.src, s.isInHead])).toEqual([
      ['a.js', true],
      ['b.js', false],
    ]);
    expect(MAINTAINABILITY_CHECKS[6](context('<!doctype html><title>x</title><script src="a.js"></script><p>hi</p>'))).toMatchObject({
      checkId: 'maintainability.render-blocking',
      status: 'fail',
    });
  });

  it('reads robots.txt sitemaps in linear time', () => {
    const started = performance.now();
    sitemapsFromRobots('\n'.repeat(256 * 1024));
    expect(performance.now() - started).toBeLessThan(500);
  });

  it('decodes entities in the title and attributes', () => {
    const page = parseHtml('<title>Tom &amp; Jerry&#39;s</title><img alt="a &quot;b&quot;">');
    expect(page.title).toBe("Tom & Jerry's");
    expect(page.tags.find((t) => t.name === 'img')?.attrs.alt).toBe('a "b"');
  });
});
