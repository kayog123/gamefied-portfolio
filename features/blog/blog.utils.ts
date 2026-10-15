import type { PortableTextBlock } from 'next-sanity';
import { toPlainText } from 'next-sanity';
import type { PostHeading } from './blog.types';

/** "OCT 08 2026", matching the mono date labels used elsewhere (`formatBriefDate`). */
export function formatPostDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' })
    .toUpperCase()
    .replace(',', '');
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** The h2 blocks of a body, with stable anchor ids (suffixed if two headings collide). */
export function getHeadings(body: PortableTextBlock[]): PostHeading[] {
  const seen = new Map<string, number>();
  const headings: PostHeading[] = [];
  for (const block of body) {
    if (block._type !== 'block' || block.style !== 'h2') continue;
    const text = toPlainText([block]);
    const base = slugifyHeading(text) || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({ id: count ? `${base}-${count + 1}` : base, text, key: block._key ?? '' });
  }
  return headings;
}
