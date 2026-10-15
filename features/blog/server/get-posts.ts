import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import type { PortableTextBlock } from 'next-sanity';
import { BLOG_CACHE_TAG, WORDS_PER_MINUTE } from '../blog.constants';
import type { BlogImage, Post, PostSummary } from '../blog.types';
import {
  POST_QUERY,
  POST_SLUGS_QUERY,
  POSTS_QUERY,
  type RawImage,
  type RawSummary,
} from './blog.queries';
import { sanityClient } from './sanity-client';

function toImage(raw: RawImage, fallbackAlt: string): BlogImage | undefined {
  if (!raw?.url || !raw.width || !raw.height) return undefined;
  return { url: raw.url, width: raw.width, height: raw.height, alt: raw.alt ?? fallbackAlt };
}

function toSummary(row: RawSummary): PostSummary {
  return {
    id: row._id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    topic: row.topic,
    publishedAt: row.publishedAt,
    readingMinutes: Math.max(1, Math.ceil((row.wordCount ?? 0) / WORDS_PER_MINUTE)),
    cover: toImage(row.cover, row.title),
  };
}

/** All published posts, newest first. Empty when Sanity isn't configured. */
export async function getPosts(): Promise<PostSummary[]> {
  'use cache';
  cacheTag(BLOG_CACHE_TAG);
  cacheLife('hours');

  if (!sanityClient) return [];
  const rows = await sanityClient.fetch<RawSummary[]>(POSTS_QUERY);
  return rows.map(toSummary);
}

/** One published post by slug, or `null`. */
export async function getPost(slug: string): Promise<Post | null> {
  'use cache';
  cacheTag(BLOG_CACHE_TAG);
  cacheLife('hours');

  if (!sanityClient) return null;
  const row = await sanityClient.fetch<
    | (RawSummary & { updatedAt?: string; tags?: string[]; seoDescription?: string; body?: PortableTextBlock[] })
    | null
  >(POST_QUERY, { slug });
  if (!row) return null;

  return {
    ...toSummary(row),
    updatedAt: row.updatedAt ?? undefined,
    tags: row.tags ?? [],
    seoDescription: row.seoDescription ?? undefined,
    body: row.body ?? [],
  };
}

/** Slug + last-modified date for every published post (static params, sitemap). */
export async function getPostSlugs(): Promise<{ slug: string; date: string }[]> {
  'use cache';
  cacheTag(BLOG_CACHE_TAG);
  cacheLife('hours');

  if (!sanityClient) return [];
  return sanityClient.fetch<{ slug: string; date: string }[]>(POST_SLUGS_QUERY);
}

/** Up to three other posts: same topic first, then the newest. */
export async function getRelatedPosts(post: Post): Promise<PostSummary[]> {
  const others = (await getPosts()).filter((p) => p.id !== post.id);
  const sameTopic = others.filter((p) => p.topic === post.topic);
  const rest = others.filter((p) => p.topic !== post.topic);
  return [...sameTopic, ...rest].slice(0, 3);
}
