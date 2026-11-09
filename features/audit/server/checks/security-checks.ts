import 'server-only';
import { CERT_EXPIRY_WARNING_DAYS, HSTS_MIN_MAX_AGE } from '../../audit.constants';
import { findTags } from '../parse-html';
import { type AuditContext, type Check, fail, getHeader, isHttpsUrl, listSome, pass, plural } from './check-helpers';

const DAY_MS = 24 * 60 * 60 * 1000;

const https: Check = ({ page, httpVersion }) => {
  if (!isHttpsUrl(page.url)) return fail('security.https', 'The page is served over plain HTTP.');
  if (!httpVersion) return pass('security.https', 'HTTPS only (port 80 doesn’t answer).');
  if (!isHttpsUrl(httpVersion.url)) return fail('security.https', 'http:// URLs don’t redirect to https://.');
  return pass('security.https', 'http:// redirects to https://.');
};

const hsts: Check = ({ page }) => {
  if (!isHttpsUrl(page.url)) return fail('security.hsts', 'HSTS needs HTTPS first.');
  const value = getHeader(page.headers, 'strict-transport-security');
  if (!value) return fail('security.hsts', 'No Strict-Transport-Security header.');
  const maxAge = Number(value.match(/max-age\s*=\s*"?(\d+)/i)?.[1] ?? 0);
  if (maxAge < HSTS_MIN_MAX_AGE) return fail('security.hsts', `max-age is ${maxAge} seconds; use at least 6 months.`);
  return pass('security.hsts', value);
};

const contentTypeOptions: Check = ({ page }) =>
  getHeader(page.headers, 'x-content-type-options')?.toLowerCase().includes('nosniff')
    ? pass('security.content-type-options')
    : fail('security.content-type-options', 'X-Content-Type-Options: nosniff is not set.');

const referrerPolicy: Check = ({ page }) => {
  const value = getHeader(page.headers, 'referrer-policy');
  if (!value) return fail('security.referrer-policy', 'No Referrer-Policy header (browsers fall back to their default).', 'info');
  if (/unsafe-url/i.test(value)) return fail('security.referrer-policy', 'Referrer-Policy is unsafe-url, which leaks full URLs.');
  return pass('security.referrer-policy', value);
};

const permissionsPolicy: Check = ({ page }) =>
  getHeader(page.headers, 'permissions-policy')
    ? pass('security.permissions-policy')
    : fail('security.permissions-policy', 'No Permissions-Policy header.');

const clickjacking: Check = ({ page }) => {
  const frameOptions = getHeader(page.headers, 'x-frame-options')?.toLowerCase();
  const csp = getHeader(page.headers, 'content-security-policy') ?? '';
  if (/frame-ancestors/i.test(csp)) return pass('security.clickjacking', 'CSP frame-ancestors is set.');
  if (frameOptions === 'deny' || frameOptions === 'sameorigin') return pass('security.clickjacking', `X-Frame-Options: ${frameOptions.toUpperCase()}.`);
  return fail('security.clickjacking', 'Neither X-Frame-Options nor CSP frame-ancestors is set.');
};

const csp: Check = ({ page, html }) => {
  const policy =
    getHeader(page.headers, 'content-security-policy') ??
    findTags(html, 'meta').find(({ attrs }) => attrs['http-equiv']?.toLowerCase() === 'content-security-policy')?.attrs.content;
  if (!policy) {
    const reportOnly = getHeader(page.headers, 'content-security-policy-report-only');
    return fail('security.csp', reportOnly ? 'Only a report-only CSP is set, so nothing is enforced.' : 'No Content-Security-Policy.');
  }
  const issues = cspIssues(policy);
  return issues.length === 0 ? pass('security.csp') : fail('security.csp', `Weak policy: ${issues.join('; ')}.`);
};

const cookies: Check = ({ page }) => {
  const raw = page.headers['set-cookie'] ?? [];
  if (raw.length === 0) return pass('security.cookies', 'No cookies set on this page.');
  const isHttps = isHttpsUrl(page.url);
  const problems: string[] = [];
  for (const cookie of raw) {
    const [pair, ...attributes] = cookie.split(';').map((part) => part.trim());
    const name = pair.split('=')[0];
    const flags = attributes.map((attribute) => attribute.split('=')[0].toLowerCase());
    const missing = [
      isHttps && !flags.includes('secure') && 'Secure',
      !flags.includes('samesite') && 'SameSite',
      /sess|sid|auth|token|jwt/i.test(name) && !flags.includes('httponly') && 'HttpOnly',
    ].filter(Boolean);
    if (missing.length > 0) problems.push(`${name} (no ${missing.join(', ')})`);
  }
  return problems.length === 0
    ? pass('security.cookies', `${plural(raw.length, 'cookie')}, all flagged.`)
    : fail('security.cookies', `${listSome(problems)}.`);
};

const mixedContent: Check = ({ page, html }) => {
  if (!isHttpsUrl(page.url)) return pass('security.mixed-content', 'Not applicable: the page isn’t served over HTTPS.');
  const insecure = insecureSubresources(html.tags);
  return insecure.length === 0
    ? pass('security.mixed-content')
    : fail('security.mixed-content', `${plural(insecure.length, 'resource')} loaded over http://: ${listSome(insecure)}.`);
};

const tlsCertificate: Check = ({ page }) => {
  // Already penalized by `security.https`, so it only counts lightly here.
  if (!isHttpsUrl(page.url) || !page.certificate) return fail('security.tls-certificate', 'No TLS certificate: the site isn’t served over HTTPS.', 'info');
  const { isTrusted, error, validTo } = page.certificate;
  if (!isTrusted) return fail('security.tls-certificate', `Browsers won’t trust the certificate (${error ?? 'unknown reason'}).`);
  if (validTo) {
    const daysLeft = Math.floor((Date.parse(validTo) - Date.now()) / DAY_MS);
    if (daysLeft < CERT_EXPIRY_WARNING_DAYS) {
      return fail('security.tls-certificate', `The certificate expires in ${plural(daysLeft, 'day')}.`, 'warning');
    }
    return pass('security.tls-certificate', `Valid until ${validTo.slice(0, 10)}.`);
  }
  return pass('security.tls-certificate');
};

const serverDisclosure: Check = ({ page }) => {
  const leaks = [
    ['X-Powered-By', getHeader(page.headers, 'x-powered-by')],
    ['Server', getHeader(page.headers, 'server')],
    ['X-AspNet-Version', getHeader(page.headers, 'x-aspnet-version')],
    ['X-AspNetMvc-Version', getHeader(page.headers, 'x-aspnetmvc-version')],
  ]
    .filter(([name, value]) => value && (name !== 'Server' || /\d/.test(value)))
    .map(([name, value]) => `${name}: ${value}`);
  return leaks.length === 0 ? pass('security.server-disclosure') : fail('security.server-disclosure', `${listSome(leaks)}.`);
};

export const SECURITY_CHECKS: Check[] = [
  https,
  hsts,
  contentTypeOptions,
  referrerPolicy,
  permissionsPolicy,
  clickjacking,
  csp,
  cookies,
  mixedContent,
  tlsCertificate,
  serverDisclosure,
];

/** Problems with a CSP's script policy (script-src, falling back to default-src). */
export function cspIssues(policy: string): string[] {
  const directives = new Map<string, string[]>();
  for (const part of policy.split(';')) {
    const [name, ...sources] = part.trim().split(/\s+/);
    if (name && !directives.has(name.toLowerCase())) directives.set(name.toLowerCase(), sources.map((s) => s.toLowerCase()));
  }
  const scriptSources = directives.get('script-src') ?? directives.get('default-src');
  if (!scriptSources) return ['no script-src or default-src'];

  const issues: string[] = [];
  const hasNonceOrHash = scriptSources.some((s) => /^'(nonce|sha256|sha384|sha512)-/.test(s));
  const isStrictDynamic = scriptSources.includes("'strict-dynamic'");
  if (scriptSources.includes("'unsafe-inline'") && !hasNonceOrHash && !isStrictDynamic) issues.push("'unsafe-inline' scripts allowed");
  if (scriptSources.includes("'unsafe-eval'")) issues.push("'unsafe-eval' allowed");
  if (!isStrictDynamic && scriptSources.some((s) => s === '*' || s === 'https:' || s === 'http:' || s === 'data:')) {
    issues.push('scripts allowed from any host');
  }
  return issues;
}

type Tag = AuditContext['html']['tags'][number];

const SUBRESOURCE_ATTRIBUTES: Record<string, string[]> = {
  script: ['src'],
  img: ['src', 'srcset'],
  iframe: ['src'],
  audio: ['src'],
  video: ['src', 'poster'],
  source: ['src', 'srcset'],
  track: ['src'],
  embed: ['src'],
  object: ['data'],
};

function insecureSubresources(tags: Tag[]): string[] {
  const found = new Set<string>();
  for (const { name, attrs } of tags) {
    const keys =
      name === 'link' && /\b(stylesheet|preload|modulepreload|icon)\b/i.test(attrs.rel ?? '') ? ['href'] : SUBRESOURCE_ATTRIBUTES[name];
    for (const key of keys ?? []) {
      for (const candidate of (attrs[key] ?? '').split(',')) {
        const url = candidate.trim().split(/\s+/)[0];
        if (/^http:\/\//i.test(url)) found.add(url);
      }
    }
  }
  return [...found];
}
