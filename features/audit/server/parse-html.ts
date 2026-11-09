import 'server-only';

export type Attributes = Record<string, string>;

export type ParsedTag = { name: string; attrs: Attributes; isInHead: boolean };

export type ParsedScript = { attrs: Attributes; content: string; isInHead: boolean };

export type ParsedPage = {
  hasDoctype: boolean;
  htmlLang?: string;
  title?: string;
  tags: ParsedTag[];
  scripts: ParsedScript[];
};

const TAG_NAME = /^<([a-zA-Z][a-zA-Z0-9-]*)/;
const ATTRIBUTE = /([^\s=/"'>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

/** Elements whose content is raw text: tags inside them aren't tags. */
const RAW_TEXT = new Set(['script', 'style', 'title', 'textarea']);

/** Elements that may appear in <head>. The first other element implicitly ends the head, as in browsers. */
const HEAD_CONTENT = new Set(['html', 'head', 'title', 'meta', 'link', 'script', 'style', 'base', 'noscript', 'template']);

type RawTag = { name: string; attrs: Attributes; start: number };
type RawScript = { attrs: Attributes; content: string; start: number };

/**
 * A small, dependency-free HTML scanner: enough to audit tags and attributes, not a full DOM.
 * It's a single forward pass built on `indexOf`, so its cost is linear in the page size even for
 * hostile markup (unclosed tags, comments or quotes) — never a backtracking regex over the body.
 */
export function parseHtml(html: string): ParsedPage {
  const lower = html.toLowerCase();
  const tags: RawTag[] = [];
  const scripts: RawScript[] = [];
  let title: string | undefined;
  let headEnd = -1;

  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) break;

    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt + 4);
      if (end === -1) break; // an unclosed comment swallows the rest of the page
      i = end + 3;
      continue;
    }

    if (html.startsWith('</', lt)) {
      if (headEnd === -1 && /^<\/head[\s>/]/.test(lower.slice(lt, lt + 7))) headEnd = lt;
      const gt = html.indexOf('>', lt);
      if (gt === -1) break;
      i = gt + 1;
      continue;
    }

    const nameMatch = TAG_NAME.exec(html.slice(lt, lt + 64));
    if (!nameMatch) {
      i = lt + 1; // "<" in text, "<!doctype", "<?xml"…
      continue;
    }

    const name = nameMatch[1].toLowerCase();
    const attrsStart = lt + nameMatch[0].length;
    const gt = findTagEnd(html, attrsStart);
    if (gt === -1) break;
    const attrs = parseAttributes(html.slice(attrsStart, gt));
    tags.push({ name, attrs, start: lt });
    if (headEnd === -1 && name === 'body') headEnd = lt;
    i = gt + 1;

    if (RAW_TEXT.has(name)) {
      const close = lower.indexOf(`</${name}`, i);
      const content = html.slice(i, close === -1 ? html.length : close);
      if (name === 'script') scripts.push({ attrs, content, start: lt });
      if (name === 'title' && title === undefined) title = decodeEntities(content).replace(/\s+/g, ' ').trim();
      if (close === -1) break;
      i = close;
    }
  }

  if (headEnd === -1) headEnd = tags.find((tag) => !HEAD_CONTENT.has(tag.name))?.start ?? html.length;

  return {
    hasDoctype: /^\s*<!doctype\s+html\b/i.test(html.slice(0, 256).replace(/^﻿/, '')),
    htmlLang: tags.find((tag) => tag.name === 'html')?.attrs.lang,
    title,
    tags: tags.map(({ name, attrs, start }) => ({ name, attrs, isInHead: start < headEnd })),
    scripts: scripts.map(({ attrs, content, start }) => ({ attrs, content, isInHead: start < headEnd })),
  };
}

/** Index of the `>` that closes a start tag, skipping quoted attribute values; -1 if it never closes. */
function findTagEnd(html: string, from: number): number {
  let j = from;
  while (j < html.length) {
    const char = html[j];
    if (char === '>') return j;
    if (char === '"' || char === "'") {
      const close = html.indexOf(char, j + 1);
      if (close === -1) return -1;
      j = close + 1;
      continue;
    }
    j++;
  }
  return -1;
}

export function parseAttributes(source: string): Attributes {
  const attrs: Attributes = {};
  for (const match of source.matchAll(ATTRIBUTE)) {
    const name = match[1].toLowerCase();
    if (name in attrs) continue; // the first occurrence wins, like in browsers
    attrs[name] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attrs;
}

/** All tags of a name, e.g. `findTags(page, 'meta')`. */
export function findTags(page: ParsedPage, name: string): ParsedTag[] {
  return page.tags.filter((tag) => tag.name === name);
}

/** Content of `<meta name|property="…">`, matched case-insensitively. */
export function getMeta(page: ParsedPage, key: string): string | undefined {
  const wanted = key.toLowerCase();
  const tag = findTags(page, 'meta').find(
    ({ attrs }) => attrs.name?.toLowerCase() === wanted || attrs.property?.toLowerCase() === wanted,
  );
  return tag?.attrs.content;
}

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]{2,8});/gi, (entity, code: string) => {
    if (code[0] === '#') {
      const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(point) && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
  });
}
