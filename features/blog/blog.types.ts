import type { PortableTextBlock } from 'next-sanity';

export type BlogImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

/** What the index page and cards need. */
export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  topic: string;
  /** ISO date string. */
  publishedAt: string;
  readingMinutes: number;
  cover?: BlogImage;
};

/** A full post, including the Portable Text body. */
export type Post = PostSummary & {
  updatedAt?: string;
  tags: string[];
  seoDescription?: string;
  body: PortableTextBlock[];
};

/** A heading pulled from the body for the "On this page" list. */
export type PostHeading = { id: string; text: string; key: string };
