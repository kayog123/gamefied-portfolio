import 'server-only';
import { MAX_HTML_BYTES, SLOW_RESPONSE_MS } from '../../audit.constants';
import { type Check, fail, getHeader, listSome, pass, plural } from './check-helpers';

const DEPRECATED_TAGS = ['font', 'center', 'marquee', 'blink', 'frameset', 'frame', 'big', 'strike', 'tt', 'acronym', 'applet', 'basefont'];

/** Script types browsers don't execute (data blocks, templates), so they never block rendering. */
const NON_SCRIPT_TYPE = /^(application\/(ld\+)?json|text\/(template|x-template|html|plain)|importmap|speculationrules)$/i;

const doctype: Check = ({ html }) =>
  html.hasDoctype ? pass('maintainability.doctype') : fail('maintainability.doctype', 'The page doesn’t start with <!doctype html>.');

const htmlSize: Check = ({ page }) => {
  const size = formatKb(page.bodyBytes);
  if (page.isTruncated) return fail('maintainability.html-size', `The HTML is over ${size}.`);
  if (page.bodyBytes > MAX_HTML_BYTES) return fail('maintainability.html-size', `The HTML is ${size}.`);
  return pass('maintainability.html-size', `${size} of HTML.`);
};

const compression: Check = ({ page }) => {
  const encoding = getHeader(page.headers, 'content-encoding')?.toLowerCase();
  if (encoding && /\b(br|gzip|deflate|zstd)\b/.test(encoding)) return pass('maintainability.compression', `Served with ${encoding}.`);
  if (page.bodyBytes < 1024) return pass('maintainability.compression', 'The page is too small to need compression.');
  return fail('maintainability.compression', `${formatKb(page.bodyBytes)} of HTML sent uncompressed.`);
};

const cacheControl: Check = ({ page }) => {
  const value = getHeader(page.headers, 'cache-control');
  return value ? pass('maintainability.cache-control', value) : fail('maintainability.cache-control', 'No Cache-Control header.');
};

const responseTime: Check = ({ page }) => {
  const evidence = `First byte after ${page.ttfbMs.toLocaleString('en-US')} ms (measured from our server).`;
  return page.ttfbMs <= SLOW_RESPONSE_MS ? pass('maintainability.response-time', evidence) : fail('maintainability.response-time', evidence);
};

const deprecatedHtml: Check = ({ html }) => {
  const found = [...new Set(html.tags.filter(({ name }) => DEPRECATED_TAGS.includes(name)).map(({ name }) => `<${name}>`))];
  return found.length === 0 ? pass('maintainability.deprecated-html') : fail('maintainability.deprecated-html', `Uses ${listSome(found)}.`);
};

const renderBlocking: Check = ({ html }) => {
  const blocking = html.scripts.filter(({ attrs, isInHead }) => {
    if (!isInHead || !attrs.src) return false;
    const type = attrs.type?.trim() ?? '';
    if (type.toLowerCase() === 'module' || NON_SCRIPT_TYPE.test(type)) return false;
    return !('async' in attrs) && !('defer' in attrs);
  });
  if (blocking.length === 0) return pass('maintainability.render-blocking');
  return fail(
    'maintainability.render-blocking',
    `${plural(blocking.length, 'script')} block rendering: ${listSome(blocking.map(({ attrs }) => attrs.src))}.`,
  );
};

export const MAINTAINABILITY_CHECKS: Check[] = [doctype, htmlSize, compression, cacheControl, responseTime, deprecatedHtml, renderBlocking];

function formatKb(bytes: number): string {
  return `${Math.round(bytes / 1024).toLocaleString('en-US')} KB`;
}
