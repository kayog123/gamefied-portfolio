import 'server-only';
import { groq } from 'next-sanity';

// `dateTime()` matters: Studio stores publishedAt with the editor's UTC offset (e.g. +08:00), and a plain
// string compare against now() (which ends in "Z") would hide posts for hours after their real publish time.
const PUBLISHED = `_type == "post" && defined(slug.current) && dateTime(publishedAt) <= dateTime(now())`;

const IMAGE = `{
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  alt
}`;

const SUMMARY = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  topic,
  publishedAt,
  "wordCount": length(string::split(pt::text(body), " ")),
  "cover": coverImage${IMAGE}
`;

export const POSTS_QUERY = groq`*[${PUBLISHED}] | order(publishedAt desc) {${SUMMARY}}`;

export const POST_QUERY = groq`*[${PUBLISHED} && slug.current == $slug][0] {
  ${SUMMARY},
  updatedAt,
  tags,
  seoDescription,
  body[] {
    ...,
    _type == "image" => { ..., "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }
  }
}`;

export const POST_SLUGS_QUERY = groq`*[${PUBLISHED}] { "slug": slug.current, "date": coalesce(updatedAt, publishedAt) }`;

/** Raw row shapes returned by the queries above. */
export type RawImage = { url?: string; width?: number; height?: number; alt?: string } | null;
export type RawSummary = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  topic: string;
  publishedAt: string;
  wordCount: number | null;
  cover: RawImage;
};
