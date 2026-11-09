import 'server-only';
import { DESCRIPTION_LENGTH, TITLE_LENGTH } from '../../audit.constants';
import { findTags, getMeta } from '../parse-html';
import { type Check, fail, getHeader, listSome, pass, plural } from './check-helpers';

const title: Check = ({ html }) => {
  const text = html.title;
  if (!text) return fail('seo.title', 'No <title> found.');
  const length = [...text].length;
  if (length < TITLE_LENGTH.min) return fail('seo.title', `The title is only ${length} characters: “${text}”.`);
  if (length > TITLE_LENGTH.max) return fail('seo.title', `The title is ${length} characters, so search results will cut it off.`);
  return pass('seo.title', `“${text}” (${length} characters).`);
};

const metaDescription: Check = ({ html }) => {
  const text = getMeta(html, 'description')?.trim();
  if (!text) return fail('seo.meta-description', 'No meta description found.');
  const length = [...text].length;
  if (length < DESCRIPTION_LENGTH.min) return fail('seo.meta-description', `The description is only ${length} characters.`);
  if (length > DESCRIPTION_LENGTH.max) return fail('seo.meta-description', `The description is ${length} characters, so it will be truncated.`);
  return pass('seo.meta-description', `${length} characters.`);
};

const h1: Check = ({ html }) => {
  const count = findTags(html, 'h1').length;
  if (count === 1) return pass('seo.h1');
  return fail('seo.h1', count === 0 ? 'No <h1> on the page.' : `Found ${count} <h1> headings.`);
};

const canonical: Check = ({ html, page }) => {
  const link = findTags(html, 'link').find(({ attrs }) => attrs.rel?.toLowerCase().split(/\s+/).includes('canonical'));
  const href = link?.attrs.href?.trim();
  if (!href) return fail('seo.canonical', 'No canonical link found.');
  try {
    return pass('seo.canonical', new URL(href, page.url).toString());
  } catch {
    return fail('seo.canonical', `The canonical URL “${href}” isn’t valid.`);
  }
};

const lang: Check = ({ html }) =>
  html.htmlLang?.trim() ? pass('seo.lang', `lang="${html.htmlLang.trim()}"`) : fail('seo.lang', 'The <html> element has no lang attribute.');

const viewport: Check = ({ html }) => {
  const content = getMeta(html, 'viewport');
  if (!content) return fail('seo.viewport', 'No viewport meta tag found.');
  if (!/width\s*=\s*device-width/i.test(content)) return fail('seo.viewport', `The viewport doesn’t use width=device-width (“${content}”).`);
  return pass('seo.viewport');
};

const openGraph: Check = ({ html }) => {
  const missing = ['og:title', 'og:description', 'og:image'].filter((key) => !getMeta(html, key)?.trim());
  return missing.length === 0 ? pass('seo.open-graph') : fail('seo.open-graph', `Missing ${listSome(missing)}.`);
};

const imageAlt: Check = ({ html }) => {
  const images = findTags(html, 'img');
  if (images.length === 0) return pass('seo.image-alt', 'No images on the page.');
  const missing = images.filter(({ attrs }) => !('alt' in attrs)).length;
  if (missing === 0) return pass('seo.image-alt', `All ${plural(images.length, 'image')} have alt text.`);
  return fail('seo.image-alt', `${missing} of ${plural(images.length, 'image')} have no alt attribute.`);
};

const robotsTxt: Check = ({ robotsTxt }) => {
  if (!robotsTxt || robotsTxt.status !== 200) return fail('seo.robots-txt', 'No robots.txt found.', 'info');
  if (blocksEverything(robotsTxt.body)) return fail('seo.robots-txt', 'robots.txt blocks all crawlers from the whole site (Disallow: /).');
  return pass('seo.robots-txt');
};

const sitemap: Check = ({ sitemap }) => {
  if (!sitemap || sitemap.status !== 200) return fail('seo.sitemap', 'No sitemap found in robots.txt or at /sitemap.xml.');
  if (!/<(urlset|sitemapindex)\b/i.test(sitemap.body)) return fail('seo.sitemap', 'The sitemap isn’t valid XML sitemap markup.');
  return pass('seo.sitemap', sitemap.url);
};

const indexable: Check = ({ html, page }) => {
  const sources = [
    ['robots meta tag', getMeta(html, 'robots')],
    ['googlebot meta tag', getMeta(html, 'googlebot')],
    ['X-Robots-Tag header', getHeader(page.headers, 'x-robots-tag')],
  ] as const;
  const blocking = sources.filter(([, value]) => value && /\bnoindex\b|\bnone\b/i.test(value)).map(([source]) => source);
  return blocking.length === 0 ? pass('seo.indexable') : fail('seo.indexable', `noindex set by the ${listSome(blocking)}.`);
};

const structuredData: Check = ({ html }) => {
  const blocks = html.scripts.filter(({ attrs }) => attrs.type?.trim().toLowerCase() === 'application/ld+json');
  if (blocks.length === 0) return fail('seo.structured-data', 'No JSON-LD structured data found.');
  const types = new Set<string>();
  let invalid = 0;
  for (const { content } of blocks) {
    try {
      collectTypes(JSON.parse(content), types);
    } catch {
      invalid += 1;
    }
  }
  if (invalid > 0) return fail('seo.structured-data', `${invalid} of ${plural(blocks.length, 'JSON-LD block')} isn’t valid JSON.`);
  return pass('seo.structured-data', types.size > 0 ? `Types: ${listSome([...types], 5)}.` : undefined);
};

export const SEO_CHECKS: Check[] = [
  title,
  metaDescription,
  h1,
  canonical,
  lang,
  viewport,
  openGraph,
  imageAlt,
  robotsTxt,
  sitemap,
  indexable,
  structuredData,
];

/** Sitemap URLs listed in robots.txt (`Sitemap: …`). */
export function sitemapsFromRobots(robotsTxt: string): string[] {
  // `[ \t]`, not `\s`: with the m flag, `^\s*` would rescan runs of blank lines (quadratic).
  return [...robotsTxt.matchAll(/^[ \t]*sitemap[ \t]*:[ \t]*(\S+)/gim)].map((match) => match[1]);
}

/** True when the `User-agent: *` group disallows the root path. */
export function blocksEverything(robotsTxt: string): boolean {
  let isWildcardGroup = false;
  let isInAgentLines = false;
  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const match = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!match) continue;
    const field = match[1].toLowerCase();
    const value = match[2].trim();
    if (field === 'user-agent') {
      // Consecutive User-agent lines share one group.
      isWildcardGroup = isInAgentLines ? isWildcardGroup || value === '*' : value === '*';
      isInAgentLines = true;
      continue;
    }
    isInAgentLines = false;
    if (isWildcardGroup && field === 'disallow' && value === '/') return true;
  }
  return false;
}

function collectTypes(node: unknown, types: Set<string>): void {
  if (Array.isArray(node)) {
    node.forEach((item) => collectTypes(item, types));
    return;
  }
  if (!node || typeof node !== 'object') return;
  const record = node as Record<string, unknown>;
  const type = record['@type'];
  if (typeof type === 'string') types.add(type);
  else if (Array.isArray(type)) type.forEach((t) => typeof t === 'string' && types.add(t));
  if (Array.isArray(record['@graph'])) collectTypes(record['@graph'], types);
}
